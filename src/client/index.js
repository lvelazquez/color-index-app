var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
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
    /**
     * ColorIndexList
     * shows current list of color palettes
     * and lists that have been recently added from localstorage
     **/
    var CopyState;
    (function (CopyState) {
        CopyState["EMPTY"] = "EMPTY";
        CopyState["PROGRESS"] = "COPYING";
        CopyState["SUCCESS"] = "COPY_SUCCESS";
        CopyState["ERROR"] = "COPY_ERROR";
    })(CopyState || (CopyState = {}));
    customElements.define('color-index-item', /** @class */ (function (_super) {
        __extends(ColorIndexItem, _super);
        function ColorIndexItem() {
            var _this = _super.call(this) || this;
            _this.colorDataList = [];
            _this.colorUIList = [];
            _this.dragIndex = 0;
            _this.handleDrag = function (e) {
                switch (e.type) {
                    case 'dragstart':
                        console.log('dragstart');
                        _this.dragIndex = parseInt(e.target.dataset.index);
                        break;
                    case 'dragstop':
                        break;
                    case 'dragenter':
                        var targetIndex = parseInt(e.target.dataset.index);
                        if (targetIndex !== _this.dragIndex) {
                            var activeValue = _this.colorDataList[_this.dragIndex];
                            var movedValue = _this.colorDataList[targetIndex];
                            _this.colorDataList[_this.dragIndex] = movedValue;
                            _this.colorDataList[targetIndex] = activeValue;
                            _this.dragIndex = targetIndex;
                            _this.renderColorList();
                            console.log('isListUpdated', _this.isListUpdated());
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
            _this.handleCopyClick = function (e) {
                var type = e.currentTarget.dataset
                    .type;
                _this.copyColors(type);
            };
            return _this;
        }
        ColorIndexItem.prototype.connectedCallback = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, id, name, colors, colorItemTitle;
                return __generator(this, function (_c) {
                    _a = this.dataset, _b = _a.id, id = _b === void 0 ? 'id' : _b, name = _a.name, colors = _a.colors;
                    this.id = id;
                    this.setAttribute('id', this.id);
                    colorItemTitle = this.ownerDocument.createElement('div');
                    colorItemTitle.classList.add('color-index-item-title');
                    colorItemTitle.innerText = name;
                    this.colorDataList = colors
                        .split(',')
                        .map(function (color) { return color.trim(); });
                    this.colorUIList = __spreadArrays(this.colorDataList);
                    this.colorListDiv = this.ownerDocument.createElement('div');
                    this.colorListDiv.classList.add('color-index-item-list');
                    this.colorListDiv.addEventListener('dragstart', this.handleDrag);
                    this.colorListDiv.addEventListener('dragenter', this.handleDrag);
                    this.colorListDiv.addEventListener('dragleave', this.handleDrag);
                    this.colorListDiv.addEventListener('drop', this.handleDrag);
                    // this.colorListDiv.addEventListener('drag', this.handleDrag);
                    this.renderColorList();
                    this.appendChild(colorItemTitle);
                    this.renderCopyButtons();
                    this.appendChild(this.colorListDiv);
                    return [2 /*return*/];
                });
            });
        };
        ColorIndexItem.prototype.disconnectedCallback = function () {
            this.removeEventListener('click', this.copyColors);
        };
        ColorIndexItem.prototype.isListUpdated = function () {
            var updated = false;
            for (var colorIndex in this.colorUIList) {
                updated =
                    this.colorDataList[colorIndex] !==
                        this.colorDataList[colorIndex];
                if (updated) {
                    return true;
                }
            }
            return false;
        };
        ColorIndexItem.prototype.copyColors = function (type) {
            return __awaiter(this, void 0, void 0, function () {
                var copyColorList, _a, colors, id, hexList, rgbList, data, anyNavigator;
                var _this = this;
                return __generator(this, function (_b) {
                    copyColorList = '';
                    this.updateCopyLog(type, CopyState.PROGRESS);
                    _a = this.dataset, colors = _a.colors, id = _a.id;
                    switch (type) {
                        case 'hex':
                            hexList = ("[" + colors[id] + "]").replace(/([#(\w|\d)]{7})/g, '"$1"');
                            copyColorList = hexList;
                            break;
                        case 'rgb':
                            rgbList = colors[id].split(',').map(function (hex) {
                                var rgbValues = _this.convertToRGB(hex.trim());
                                return !rgbValues ? false : "(" + rgbValues + ")";
                            });
                            copyColorList = "[" + rgbList.join(',') + "]";
                            break;
                    }
                    data = [
                        new ClipboardItem({
                            'text/plain': new Blob([copyColorList], {
                                type: 'text/plain'
                            })
                        }),
                    ];
                    anyNavigator = window.navigator;
                    anyNavigator.clipboard.write(data).then(function () {
                        _this.updateCopyLog(type, CopyState.SUCCESS);
                    }, function () {
                        _this.updateCopyLog(type, CopyState.ERROR);
                    });
                    return [2 /*return*/];
                });
            });
        };
        ColorIndexItem.prototype.renderColorList = function () {
            var _this = this;
            this.colorListDiv.innerHTML = '';
            // TODO use pre rendered template
            this.colorUIList.forEach(function (color, i) {
                var colorWrapper = document.createElement('div');
                var colorPiece = document.createElement('div');
                colorWrapper.classList.add('dropzone');
                colorWrapper.classList.add('colorindex-item');
                colorPiece.setAttribute('draggable', 'true');
                colorPiece.setAttribute('data-index', "" + i);
                colorPiece.setAttribute('data-color', color);
                colorPiece.setAttribute('style', "background-color:" + color);
                colorWrapper.appendChild(colorPiece);
                _this.colorListDiv.appendChild(colorWrapper);
            });
        };
        ColorIndexItem.prototype.renderCopyButtons = function () {
            var copyButtonsContainer = document.createElement('div');
            copyButtonsContainer.classList.add('color-index-copy-container');
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
        };
        ColorIndexItem.prototype.convertToRGB = function (hex) {
            var aRgbHex = hex.match(/\w{1,2}/g);
            if (aRgbHex !== null && aRgbHex.length === 3) {
                var aRgb = [
                    parseInt(aRgbHex[0], 16),
                    parseInt(aRgbHex[1], 16),
                    parseInt(aRgbHex[2], 16),
                ];
                return aRgb;
            }
            return false;
        };
        ColorIndexItem.prototype.updateCopyLog = function (type, copyState) {
            var _this = this;
            if (type === void 0) { type = ''; }
            if (copyState === void 0) { copyState = CopyState.EMPTY; }
            var copyStatusTxt = '';
            var copyType = type.toUpperCase();
            switch (copyState) {
                case CopyState.PROGRESS:
                    copyStatusTxt = "Copying " + copyType + " Palette";
                    break;
                case CopyState.SUCCESS:
                    copyStatusTxt = "Copied " + copyType + " Palette Successfully!";
                    break;
                case CopyState.ERROR:
                    copyStatusTxt = "Unable to Copy " + copyType + " Palette";
                    break;
                default:
                    copyStatusTxt = '';
                    break;
            }
            this.copyLog.innerText = copyStatusTxt;
            if (copyState !== CopyState.EMPTY) {
                clearTimeout(this.copyTimeoutId);
                this.copyTimeoutId = setTimeout(function () { return _this.updateCopyLog(); }, 2000);
            }
        };
        return ColorIndexItem;
    }(HTMLElement)));
    customElements.define('color-index-list', /** @class */ (function (_super) {
        __extends(ColorIndexList, _super);
        function ColorIndexList() {
            var _this = _super.call(this) || this;
            _this.colorItems = {};
            _this.colorIds = [];
            return _this;
        }
        ColorIndexList.prototype.connectedCallback = function () {
            return __awaiter(this, void 0, void 0, function () {
                var colorRes, _a, _i, _b, colorId, _c, colors, name_1, colorItem;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, fetch('/getColorData')];
                        case 1:
                            colorRes = _d.sent();
                            if (!colorRes.ok) return [3 /*break*/, 3];
                            _a = this;
                            return [4 /*yield*/, colorRes.json()];
                        case 2:
                            _a.colorItems = _d.sent();
                            this.colorIds = Object.keys(this.colorItems);
                            this.ownerDocument
                                .getElementById('color-index-loader')
                                .classList.add('hidden');
                            for (_i = 0, _b = this.colorIds; _i < _b.length; _i++) {
                                colorId = _b[_i];
                                _c = this.colorItems[colorId], colors = _c.colors, name_1 = _c.name;
                                colorItem = document.createElement('color-index-item');
                                colorItem.setAttribute('data-id', colorId);
                                colorItem.setAttribute('data-colors', colors);
                                colorItem.setAttribute('data-name', name_1);
                                colorItem.classList.add('color-index-item-container');
                                this.appendChild(colorItem);
                            }
                            _d.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return ColorIndexList;
    }(HTMLElement)));
    customElements.define('color-index-palette-input', /** @class */ (function (_super) {
        __extends(PaletteInput, _super);
        function PaletteInput() {
            var _this = _super.call(this) || this;
            _this.isFormHidden = true;
            _this.togglePaletteInput = function () {
                _this.isFormHidden = !_this.isFormHidden;
                _this.updatePaletteInput();
            };
            return _this;
        }
        PaletteInput.prototype.connectedCallback = function () {
            this.revealBtn = this.ownerDocument.createElement('button');
            this.revealBtn.innerText = 'Add New Palette +';
            this.revealBtn.addEventListener('click', this.togglePaletteInput);
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
            this.updatePaletteInput();
        };
        PaletteInput.prototype.disconnectedCallback = function () {
            this.submitBtn.removeEventListener('click', this.savePalette);
            this.input.removeEventListener('blur', this.togglePaletteInput);
        };
        PaletteInput.prototype.updatePaletteInput = function () {
            if (this.isFormHidden) {
                this.revealBtn.classList.remove('hidden');
                this.addFormContainer.classList.add('hidden');
            }
            else {
                this.revealBtn.classList.add('hidden');
                this.addFormContainer.classList.remove('hidden');
                this.input.focus();
            }
        };
        PaletteInput.prototype.savePalette = function (e) {
            return __awaiter(this, void 0, void 0, function () {
                var colorData, colorRes;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            colorData = {
                                colors: '#FFFFF, #FF00F, #00FFF, #FFF00, #00FFF',
                                name: 'My Color Test'
                            };
                            return [4 /*yield*/, fetch('/setColorData', {
                                    headers: {
                                        'Content-Type': 'application/json; charset=utf-8'
                                    },
                                    method: 'POST',
                                    body: JSON.stringify(colorData)
                                })];
                        case 1:
                            colorRes = _a.sent();
                            if (colorRes.ok) {
                                console.log('Color Palette saved');
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        return PaletteInput;
    }(HTMLElement)));
})();
