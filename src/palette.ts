export interface Palette {
    id: string;
    name: string;
    /** Normalized lowercase `#rrggbb` strings. */
    colors: string[];
}

export type CopyFormat = 'hex' | 'rgb';

/** Normalize `#abc`, `abc`, `#AABBCC` to `#aabbcc`; null when invalid. */
export function normalizeHex(input: string): string | null {
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim());
    if (!m || !m[1]) return null;
    let hex = m[1].toLowerCase();
    if (hex.length === 3) {
        hex = [...hex].map((c) => c + c).join('');
    }
    return `#${hex}`;
}

/**
 * Parse a list of colors separated by commas and/or whitespace.
 * Returns the valid colors plus the tokens that were rejected.
 */
export function parseColors(input: string): {
    colors: string[];
    invalid: string[];
} {
    const colors: string[] = [];
    const invalid: string[] = [];
    for (const token of input.split(/[\s,]+/).filter(Boolean)) {
        const hex = normalizeHex(token);
        if (hex) colors.push(hex);
        else invalid.push(token);
    }
    return { colors, invalid };
}

export function hexToRgb(hex: string): [number, number, number] {
    const n = normalizeHex(hex);
    if (!n) throw new Error(`Invalid hex color: ${hex}`);
    return [
        parseInt(n.slice(1, 3), 16),
        parseInt(n.slice(3, 5), 16),
        parseInt(n.slice(5, 7), 16),
    ];
}

/** `["#aabbcc","#112233"]` or `[(170,187,204),(17,34,51)]`. */
export function formatPalette(colors: string[], format: CopyFormat): string {
    if (format === 'hex') {
        return `[${colors.map((c) => `"${c}"`).join(',')}]`;
    }
    return `[${colors.map((c) => `(${hexToRgb(c).join(',')})`).join(',')}]`;
}

/** Move the item at `from` to `to`; returns a new array. */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
    if (from === to || from < 0 || to < 0) return list;
    if (from >= list.length || to >= list.length) return list;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item as T);
    return next;
}

/** Validate untrusted data (localStorage or an imported file). */
export function sanitizePalettes(data: unknown): Palette[] {
    if (!Array.isArray(data)) return [];
    const out: Palette[] = [];
    const seen = new Set<string>();
    for (const raw of data) {
        if (typeof raw !== 'object' || raw === null) continue;
        const r = raw as Record<string, unknown>;
        const list = Array.isArray(r.colors)
            ? r.colors
            : typeof r.colors === 'string'
              ? r.colors.split(',')
              : [];
        const colors = list
            .map((c) => (typeof c === 'string' ? normalizeHex(c) : null))
            .filter((c): c is string => c !== null);
        if (colors.length === 0) continue;
        let id = typeof r.id === 'string' && r.id ? r.id : newId();
        if (seen.has(id)) id = newId();
        seen.add(id);
        const name =
            typeof r.name === 'string' && r.name.trim()
                ? r.name.trim()
                : 'Untitled';
        out.push({ id, name, colors });
    }
    return out;
}

export function newId(): string {
    return (
        globalThis.crypto?.randomUUID?.() ??
        `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    );
}
