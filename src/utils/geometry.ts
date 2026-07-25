export type Rect = [number, number, number, number];
export interface TextContentItem {
    str: string;
    chars?: { c: string; u?: string; r: Rect }[];
    transform?: number[];
    width?: number;
    height?: number;
}

export class PDFGeometry {
    computeMergedHighlightRects(textContentItems: TextContentItem[], selection: [number, number, number, number]): Rect[] {
        const [beginIndex, beginOffset, endIndex, endOffset] = selection;
        const results: Rect[] = [];

        let mergedRect: Rect | null = null;

        let actualEndIndex = endIndex;
        let actualEndOffset = endOffset;
        if (actualEndOffset === 0 && actualEndIndex > 0) {
            actualEndIndex--;
            actualEndOffset = textContentItems[actualEndIndex]?.str?.length || 0;
        }

        for (let index = beginIndex; index <= actualEndIndex; index++) {
            const item = textContentItems[index];

            if (!item || !item.str || !item.chars) continue;

            if (!item || !item.str || !item.chars) continue;

            const rect = this.computeHighlightRectForItemFromChars(item, index, beginIndex, beginOffset, actualEndIndex, actualEndOffset);
            if (!rect) continue;

            if (!mergedRect) {
                mergedRect = rect;
            } else {
                const mergeable = this.areRectanglesMergeable(mergedRect, rect);
                if (mergeable) {
                    mergedRect = this.mergeRectangles(mergedRect, rect);
                } else {
                    results.push(mergedRect);
                    mergedRect = rect;
                }
            }
        }

        if (mergedRect) results.push(mergedRect);

        return results;
    }

    private computeHighlightRectForItemFromChars(item: TextContentItem, index: number, beginIndex: number, beginOffset: number, endIndex: number, endOffset: number): Rect | null {
        if (!item.chars) return null;
        const trimmedChars = item.chars.slice(
            item.chars.findIndex((char: {c: string}) => char.c === item.str.charAt(0)),
            item.chars.findLastIndex((char: {c: string}) => char.c === item.str.charAt(item.str.length - 1)) + 1
        );

        const offsetFrom = index === beginIndex ? beginOffset : 0;
        const offsetTo = (index === endIndex ? Math.min(endOffset, trimmedChars.length) : trimmedChars.length) - 1;

        if (offsetFrom > trimmedChars.length - 1 || offsetTo < 0) return null;

        const charFrom = trimmedChars[offsetFrom];
        const charTo = trimmedChars[offsetTo];
        
        if (!charFrom || !charTo) return null;
        
        return [
            Math.min(charFrom.r[0], charTo.r[0]), Math.min(charFrom.r[1], charTo.r[1]),
            Math.max(charFrom.r[2], charTo.r[2]), Math.max(charFrom.r[3], charTo.r[3]),
        ];
    }

    private areRectanglesMergeable(rect1: Rect, rect2: Rect): boolean {
        return this.areRectanglesMergeableHorizontally(rect1, rect2)
            || this.areRectanglesMergeableVertically(rect1, rect2);
    }

    private areRectanglesMergeableHorizontally(rect1: Rect, rect2: Rect): boolean {
        const [, bottom1, , top1] = rect1;
        const [, bottom2, , top2] = rect2;
        const y1 = (bottom1 + top1) / 2;
        const y2 = (bottom2 + top2) / 2;
        const height1 = Math.abs(top1 - bottom1);
        const height2 = Math.abs(top2 - bottom2);
        const threshold = Math.max(height1, height2) * 0.5;
        return Math.abs(y1 - y2) < threshold;
    }

    private areRectanglesMergeableVertically(rect1: Rect, rect2: Rect): boolean {
        const [left1, bottom1, right1, top1] = rect1;
        const [left2, bottom2, right2, top2] = rect2;
        const width1 = Math.abs(right1 - left1);
        const width2 = Math.abs(right2 - left2);
        const height1 = Math.abs(top1 - bottom1);
        const height2 = Math.abs(top2 - bottom2);
        const threshold = Math.max(width1, width2) * 0.1;
        return Math.abs(left1 - left2) < threshold && Math.abs(right1 - right2) < threshold
            && height1 / width1 > 0.85 && height2 / width2 > 0.85;
    }

    mergeRectangles(...rects: Rect[]): Rect {
        const lefts = rects.map((rect) => rect[0]);
        const bottoms = rects.map((rect) => rect[1]);
        const rights = rects.map((rect) => rect[2]);
        const tops = rects.map((rect) => rect[3]);
        return [
            Math.min(...lefts),
            Math.min(...bottoms),
            Math.max(...rights),
            Math.max(...tops),
        ];
    }

    rectsToQuadPoints(rects: Rect[]): number[] {
        return rects.flatMap(([left, bottom, right, top]) => [left, top, right, top, left, bottom, right, bottom]);
    }
}
