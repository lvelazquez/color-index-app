import { type Palette, sanitizePalettes } from './palette';

const KEY = 'color-index:palettes:v1';

export const SAMPLE_PALETTES: Palette[] = [
    {
        id: 'sample-ocean',
        name: 'Ocean',
        colors: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
    },
    {
        id: 'sample-mono',
        name: 'Monochrome',
        colors: ['#111111', '#444444', '#888888', '#cccccc', '#ffffff'],
    },
];

/** Load saved palettes; falls back to samples on first run or storage errors. */
export function loadPalettes(): Palette[] {
    try {
        const raw = localStorage.getItem(KEY);
        if (raw === null) return SAMPLE_PALETTES.map((p) => ({ ...p }));
        return sanitizePalettes(JSON.parse(raw));
    } catch {
        return SAMPLE_PALETTES.map((p) => ({ ...p }));
    }
}

/** Returns false when storage is unavailable (private mode, quota). */
export function savePalettes(palettes: Palette[]): boolean {
    try {
        localStorage.setItem(KEY, JSON.stringify(palettes));
        return true;
    } catch {
        return false;
    }
}
