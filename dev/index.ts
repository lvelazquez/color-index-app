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
            private colorDataList: string[] = [];
            private copyLog: HTMLElement;
            private copyRGBtn: HTMLElement;
            private copyHexBtn: HTMLElement;
            private colorListDiv: HTMLElement;
            private copyTimeoutId: number = 0;
            private dragIndex: number = 0;

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
                this.colorListDiv.addEventListener('drag', this.handleDrag);
                this.renderColorList();
                this.appendChild(colorItemTitle);
                this.renderCopyButtons();
                this.appendChild(this.colorListDiv);
            }

            disconnectedCallback() {
                this.removeEventListener('click', this.copyColors);
            }

            handleDrag = (e: MouseEvent) => {
                switch (e.type) {
                    case 'dragstart':
                        this.dragIndex = parseInt(
                            (e.target as HTMLElement).dataset.index
                        );
                        break;
                    case 'dragstop':
                        break;
                    case 'dragenter':
                        const targetIndex = parseInt(
                            (e.target as HTMLElement).dataset.index
                        );
                        if (targetIndex !== this.dragIndex) {
                            const activeValue = this.colorDataList[
                                this.dragIndex
                            ];
                            const movedValue = this.colorDataList[targetIndex];
                            this.colorDataList[this.dragIndex] = movedValue;
                            this.colorDataList[targetIndex] = activeValue;
                            this.dragIndex = targetIndex;
                            this.renderColorList();
                        }
                        break;
                    case 'dragleave':
                        break;
                    case 'drag':
                        break;
                    case 'drop':
                        e.preventDefault();
                        break;
                }
            };

            handleCopyClick = (e: MouseEvent) => {
                const type = (e.currentTarget as HTMLButtonElement).dataset
                    .type;
                this.copyColors(type);
            };

            async copyColors(type) {
                let copyColorList: string = '';
                const { colors, id } = this.dataset;
                this.updateCopyLog(type, CopyState.PROGRESS);
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
                this.colorDataList.forEach((color, i) => {
                    const colorWrapper = document.createElement('div');
                    colorWrapper.addEventListener('drop', this.handleDrag);
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
            private submitBtn: HTMLElement;
            private input: HTMLElement;
            private revealBtn: HTMLElement;
            private addFormContainer: HTMLElement;
            private isFormHidden = true;

            constructor() {
                super();
            }

            connectedCallback() {
                this.revealBtn = this.ownerDocument.createElement('button');
                this.revealBtn.innerText = 'Add New Palette +';
                this.revealBtn.addEventListener(
                    'click',
                    this.togglePaletteInput
                );

                this.addFormContainer = this.ownerDocument.createElement('div');

                this.input = this.ownerDocument.createElement('input');
                this.input.classList.add('color-index-addpalette-input');
                this.input.addEventListener('blur', this.togglePaletteInput);

                this.submitBtn = this.ownerDocument.createElement('button');
                this.submitBtn.classList.add('color-index-submit-btn');

                this.submitBtn.addEventListener('click', this.savePalette);
                this.submitBtn.innerText = 'Save Palette';

                this.addFormContainer.appendChild(this.input);
                this.addFormContainer.appendChild(this.submitBtn);

                this.appendChild(this.addFormContainer);
                this.appendChild(this.revealBtn);

                this.updateUI();
            }

            disconnectedCallback() {
                this.submitBtn.removeEventListener('click', this.savePalette);
                this.input.removeEventListener('blur', this.togglePaletteInput);
            }

            togglePaletteInput = () => {
                this.isFormHidden = !this.isFormHidden;
                this.updateUI();
            };

            updateUI() {
                if (this.isFormHidden) {
                    this.revealBtn.classList.remove('hidden');
                    this.addFormContainer.classList.add('hidden');
                } else {
                    this.revealBtn.classList.add('hidden');
                    this.addFormContainer.classList.remove('hidden');
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
            }
        }
    );
})();
