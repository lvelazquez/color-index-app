import { describe, expect, it } from 'vitest';
import {
    formatPalette,
    hexToRgb,
    moveItem,
    normalizeHex,
    parseColors,
    sanitizePalettes,
} from './palette';

describe('normalizeHex', () => {
    it('expands short hex and lowercases', () => {
        expect(normalizeHex('#ABC')).toBe('#aabbcc');
        expect(normalizeHex('FF00aa')).toBe('#ff00aa');
    });
    it('rejects bad input', () => {
        expect(normalizeHex('#FFFFF')).toBeNull();
        expect(normalizeHex('#ggg')).toBeNull();
        expect(normalizeHex('')).toBeNull();
    });
});

describe('parseColors', () => {
    it('splits on commas and whitespace', () => {
        expect(parseColors('#fff, 000000  #123').colors).toEqual([
            '#ffffff',
            '#000000',
            '#112233',
        ]);
    });
    it('reports invalid tokens', () => {
        expect(parseColors('#fff, nope').invalid).toEqual(['nope']);
    });
});

describe('formatPalette', () => {
    it('formats hex and rgb lists', () => {
        expect(hexToRgb('#ff8000')).toEqual([255, 128, 0]);
        expect(formatPalette(['#ff8000', '#000000'], 'hex')).toBe(
            '["#ff8000","#000000"]',
        );
        expect(formatPalette(['#ff8000', '#000000'], 'rgb')).toBe(
            '[(255,128,0),(0,0,0)]',
        );
    });
});

describe('moveItem', () => {
    it('moves without mutating', () => {
        const a = [1, 2, 3];
        expect(moveItem(a, 0, 2)).toEqual([2, 3, 1]);
        expect(a).toEqual([1, 2, 3]);
    });
    it('ignores out-of-range moves', () => {
        expect(moveItem([1, 2], 0, 5)).toEqual([1, 2]);
    });
});

describe('sanitizePalettes', () => {
    it('drops junk, accepts legacy comma strings, dedupes ids', () => {
        const out = sanitizePalettes([
            { id: 'a', name: 'One', colors: '#fff, #000' },
            { id: 'a', name: ' ', colors: ['#123456', 'bad'] },
            { id: 'c', name: 'Empty', colors: [] },
            null,
        ]);
        expect(out).toHaveLength(2);
        expect(out[0]?.colors).toEqual(['#ffffff', '#000000']);
        expect(out[1]?.name).toBe('Untitled');
        expect(out[1]?.id).not.toBe('a');
        expect(sanitizePalettes('x')).toEqual([]);
    });
});
