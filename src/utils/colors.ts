// @ts-nocheck
export function getRgb(color: string): { r: number, g: number, b: number } {
    const palette: Record<string, {r: number, g: number, b: number}> = {
        default: { r: 255, g: 255, b: 128 }, // Light yellow
        yellow: { r: 255, g: 226, b: 143 },
        red: { r: 255, g: 173, b: 171 },
        orange: { r: 255, g: 204, b: 153 },
        green: { r: 173, g: 223, b: 176 },
        blue: { r: 169, g: 219, b: 255 },
        purple: { r: 219, g: 192, b: 255 },
        pink: { r: 255, g: 179, b: 220 },
        brown: { r: 217, g: 193, b: 176 },
        gray: { r: 204, g: 204, b: 204 },
    };

    const lowerColor = color.toLowerCase();
    if (palette[lowerColor]) {
        return palette[lowerColor];
    }

    const hex = color.replace('#', '');
    if (hex.length === 6) {
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    } else if (hex.length === 3) {
        return {
            r: parseInt(hex[0] + hex[0], 16),
            g: parseInt(hex[1] + hex[1], 16),
            b: parseInt(hex[2] + hex[2], 16)
        };
    }

    return palette.default;
}
