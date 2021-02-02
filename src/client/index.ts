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

    const ColorsApi = {
        updateColors: async (recordId: string, colorInfo: ColorDataItem) => {
            const colorRes: Response = await fetch('/updateColorData', {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
                method: 'POST',
                body: JSON.stringify({
                    recordId,
                    colorInfo,
                }),
            });
            if (colorRes.ok) {
                console.log('Color Palette saved');
            }
        },
        createColors: async (colorInfo: ColorDataItem) => {
            const colorRes: Response = await fetch('/setColorData', {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
                method: 'POST',
                body: JSON.stringify(colorInfo),
            });
            if (colorRes.ok) {
                console.log('Color Palette saved');
            }
        },
        getColors: async () => {
            return await fetch('/getColorData');
        },
    };

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
            private saveBtn: HTMLButtonElement;
            private colorListDiv: HTMLDivElement;
            private copyTimeoutId: ReturnType<typeof setTimeout>;
            private activeIndex: number = 0;
            private name: string;

            constructor() {
                super();
            }

            async connectedCallback() {
                const { id = 'id', name, colors } = this.dataset;
                this.id = id;
                this.name = name;
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
                    this.handleDragStart
                );
                this.colorListDiv.addEventListener(
                    'dragenter',
                    this.handleDragEnter
                );
                this.colorListDiv.addEventListener(
                    'dragover',
                    this.handleDragOver
                );
                this.colorListDiv.addEventListener('drop', this.handleDrop);

                this.renderColorList();

                this.saveBtn = this.ownerDocument.createElement('button');
                this.saveBtn.classList.add('color-index-save-btn');
                this.saveBtn.innerText = 'Update Colors';
                this.saveBtn.classList.add('hidden');
                this.saveBtn.addEventListener(
                    'click',
                    this.handleUpdatePalette
                );

                this.appendChild(colorItemTitle);
                this.renderCopyButtons();
                this.appendChild(this.saveBtn);
                this.appendChild(this.colorListDiv);
            }

            disconnectedCallback() {
                this.removeEventListener('click', this.copyColors);
                this.colorListDiv.removeEventListener(
                    'dragstart',
                    this.handleDragStart
                );
                this.colorListDiv.removeEventListener(
                    'dragenter',
                    this.handleDragEnter
                );
                this.colorListDiv.removeEventListener(
                    'dragover',
                    this.handleDragOver
                );
                this.colorListDiv.removeEventListener('drop', this.handleDrop);
                this.saveBtn.removeEventListener(
                    'click',
                    this.handleUpdatePalette
                );
            }

            isUpdated(): boolean {
                let updated: boolean = false;
                for (let colorIndex in this.colorUIList) {
                    updated =
                        this.colorDataList[colorIndex] !==
                        this.colorUIList[colorIndex];
                    if (updated) {
                        break;
                    }
                }
                return updated;
            }

            handleDragStart = (e: MouseEvent) => {
                this.activeIndex = parseInt(
                    (e.target as HTMLElement).dataset.index
                );
            };

            handleDragOver = (e: MouseEvent) => {
                e.preventDefault();
            };

            handleDragEnter = (e: MouseEvent) => {
                e.preventDefault();
                console.log(e.type, 'handleDragEnter');
                const targetIndex = parseInt(
                    (e.target as HTMLElement).dataset.index
                );
                if (targetIndex !== this.activeIndex) {
                    const activeValue = this.colorUIList[this.activeIndex];
                    const movedValue = this.colorUIList[targetIndex];
                    this.colorUIList[this.activeIndex] = movedValue;
                    this.colorUIList[targetIndex] = activeValue;
                    this.activeIndex = targetIndex;
                    this.renderColorList();
                }
            };

            handleDrop = (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.isUpdated()) {
                    this.saveBtn.classList.remove('hidden');
                }
            };

            handleUpdatePalette = (e: MouseEvent) => {
                const colorInfo = {
                    colors: this.colorUIList.join(','),
                    name: this.name,
                };
                ColorsApi.updateColors(this.id, colorInfo);
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
                const colorRes: Response = await ColorsApi.getColors();
                if (colorRes.ok) {
                    // load localStorage
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
                ColorsApi.createColors(colorData);
            }
        }
    );
})();
