/**
 *
 * ColorIndexApp Init
 *
 * Load JSON file with colors
 * Send palettes to color-index-index-list
 *
 **/
// eslint-disable-next-line no-use-before-define
(function () {
    'use strict';
    interface ColorDataItem {
        colors: string;
        name: string;
    }
    interface ColorDataItems {
        [id: string]: ColorDataItem;
    }

    /**
     * ColorIndexList
     * shows current list of color palettes
     * and lists that have been recently added from localstorage
     **/

    enum CopyState {
        EMPTY = 'EMPTY',
        PROGRESS = 'COPYING',
        SUCCESS = 'COPY_SUCCESS',
        ERROR = 'COPY_ERROR',
    }

    customElements.define(
        'color-index-item',
        class ColorIndexItem extends HTMLElement {
            /* @param colorDataList: Stores a original data */
            private colorDataList: string[] = [];
            /* @param colorUIList: Stores display data */
            private colorUIList: string[] = [];
            /* @param colorUIList: Stores display data */
            private copyLog: HTMLParagraphElement;
            private copyRGBtn: HTMLButtonElement;
            private copyHexBtn: HTMLButtonElement;
            private colorListDiv: HTMLDivElement;
            private copyTimeoutId: ReturnType<typeof setTimeout>;
            private activeIndex: number = 0;

            constructor() {
                super();
            }

            async connectedCallback() {
                const { id = 'id', name, colors } = this.dataset;
                this.id = id;
                this.setAttribute('id', this.id);
                const colorItemTitle = this.ownerDocument.createElement('div');
                colorItemTitle.classList.add('color-index-item-title');
                colorItemTitle.innerText = name;
                this.colorDataList = colors
                    .split(',')
                    .map((color) => color.trim());
                this.colorUIList = [...this.colorDataList];
                this.colorListDiv = this.ownerDocument.createElement('div');
                this.colorListDiv.classList.add('color-index-item-list');
                this.colorListDiv.addEventListener(
                    'dragstart',
                    this.handleDrag
                );
                this.colorListDiv.addEventListener(
                    'dragenter',
                    this.handleDrag
                );
                this.colorListDiv.addEventListener(
                    'dragleave',
                    this.handleDrag
                );
                // TODO make work
                this.colorListDiv.addEventListener('drop', this.handleDrag);
                this.renderColorList();
                this.appendChild(colorItemTitle);
                this.renderCopyButtons();
                this.appendChild(this.colorListDiv);
            }

            disconnectedCallback() {
                this.removeEventListener('click', this.copyColors);
            }

            isListUpdated(): boolean {
                let updated: boolean = false;
                for (let colorIndex in this.colorUIList) {
                    updated =
                        this.colorDataList[colorIndex] !==
                        this.colorDataList[colorIndex];
                    if (updated) {
                        return true;
                    }
                }
                return false;
            }

            handleDrag = (e: MouseEvent) => {
                switch (e.type) {
                    case 'dragstart':
                        console.log('dragstart');
                        this.activeIndex = parseInt(
                            (e.target as HTMLElement).dataset.index
                        );
                        break;
                    case 'dragstop':
                        break;
                    case 'dragenter':
                        const targetIndex = parseInt(
                            (e.target as HTMLElement).dataset.index
                        );
                        if (targetIndex !== this.activeIndex) {
                            const activeValue = this.colorDataList[
                                this.activeIndex
                            ];
                            const movedValue = this.colorDataList[targetIndex];
                            this.colorDataList[this.activeIndex] = movedValue;
                            this.colorDataList[targetIndex] = activeValue;
                            this.activeIndex = targetIndex;
                            this.renderColorList();
                            console.log('isListUpdated', this.isListUpdated());
                        }
                        break;
                    case 'dragleave':
                        break;
                    case 'drag':
                        break;
                    case 'drop':
                        e.preventDefault();
                        console.log('drop');
                        break;
                }
            };

            handleCopyClick = (e: MouseEvent) => {
                const type = (e.currentTarget as HTMLButtonElement).dataset
                    .type;
                this.copyColors(type);
            };

            async copyColors(type) {
                this.updateCopyLog(type, CopyState.PROGRESS);

                let copyColorList: string = '';
                const { colors, id } = this.dataset;
                switch (type) {
                    case 'hex':
                        const hexList: string = `[${colors[id]}]`.replace(
                            /([#(\w|\d)]{7})/g,
                            '"$1"'
                        );
                        copyColorList = hexList;
                        break;
                    case 'rgb':
                        const rgbList = colors[id].split(',').map((hex) => {
                            const rgbValues = this.convertToRGB(hex.trim());
                            return !rgbValues ? false : `(${rgbValues})`;
                        });
                        copyColorList = `[${rgbList.join(',')}]`;
                        break;
                }

                const data = [
                    new ClipboardItem({
                        'text/plain': new Blob([copyColorList], {
                            type: 'text/plain',
                        }),
                    }),
                ];
                const anyNavigator: any = window.navigator;
                anyNavigator.clipboard!.write(data).then(
                    () => {
                        this.updateCopyLog(type, CopyState.SUCCESS);
                    },
                    () => {
                        this.updateCopyLog(type, CopyState.ERROR);
                    }
                );
            }

            renderColorList() {
                this.colorListDiv.innerHTML = '';
                // TODO use pre rendered template
                this.colorUIList.forEach((color, i) => {
                    const colorWrapper = document.createElement('div');
                    const colorPiece = document.createElement('div');
                    colorWrapper.classList.add('dropzone');
                    colorWrapper.classList.add('colorindex-item');
                    colorPiece.setAttribute('draggable', 'true');
                    colorPiece.setAttribute('data-index', `${i}`);
                    colorPiece.setAttribute('data-color', color);
                    colorPiece.setAttribute(
                        'style',
                        `background-color:${color}`
                    );
                    colorWrapper.appendChild(colorPiece);
                    this.colorListDiv.appendChild(colorWrapper);
                });
            }

            renderCopyButtons() {
                const copyButtonsContainer = document.createElement('div');
                copyButtonsContainer.classList.add(
                    'color-index-copy-container'
                );

                this.copyHexBtn = document.createElement('button');
                this.copyHexBtn.innerText = 'Copy HEX';
                this.copyHexBtn.setAttribute('data-type', 'hex');
                copyButtonsContainer.appendChild(this.copyHexBtn);

                this.copyRGBtn = document.createElement('button');
                this.copyRGBtn.setAttribute('data-type', 'rgb');
                this.copyRGBtn.innerText = 'Copy RGB';
                copyButtonsContainer.appendChild(this.copyRGBtn);

                this.copyLog = document.createElement('p');
                this.copyLog.classList.add('color-index-copy-log');
                copyButtonsContainer.appendChild(this.copyLog);

                this.appendChild(copyButtonsContainer);
            }

            convertToRGB(hex: string): boolean | number[] {
                var aRgbHex: string[] | null = hex.match(/\w{1,2}/g);
                if (aRgbHex !== null && aRgbHex.length === 3) {
                    var aRgb: number[] = [
                        parseInt(aRgbHex[0], 16),
                        parseInt(aRgbHex[1], 16),
                        parseInt(aRgbHex[2], 16),
                    ];
                    return aRgb;
                }
                return false;
            }

            updateCopyLog(
                type: 'hex' | 'rgb' | '' = '',
                copyState: CopyState = CopyState.EMPTY
            ) {
                let copyStatusTxt: string = '';
                let copyType: string = type.toUpperCase();
                switch (copyState) {
                    case CopyState.PROGRESS:
                        copyStatusTxt = `Copying ${copyType} Palette`;
                        break;
                    case CopyState.SUCCESS:
                        copyStatusTxt = `Copied ${copyType} Palette Successfully!`;
                        break;
                    case CopyState.ERROR:
                        copyStatusTxt = `Unable to Copy ${copyType} Palette`;
                        break;
                    default:
                        copyStatusTxt = '';
                        break;
                }

                this.copyLog.innerText = copyStatusTxt;

                if (copyState !== CopyState.EMPTY) {
                    clearTimeout(this.copyTimeoutId);
                    this.copyTimeoutId = setTimeout(
                        () => this.updateCopyLog(),
                        2000
                    );
                }
            }
        }
    );

    customElements.define(
        'color-index-list',
        class ColorIndexList extends HTMLElement {
            private colorItems: ColorDataItems = {};
            private colorIds: string[] = [];
            constructor() {
                super();
            }

            async connectedCallback() {
                const colorRes: Response = await fetch('/getColorData');
                if (colorRes.ok) {
                    this.colorItems = await colorRes.json();
                    this.colorIds = Object.keys(this.colorItems);
                    this.ownerDocument
                        .getElementById('color-index-loader')
                        .classList.add('hidden');
                    for (let colorId of this.colorIds) {
                        const { colors, name } = this.colorItems[colorId];
                        const colorItem = document.createElement(
                            'color-index-item'
                        );
                        colorItem.setAttribute('data-id', colorId);
                        colorItem.setAttribute('data-colors', colors);
                        colorItem.setAttribute('data-name', name);
                        colorItem.classList.add('color-index-item-container');

                        this.appendChild(colorItem);
                    }
                }
            }
        }
    );

    customElements.define(
        'color-index-palette-input',
        class PaletteInput extends HTMLElement {
            private submitBtn: HTMLButtonElement;
            private toggleShowBtn: HTMLButtonElement;
            private input: HTMLInputElement;
            private inputContainer: HTMLDivElement;
            private isFormHidden = true;

            constructor() {
                super();
            }

            connectedCallback() {
                this.toggleShowBtn = this.ownerDocument.createElement('button');
                this.toggleShowBtn.innerText = 'Add New Palette +';
                this.toggleShowBtn.addEventListener(
                    'click',
                    this.togglePaletteInput
                );

                this.inputContainer = this.ownerDocument.createElement('div');

                this.input = this.ownerDocument.createElement('input');
                this.input.classList.add('color-index-addpalette-input');
                this.input.addEventListener('blur', this.togglePaletteInput);

                this.submitBtn = this.ownerDocument.createElement('button');
                this.submitBtn.classList.add('color-index-submit-btn');

                this.submitBtn.addEventListener('click', this.savePalette);
                this.submitBtn.innerText = 'Save Palette';

                this.inputContainer.appendChild(this.input);
                this.inputContainer.appendChild(this.submitBtn);

                this.appendChild(this.inputContainer);
                this.appendChild(this.toggleShowBtn);

                this.updatePaletteInput();
            }

            disconnectedCallback() {
                this.submitBtn.removeEventListener('click', this.savePalette);
                this.input.removeEventListener('blur', this.togglePaletteInput);
            }

            togglePaletteInput = () => {
                this.isFormHidden = !this.isFormHidden;
                this.updatePaletteInput();
            };

            updatePaletteInput() {
                if (this.isFormHidden) {
                    this.toggleShowBtn.classList.remove('hidden');
                    this.inputContainer.classList.add('hidden');
                } else {
                    this.toggleShowBtn.classList.add('hidden');
                    this.inputContainer.classList.remove('hidden');
                    this.input.focus();
                }
            }

            async savePalette(e: MouseEvent) {
                // fetch color from input text field and package into object
                const colorData = {
                    colors: '#FFFFF, #FF00F, #00FFF, #FFF00, #00FFF',
                    name: 'My Color Test',
                };
                const colorRes: Response = await fetch('/setColorData', {
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                    },
                    method: 'POST',
                    body: JSON.stringify(colorData),
                });
                if (colorRes.ok) {
                    console.log('Color Palette saved');
                }
            }
        }
    );
})();
