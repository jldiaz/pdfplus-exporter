import { Modal, Setting, Notice } from 'obsidian';
import { PDFExporter } from '../utils/pdf-exporter';
import { PdfInputSuggest } from './PdfInputSuggest';
import type PDFPlusExporterPlugin from '../main';
import { t } from '../i18n';
import { Link } from '../types';

export class ExportModal extends Modal {
    pdfSource: string;
    outputPdfName: string;
    sourceGlob: string;
    colorsFilter: string;
    tagFilter: string;
    exporter: PDFExporter;

    plugin: PDFPlusExporterPlugin;

    constructor(plugin: PDFPlusExporterPlugin) {
        super(plugin.app);
        this.plugin = plugin;
        this.exporter = new PDFExporter(plugin);
        this.pdfSource = "";
        this.outputPdfName = this.plugin.settings.lastOutputPdfName || t('default_output_pdf_name');
        this.sourceGlob = "";
        this.colorsFilter = "";
        this.tagFilter = "";
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl('h2', { text: t('modal_title') });

        new Setting(contentEl)
            .setName(t('modal_pdf_source'))
            .setDesc(t('modal_pdf_source_desc'))
            .addText(text => {
                text.setValue(this.pdfSource)
                    .onChange(value => {
                        this.pdfSource = value;
                    });
                new PdfInputSuggest(this.plugin.app, text.inputEl, (file) => {
                    this.pdfSource = file.path;
                });
                return text;
            });

        new Setting(contentEl)
            .setName(t('modal_pdf_dest'))
            .setDesc(t('modal_pdf_dest_desc'))
            .addText(text => text
                .setValue(this.outputPdfName)
                .onChange(value => {
                    this.outputPdfName = value;
                }));

        new Setting(contentEl)
            .setName(t('modal_source_glob'))
            .setDesc(t('modal_source_glob_desc'))
            .addText(text => text
                .setValue(this.sourceGlob)
                .onChange(value => {
                    this.sourceGlob = value;
                }));

        new Setting(contentEl)
            .setName(t('modal_colors'))
            .setDesc(t('modal_colors_desc'))
            .addText(text => text
                .setValue(this.colorsFilter)
                .onChange(value => {
                    this.colorsFilter = value;
                }));

        new Setting(contentEl)
            .setName(t('modal_tags'))
            .setDesc(t('modal_tags_desc'))
            .addText(text => text
                .setValue(this.tagFilter)
                .onChange(value => {
                    this.tagFilter = value;
                }));

        new Setting(contentEl)
            .addButton(btn => btn
                .setButtonText(t('modal_export_btn'))
                .setCta()
                .onClick(async () => {
                    this.close();
                    await this.exportPdf();
                }));
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

    async exportPdf() {
        try {
            new Notice(t('export_starting', { pdf: this.pdfSource }));
            
            // Guardar el nombre de salida usado
            this.plugin.settings.lastOutputPdfName = this.outputPdfName;
            await this.plugin.saveSettings();
            
            // 1. Obtener backlinks
            let backlinks = await this.exporter.getBacklinks(this.pdfSource);
            if (!backlinks) {
                new Notice(t('export_no_refs'));
                return;
            }

            // Aplicar filtro de glob si existe
            if (this.sourceGlob) {
                const globRegex = new RegExp('^' + this.sourceGlob.split('*').map(s => s.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')).join('.*') + '$');
                const filtered: Record<string, Link[]> = {};
                for (const file in backlinks) {
                    if (globRegex.test(file) && backlinks[file]) {
                        filtered[file] = backlinks[file];
                    }
                }
                backlinks = filtered;
            }

            // Verificar si tras el filtro quedan referencias
            if (Object.keys(backlinks).length === 0) {
                new Notice(t('export_no_refs'));
                return;
            }

            // 2. Extraer datos (rectángulos, colores, contexto)
            const annotationsData = await this.exporter.getBacklinksData(backlinks);
            
            // Aplanar todas las anotaciones
            let allAnnotations = Object.values(annotationsData).flat();

            // 3. Filtrar anotaciones
            const colors = this.colorsFilter ? this.colorsFilter.split(',').map(c => c.trim()) : [];
            const tag = this.tagFilter ? this.tagFilter.trim() : undefined;
            allAnnotations = this.exporter.filterAnnotations(allAnnotations, colors, tag);

            if (allAnnotations.length === 0) {
                new Notice(t('export_no_matches'));
                return;
            }

            // 4. Calcular coordenadas en base al PDF
            await this.exporter.addPDFRectangles(allAnnotations, this.pdfSource);

            // 5. Añadir Highlights y guardar
            await this.exporter.addAnnotationsToPdf(this.pdfSource, allAnnotations, this.outputPdfName);

            new Notice(t('export_success', { pdf: this.outputPdfName }));
        } catch (error) {
            console.error("Error al exportar:", error);
            new Notice(t('export_error', { error: String(error) }));
        }
    }
}
