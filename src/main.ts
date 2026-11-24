import './styles/tokens.css';
import './styles/app.css';
import {
    type CopyFormat,
    type Palette,
    formatPalette,
    moveItem,
    newId,
    parseColors,
    sanitizePalettes,
} from './palette';
import { loadPalettes, savePalettes } from './storage';

function el<T extends HTMLElement>(id: string): T {
    const node = document.getElementById(id);
    if (!node) throw new Error(`Missing #${id}`);
    return node as T;
}

const listEl = el<HTMLUListElement>('palette-list');
const emptyEl = el('empty');
const statusEl = el('status');
const toastEl = el('toast');
const form = el<HTMLFormElement>('add-form');
const nameInput = el<HTMLInputElement>('add-name');
const colorsInput = el<HTMLInputElement>('add-colors');
const errorEl = el('add-error');
const importFile = el<HTMLInputElement>('import-file');

let palettes: Palette[] = loadPalettes();
let toastTimer: ReturnType<typeof setTimeout> | undefined;

function announce(message: string): void {
    // Re-set text so repeated identical messages are announced again.
    statusEl.textContent = '';
    requestAnimationFrame(() => (statusEl.textContent = message));
    toastEl.textContent = message;
    toastEl.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('visible'), 2000);
}

function persist(): void {
    if (!savePalettes(palettes)) {
        announce('Could not save: browser storage is unavailable.');
    }
}

async function copy(text: string, what: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(text);
        announce(`Copied ${what}`);
    } catch {
        announce(`Unable to copy ${what}`);
    }
}

function render(focus?: { id: string; index: number }): void {
    listEl.replaceChildren(...palettes.map(renderPalette));
    emptyEl.hidden = palettes.length > 0;
    if (focus) {
        listEl
            .querySelector<HTMLElement>(
                `[data-palette="${CSS.escape(focus.id)}"] [data-index="${focus.index}"]`,
            )
            ?.focus();
    }
}

function renderPalette(palette: Palette): HTMLLIElement {
    const li = document.createElement('li');
    li.dataset.palette = palette.id;

    const head = document.createElement('div');
    head.className = 'palette-head';
    const title = document.createElement('h3');
    title.className = 'palette-name';
    title.textContent = palette.name;
    head.append(title);

    for (const format of ['hex', 'rgb'] as CopyFormat[]) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = `Copy ${format.toUpperCase()}`;
        btn.setAttribute(
            'aria-label',
            `Copy ${palette.name} as ${format.toUpperCase()} list`,
        );
        btn.addEventListener('click', () =>
            copy(
                formatPalette(palette.colors, format),
                `${palette.name} ${format.toUpperCase()} palette`,
            ),
        );
        head.append(btn);
    }

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'danger';
    del.textContent = 'Delete';
    del.setAttribute('aria-label', `Delete ${palette.name}`);
    del.addEventListener('click', () => {
        if (!window.confirm(`Delete palette "${palette.name}"?`)) return;
        palettes = palettes.filter((p) => p.id !== palette.id);
        persist();
        render();
        nameInput.focus();
        announce(`Deleted ${palette.name}`);
    });
    head.append(del);

    const swatches = document.createElement('div');
    swatches.className = 'swatches';
    palette.colors.forEach((color, i) =>
        swatches.append(renderSwatch(palette, color, i)),
    );

    li.append(head, swatches);
    return li;
}

let dragFrom: { id: string; index: number } | null = null;

function reorder(palette: Palette, from: number, to: number): void {
    palette.colors = moveItem(palette.colors, from, to);
    persist();
    render({ id: palette.id, index: to });
}

function renderSwatch(
    palette: Palette,
    color: string,
    index: number,
): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch';
    btn.dataset.index = String(index);
    btn.style.setProperty('--swatch-color', color);
    btn.draggable = true;
    btn.setAttribute('aria-label', `Copy ${color} from ${palette.name}`);

    const label = document.createElement('span');
    label.className = 'swatch-label';
    label.textContent = color;
    btn.append(label);

    btn.addEventListener('click', () => copy(color, color));
    btn.addEventListener('keydown', (e) => {
        if (!e.altKey) return;
        const to =
            e.key === 'ArrowLeft'
                ? index - 1
                : e.key === 'ArrowRight'
                  ? index + 1
                  : -1;
        if (to < 0 || to >= palette.colors.length) return;
        e.preventDefault();
        reorder(palette, index, to);
        announce(`Moved ${color} to position ${to + 1}`);
    });
    btn.addEventListener('dragstart', (e) => {
        dragFrom = { id: palette.id, index };
        btn.classList.add('dragging');
        e.dataTransfer?.setData('text/plain', color);
    });
    btn.addEventListener('dragend', () => btn.classList.remove('dragging'));
    btn.addEventListener('dragover', (e) => {
        if (dragFrom?.id === palette.id) e.preventDefault();
    });
    btn.addEventListener('drop', (e) => {
        e.preventDefault();
        if (dragFrom?.id !== palette.id) return;
        const from = dragFrom.index;
        dragFrom = null;
        if (from !== index) reorder(palette, from, index);
    });
    return btn;
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { colors, invalid } = parseColors(colorsInput.value);
    if (invalid.length > 0) {
        errorEl.textContent = `Not valid hex colors: ${invalid.join(', ')}`;
        colorsInput.setAttribute('aria-invalid', 'true');
        colorsInput.focus();
        return;
    }
    if (colors.length === 0) {
        errorEl.textContent = 'Enter at least one color.';
        colorsInput.setAttribute('aria-invalid', 'true');
        colorsInput.focus();
        return;
    }
    errorEl.textContent = '';
    colorsInput.removeAttribute('aria-invalid');
    const name = nameInput.value.trim() || 'Untitled';
    palettes = [{ id: newId(), name, colors }, ...palettes];
    persist();
    render();
    form.reset();
    nameInput.focus();
    announce(`Saved palette ${name}`);
});

el('export-btn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(palettes, null, 2)], {
        type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-index-palettes.json';
    a.click();
    URL.revokeObjectURL(url);
    announce(`Exported ${palettes.length} palettes`);
});

el('import-btn').addEventListener('click', () => importFile.click());
importFile.addEventListener('change', async () => {
    const file = importFile.files?.[0];
    importFile.value = '';
    if (!file) return;
    try {
        const imported = sanitizePalettes(JSON.parse(await file.text()));
        if (imported.length === 0) throw new Error('empty');
        const ids = new Set(palettes.map((p) => p.id));
        palettes = [
            ...palettes,
            ...imported.map((p) => (ids.has(p.id) ? { ...p, id: newId() } : p)),
        ];
        persist();
        render();
        announce(`Imported ${imported.length} palettes`);
    } catch {
        announce('Import failed: not a valid palette JSON file.');
    }
});

render();
