/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Position {
    start: { line: number; col: number; offset: number };
    end: { line: number; col: number; offset: number };
}

export interface Link {
    displayText: string;
    link: string;
    original: string;
    position: Position;
}

export interface Annotation {
    color: string;
    text: string;
    page: number;
    link: string;
    original: string;
    selection?: number[];
    rect?: number[];
    context: string;
    title: string | null;
    tags: string[];
    source: string;
    rectangles?: any[];
}
