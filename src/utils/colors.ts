const DEFAULT_RGB = { r: 255, g: 255, b: 128 };

export function getRgb(
    color: string,
    customColors?: Record<string, string>
): { r: number, g: number, b: number } {
    const palette: Record<string, { r: number, g: number, b: number }> = {
        default: DEFAULT_RGB, // Light yellow
        yellow: { r: 255, g: 245, b: 100 }, // Amarillo limpio y brillante (no anaranjado)
        red: { r: 255, g: 173, b: 171 },
        orange: { r: 255, g: 190, b: 120 },
        green: { r: 173, g: 223, b: 176 },
        blue: { r: 169, g: 219, b: 255 },
        purple: { r: 219, g: 192, b: 255 },
        pink: { r: 255, g: 179, b: 220 },
        brown: { r: 217, g: 193, b: 176 },
        gray: { r: 204, g: 204, b: 204 },
    };

    if (!color) {
        return DEFAULT_RGB;
    }

    const trimmed = color.trim();
    const lowerColor = trimmed.toLowerCase();

    // 1. Si coincide con un color personalizado específico (ej. "Toc" en PDF++), obtener su valor
    // Ignoramos 'yellow' para no sobreescribir el amarillo limpio con el #ffd000 ambarino por defecto de PDF++
    if (customColors && lowerColor !== 'yellow') {
        for (const [name, hexValue] of Object.entries(customColors)) {
            if (name.toLowerCase() === lowerColor && typeof hexValue === 'string') {
                return getRgb(hexValue);
            }
        }
    }

    // 2. Comprobar paleta predefinida
    const matched = palette[lowerColor];
    if (matched) {
        return matched;
    }

    // 3. Si no coincidió en la paleta, buscar en customColors por si era otra variante
    if (customColors) {
        for (const [name, hexValue] of Object.entries(customColors)) {
            if (name.toLowerCase() === lowerColor && typeof hexValue === 'string') {
                return getRgb(hexValue);
            }
        }
    }

    // 4. Comprobar si es un color hexadecimal (#RRGGBB o #RGB o sin almohadilla)
    const hex = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;

    if (/^[0-9a-fA-F]{6}$/.test(hex)) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
            return { r, g, b };
        }
    } else if (/^[0-9a-fA-F]{3}$/.test(hex)) {
        const rChar = hex.charAt(0);
        const gChar = hex.charAt(1);
        const bChar = hex.charAt(2);
        const r = parseInt(rChar + rChar, 16);
        const g = parseInt(gChar + gChar, 16);
        const b = parseInt(bChar + bChar, 16);
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
            return { r, g, b };
        }
    }

    return DEFAULT_RGB;
}
