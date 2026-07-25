import { TFile, requestUrl } from 'obsidian';
import { PDFDocument, PDFHexString, PDFString, PDFPage } from 'pdf-lib';
import { Annotation, Link } from '../types';
import type PDFPlusExporterPlugin from '../main';
import { getRgb } from './colors';
import { PDFGeometry, Rect, TextContentItem } from './geometry';

interface PDFJSPage {
    getTextContent(params: { includeChars: boolean }): Promise<{ items: TextContentItem[] }>;
}

interface PDFJSDocument {
    getPage(pageNumber: number): Promise<PDFJSPage>;
}

export class PDFExporter {
    private pdfBufferCache = new Map<string, ArrayBuffer>();

    constructor(private plugin: PDFPlusExporterPlugin) {}

    private async getPdfBytes(file: TFile): Promise<ArrayBuffer> {
        if (this.pdfBufferCache.has(file.path)) {
            return this.pdfBufferCache.get(file.path)!.slice(0);
        }
        const buffer = await this.plugin.app.vault.readBinary(file);
        const text = new TextDecoder().decode(buffer.slice(0, 100)); // only check the start
        if (!text.startsWith("%PDF-")) {
            const fullText = new TextDecoder().decode(buffer);
            const urlMatch = fullText.match(/https?:\/\/[^\s"]+/);
            if (urlMatch) {
                const url = urlMatch[0];

                try {
                    const adapter = this.plugin.app.vault.adapter;
                    const configDir = this.plugin.app.vault.configDir;
                    const cachePath = `${configDir}/plugins/pdf-plus/dummy-cache/${await this.hashUrl(url)}`;
                    if (await adapter.exists(cachePath)) {
                        const cachedBuffer = await adapter.readBinary(cachePath);
                        this.pdfBufferCache.set(file.path, cachedBuffer);
                        return cachedBuffer.slice(0);
                    }
                } catch (e) {
                    console.debug("PDF Exporter: Error reading dummy cache", e);
                }

                const response = await requestUrl({ url });
                this.pdfBufferCache.set(file.path, response.arrayBuffer);
                return response.arrayBuffer.slice(0);
            }
        }
        this.pdfBufferCache.set(file.path, buffer);
        return buffer.slice(0);
    }

    private async hashUrl(url: string) {
        const msgUint8 = new TextEncoder().encode(url);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex + '.pdf';
    }

    // Consulta la API de Obsidian para obtener los backlinks que referencian al pdf especificado
    async getBacklinks(pdfSource: string): Promise<Record<string, Link[]> | null> {
        const file = this.plugin.app.metadataCache.getFirstLinkpathDest(pdfSource, "");
        if (!file) return null;
        
        // This requires dataview API usually. Let's see if we can use Obsidian's metadata cache
        const backlinks: Record<string, Link[]> = {};
        
        // However, the original code used Dataview. 
        // "const dataview = app.plugins.plugins.dataview"
        // Let's stick to Obsidian's native API. The problem is we need the exact position of the link to get the context.
        // `app.metadataCache.getFileCache(file)` has `.links` or `.embeds`.
        // We need to iterate over all markdown files, check their cache for links pointing to our pdfSource.

        const files = this.plugin.app.vault.getMarkdownFiles();
        for (const mdFile of files) {
            const cache = this.plugin.app.metadataCache.getFileCache(mdFile);
            if (!cache) continue;

            const links = [...(cache.links || []), ...(cache.embeds || [])];
            for (const link of links) {
                const linkPath = link.link.split('#')[0];
                if (!linkPath) continue;
                const targetFile = this.plugin.app.metadataCache.getFirstLinkpathDest(linkPath, mdFile.path);
                if (targetFile && targetFile.path === file.path && link.position) {
                    if (!backlinks[mdFile.path]) {
                        backlinks[mdFile.path] = [];
                    }
                    backlinks[mdFile.path]!.push({
                        displayText: link.displayText || "",
                        link: link.link || "",
                        original: link.original || "",
                        position: link.position
                    });
                }
            }
        }
        return backlinks;
    }

    // Filtra los backlinks por las fuentes especificadas
    filterBacklinksBySource(backlinks: Record<string, Link[]>, sources: string[]): Record<string, Link[]> {
        if (sources.length === 0) {
            return backlinks;
        }
        const filtered: Record<string, Link[]> = {};
        for (const source of sources) {
            if (backlinks[source]) {
                filtered[source] = backlinks[source];
            }
        }
        return filtered;
    }

    private async readSource(sourcePath: string): Promise<string[]> {
        const sourceFile = this.plugin.app.vault.getAbstractFileByPath(sourcePath);
        if (sourceFile instanceof TFile) {
            const contents = await this.plugin.app.vault.cachedRead(sourceFile);
            return contents.split("\n");
        }
        return [];
    }

    async getBacklinkContext(sourcePath: string, linkInfo: Link): Promise<string> {
        if (!linkInfo.position) return "";
        const startLine = linkInfo.position.start.line;
        const endLine = linkInfo.position.end.line;
        const lines = await this.readSource(sourcePath || "");
        if (lines.length === 0) return "";

        const context = lines.slice(startLine, endLine + 1);
        if (context.length > 0 && context[0] && context[0].trim().startsWith(">")) {
            let i = startLine + 1;
            while (i < lines.length && lines[i]?.startsWith('>')) {
                context.push(lines[i]!);
                i++;
            }
        }
        return context.join("\n");
    }

    private async getBacklinkData(sourcePath: string, linkInfo: Link): Promise<Annotation | null> {
        const context = await this.getBacklinkContext(sourcePath, linkInfo);
        
        const parts = linkInfo.link.split('#');
        const fragment = parts.length > 1 ? parts[1] : "";
        if (!fragment) return null;
        
        const fields = fragment.split('&').reduce((acc: Record<string, string>, pair) => {
            const splitPair = pair.split('=');
            const key = splitPair[0];
            const value = splitPair[1];
            if (key && value) {
                acc[key] = value;
            }
            return acc;
        }, {});

        const selectionStr = fields['selection'] ? fields['selection'] : "";
        const rectStr = fields['rect'] ? fields['rect'] : "";

        if (!selectionStr && !rectStr) return null;

        const selection = selectionStr ? selectionStr.split(",").map((coord) => parseInt(coord)) : undefined;
        const rect = rectStr ? rectStr.split(",").map((coord) => parseFloat(coord)) : undefined;

        const tags = (context.match(/#[a-zA-Z0-9_-]+/g) || []).filter(
            (tag) => tag !== "#page"
        );

        return {
            color: fields.color ? fields.color : this.plugin.settings.defaultAnnotationColor,
            text: linkInfo.displayText || "",
            page: fields.page ? parseInt(fields.page) : 1,
            link: linkInfo.link || "",
            original: linkInfo.original || "",
            selection: selection,
            rect: rect,
            context: context,
            tags: tags,
            source: sourcePath,
            title: null
        };
    }

    async getBacklinksData(backlinks: Record<string, Link[]>): Promise<Record<string, Annotation[]>> {
        const contexts: Record<string, Annotation[]> = {};
        for (const [source, links] of Object.entries(backlinks)) {
            for (const link of links) {
                if (!link.link.includes("selection") && !link.link.includes("rect")) continue;
                const data = await this.getBacklinkData(source, link);
                if (data) {
                    if (!contexts[source]) {
                        contexts[source] = [];
                    }
                    contexts[source].push(data);
                }
            }
        }
        return contexts;
    }

    filterAnnotations(annotations: Annotation[], colors: string[], tag?: string): Annotation[] {
        return annotations.filter((annotation) => {
            if (colors && colors.length > 0 && !colors.includes(annotation.color)) return false;
            if (tag && !annotation.tags.includes(tag)) return false;
            return true;
        });
    }

    private createArtificialChars(item: TextContentItem) {
        if (!item.transform || !item.width || !item.height) return [];
        const [a, , , d, e, f] = item.transform;
        const width = item.width * (a as number);
        const height = item.height * (d as number);
        const x1 = e as number;
        const y1 = (f as number) - height;
        const x2 = (e as number) + width;
        const y2 = f as number;

        return [{
            c: " ",
            u: " ",
            r: [x1, y1, x2, y2] as Rect
        }];
    }

    async addPDFRectangles(annotations: Annotation[], pdfSource: string): Promise<void> {
        const file = this.plugin.app.metadataCache.getFirstLinkpathDest(pdfSource, "");
        if (!file) throw new Error("PDF file not found");

        const buffer = await this.getPdfBytes(file);
        const pdf = await (window as unknown as { pdfjsLib: { getDocument: (buffer: ArrayBuffer) => { promise: Promise<PDFJSDocument> } } }).pdfjsLib.getDocument(buffer).promise;
        const geometry = new PDFGeometry();
        
        const annotationsByPage = new Map<number, Annotation[]>();
        for (const annotation of annotations) {
            if (!annotationsByPage.has(annotation.page)) {
                annotationsByPage.set(annotation.page, []);
            }
            annotationsByPage.get(annotation.page)!.push(annotation);
        }

        for (const [page, pageAnnotations] of annotationsByPage.entries()) {
            const pdfPage = await pdf.getPage(page);
            const pageContent = await pdfPage.getTextContent({includeChars: true});
            
            pageContent.items.forEach((item: TextContentItem) => {
                if (!item.chars && item.str) { item.chars = this.createArtificialChars(item); }
            });
            
            pageContent.items.forEach((item: TextContentItem) => {
                if (item.chars && item.str && item.chars.length < item.str.length) {
                    item.str = item.str.slice(0, item.chars.length);
                }
            });

            for (const annotation of pageAnnotations) {
                if (annotation.rect) {
                    annotation.rectangles = [annotation.rect as Rect];
                } else if (annotation.selection) {
                    const rectangles = geometry.computeMergedHighlightRects(pageContent.items, annotation.selection as [number, number, number, number]);
                    annotation.rectangles = rectangles;
                }
            }
        }
    }

    private removeCallout(text: string): string {
        if (!text.startsWith("> ")) return text;
        const lines = text.split("\n");
        let i = 1;
        while (i < lines.length && lines[i]?.startsWith("> >")) {
            i += 1;
        }
        let remainingLines = lines.slice(i).map(line => line.startsWith(">") ? line.slice(1) : line);
        if (remainingLines.length > 0 && remainingLines[0] && remainingLines[0].trim() === "") {
            remainingLines = remainingLines.slice(1);
        }
        return remainingLines.join("\n");
    }

    private cleanContext(text: string, reference: string, replacement = "␣", removeCallouts = true, removeBullet = true): string {
        if (replacement !== undefined && replacement !== null) {
            text = text.replaceAll(reference, replacement);
        }
        if (removeCallouts) {
            text = this.removeCallout(text);
        }
        if (removeBullet) {
            if (!text.includes("\n") && (text.trim().startsWith("- ") || text.trim().startsWith("* "))) {
                text = text.trim().slice(2);
            }
        }
        return text;
    }

    private getAliasFromOriginal(original: string): string | null {
        if (!original) return null;
        // Wikilink [[link|alias]]
        if (original.startsWith("[[") && original.includes("|")) {
            const pipeIndex = original.indexOf("|");
            const closeIndex = original.lastIndexOf("]]");
            if (pipeIndex !== -1 && closeIndex > pipeIndex) {
                return original.substring(pipeIndex + 1, closeIndex);
            }
        }
        // Standard Markdown link [alias](link)
        if (original.startsWith("[")) {
            const closeBracketIndex = original.indexOf("]");
            if (closeBracketIndex > 1 && original.substring(closeBracketIndex + 1).startsWith("(")) {
                return original.substring(1, closeBracketIndex);
            }
        }
        return null;
    }

    private processAnnotation(annotation: Annotation, replacement: string, removeCallouts = true, removeBullet = true): Annotation {
        if (annotation.context?.startsWith("> [!") && annotation.original) {
            const lines = annotation.context.split("\n");
            let title: string | null = null;
            const parts = lines[0]?.split(annotation.original) || [];
            if (parts.length >= 2) {
                title = parts.pop()!.trim();
            }
            annotation.title = title;
        }
        if (annotation.original) {
            const alias = this.getAliasFromOriginal(annotation.original);
            let effectiveReplacement = replacement;
            const maxLen = this.plugin.settings.aliasMaxLength;
            if (alias !== null && maxLen > 0 && alias.length <= maxLen) {
                effectiveReplacement = alias;
            }
            annotation.context = this.cleanContext(
                annotation.context,
                annotation.original,
                effectiveReplacement,
                this.plugin.settings.removeCallouts,
                this.plugin.settings.removeBullets
            );
        }
        return annotation;
    }

    private addHighlightToPdfPage(page: PDFPage, origAnnotation: Annotation): string {
        const replacement = this.plugin.settings.replacementText;
        const annotation = this.processAnnotation(origAnnotation, replacement);
        const { r, g, b } = annotation.color === "default" || annotation.color === this.plugin.settings.defaultAnnotationColor ?
                            { "r": 255, "g": 255, "b": 128}
                            : getRgb(annotation.color);

        const geometry = new PDFGeometry();
        const contents = annotation.context;
        
        let title = PDFHexString.fromText(this.plugin.settings.authorName || "User");
        let timestamp: PDFString | null = PDFString.fromDate(new Date());
        
        if (annotation.title) {
            title = PDFHexString.fromText(`${this.plugin.settings.authorName || "User"} - ${annotation.title}`);
            timestamp = null;
        }

        const rects = annotation.rectangles || [];
        if (rects.length === 0) return "";
        
        const mergedRect = geometry.mergeRectangles(...rects);
        const quadPoints = geometry.rectsToQuadPoints(rects);

        const isSquare = !!annotation.rect;
        const subtype = isSquare ? 'Square' : 'Highlight';

        const context = page.doc.context;
        const embedComment = this.plugin.settings.embedCommentInHighlight;
        const annotObj = {
            Type: 'Annot',
            Subtype: subtype,
            Rect: mergedRect,
            Contents: embedComment ? PDFHexString.fromText(contents ?? '') : PDFHexString.fromText(''),
            M: timestamp,
            T: title,
            F: 4,
            C: [r / 255, g / 255, b / 255],
        };

        if (isSquare) {
            // @ts-ignore
            annotObj.BS = context.obj({
                Type: 'Border',
                W: 2,
                S: 'S'
            });
        } else {
            // @ts-ignore
            annotObj.QuadPoints = quadPoints;
            // @ts-ignore
            annotObj.CA = this.plugin.settings.highlightAlpha;
            // @ts-ignore
            annotObj.Border = [0, 0, 0];
        }

        // @ts-ignore
        const ref = context.register(context.obj(annotObj));
        page.node.addAnnot(ref);

        if (this.plugin.settings.exportStickyNotes && contents) {
            const noteX1 = Math.max(10, mergedRect[0] - 25);
            const noteY2 = mergedRect[3];
            const noteRect = [noteX1, noteY2 - 20, noteX1 + 20, noteY2];

            const noteObj = {
                Type: 'Annot',
                Subtype: 'Text',
                Name: 'Comment',
                Rect: noteRect,
                Contents: PDFHexString.fromText(contents ?? ''),
                M: timestamp,
                T: title,
                F: 4,
                C: [r / 255, g / 255, b / 255],
            };

            // @ts-ignore
            const noteRef = context.register(context.obj(noteObj));
            page.node.addAnnot(noteRef);
        }
        
        return `${ref.objectNumber}R`;
    }

    async addAnnotationsToPdf(pdfname: string, annotations: Annotation[], outputPdfName: string): Promise<void> {
        const file = this.plugin.app.metadataCache.getFirstLinkpathDest(pdfname, "");
        if (!file) throw new Error("Original PDF file not found");
        
        const buffer = await this.getPdfBytes(file);
        const pdfDoc = await PDFDocument.load(buffer);
        
        const annotationsByPage = new Map<number, Annotation[]>();
        for (const annotation of annotations) {
            if (!annotationsByPage.has(annotation.page)) {
                annotationsByPage.set(annotation.page, []);
            }
            annotationsByPage.get(annotation.page)!.push(annotation);
        }

        for (const [pagenum, pageAnnotations] of annotationsByPage.entries()) {
            const page = pdfDoc.getPage(pagenum - 1);
            for (const annotation of pageAnnotations) {
                this.addHighlightToPdfPage(page, annotation);
            }
        }
        
         
        const pdfBytes = await pdfDoc.save();
        
        const existingFile = this.plugin.app.vault.getAbstractFileByPath(outputPdfName);
        if (existingFile instanceof TFile) {
            await this.plugin.app.vault.modifyBinary(existingFile, pdfBytes.buffer as ArrayBuffer);
        } else {
            await this.plugin.app.vault.createBinary(outputPdfName, pdfBytes.buffer as ArrayBuffer);
        }
    }
}
