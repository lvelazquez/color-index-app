
/**
 * 
 * ColorIndexApp Init
 * 
 * Load JSON file with colors
 * Send palettes to colorindex-index-list
 *  
 **/ 

(function() {
    "use strict";
    interface ColorItems {
        [id: string]: string;
    }

    /**
     * ColorIndexList
     * shows current list of color palettes
     * and lists that have been recently added from localstorage
    **/
    customElements.define('colorindex-list', class ColorIndexList extends HTMLElement {
        private colorItems: ColorItems = {};
        private colorKeys: string[] = [];
        constructor() {
            super();            
        } 

        copyColors(e: MouseEvent) {                                                            
            const currentTarget = (e.target as HTMLElement);            
            if(currentTarget !== undefined ) {
                let copyColorList: string = "";
                switch(currentTarget.dataset.type) {
                    case "hex": 
                         const hexList: string = `[${this.colorItems[currentTarget.dataset.key!]}]`.replace(/([#(\w|\d)]{7})/g, '"$1"');
                         copyColorList = hexList;                            
                         break;
                case "rgb":
                        const rgbList = this.colorItems[currentTarget.dataset.key!].split(",").map((hex)=> {                                
                        const rgbValues = this.convertToRGB(hex.trim());                                
                             return !rgbValues ? false : `(${rgbValues})`;
                        });
                        copyColorList = `[${rgbList.join(",")}]`;
                        break; 
             }
             if(copyColorList.length > 1) {
                 const data = [new ClipboardItem({ "text/plain": new Blob([copyColorList], { type: "text/plain" }) })];
                 const anyNavigator: any = window.navigator;
                 anyNavigator.clipboard!.write(data).then(function() {
                     console.log("Copied to clipboard successfully!");
                     }, function() {
                     console.error("Unable to write to clipboard. :-(");
                     });
             }        
            }
               
        }

        disconnectedCallback() {
            this.removeEventListener("click", this.copyColors);
        }

        getCopyButtons(id: string): HTMLElement {

            const copyButtonsContainer = document.createElement("div");
            const copyHex = document.createElement("button");
            copyHex.innerText = "Copy HEX";
            copyHex.setAttribute("data-type", "hex");
            copyHex.setAttribute("data-key", id);
            copyButtonsContainer.appendChild(copyHex);

            const copyRGB = document.createElement("button");
            copyRGB.setAttribute("data-type", "rgb");
            copyRGB.innerText = "Copy RGB";
            copyRGB.setAttribute("data-key", id);
            copyButtonsContainer.appendChild(copyRGB);

            return copyButtonsContainer;
        }

        convertToRGB(hex: string): boolean | number[] {
            var aRgbHex:string[] | null = hex.match(/\w{1,2}/g);
            if(aRgbHex !== null && aRgbHex.length === 3) {
                var aRgb: number[] = [
                    parseInt(aRgbHex[0], 16),
                    parseInt(aRgbHex[1], 16),
                    parseInt(aRgbHex[2], 16)
                ];
                return aRgb;
            }
            
            return false;
        }

        async connectedCallback() {
            const colorRes: Response = await fetch("/getColorData");  
            if(colorRes.ok) {
                this.colorItems  = await colorRes.json();
                this.colorKeys = Object.keys(this.colorItems);
                this.ownerDocument.getElementById("colorindex-loader").classList.add("hidden");

                for(let colorKey of this.colorKeys) {

                    const colorItemContainer = document.createElement("div");
                    colorItemContainer.setAttribute("data-key", colorKey);
                    colorItemContainer.classList.add("colorindex-item-container");
    
                    const colorItemTitle = document.createElement("div");
                    colorItemTitle.classList.add("colorindex-item-title");
    
                    const colorItemListContainer = document.createElement("div");
                    colorItemListContainer.classList.add("colorindex-item-list");   
                    
                    colorItemContainer.appendChild(this.getCopyButtons(colorKey));
    
                    colorItemTitle.innerText = colorKey;
                    this.colorItems[colorKey].split(",").forEach((color)=> {
                        const colorDiv = document.createElement("div");                    
                        colorDiv.setAttribute("style", `background-color:${color}`);
                        colorItemListContainer.appendChild(colorDiv)
                    });

                    colorItemContainer.appendChild(colorItemTitle);
                    colorItemContainer.appendChild(colorItemListContainer);
                    this.appendChild(colorItemContainer);
                }  
    
                this.addEventListener("click", this.copyColors)
            }
            
        }       

    });

    customElements.define('colorindex-palette-input',  class PaletteInput extends HTMLElement {

        private submitBtn: HTMLElement;
        private input: HTMLElement;
        private revealBtn: HTMLElement;
        private addFormContainer: HTMLElement;
        private isFormHidden = true;
        
        constructor() {
            super();                                              
        }

        connectedCallback() {
            this.revealBtn = this.ownerDocument.createElement("button");
            this.revealBtn.innerText = "Add New Palette +";
            this.revealBtn.addEventListener("click", this.togglePaletteInput);

            this.addFormContainer = this.ownerDocument.createElement("div");
            
            this.input = this.ownerDocument.createElement("input");
            this.input.classList.add('colorindex-addpalette-input');
            this.input.addEventListener("blur", this.togglePaletteInput);
            
            this.submitBtn = this.ownerDocument.createElement("button");
            this.submitBtn.classList.add('colorindex-submit-btn');

            this.submitBtn.addEventListener("click", this.savePalette);
            this.submitBtn.innerText = "Save Palette";
            
            this.addFormContainer.appendChild(this.input);
            this.addFormContainer.appendChild(this.submitBtn);

            this.appendChild(this.addFormContainer);  
            this.appendChild(this.revealBtn);

            this.updateUI();
        }        
        
        disconnectedCallback() {
            this.submitBtn.removeEventListener("click", this.savePalette);
            this.input.removeEventListener("blur", this.togglePaletteInput);
        }
        
        togglePaletteInput = () => {
            this.isFormHidden = !this.isFormHidden;
            this.updateUI();
        }

        updateUI() {
            if(this.isFormHidden) {
                this.revealBtn.classList.remove("hidden");
                this.addFormContainer.classList.add("hidden");                 
            } else {
                this.revealBtn.classList.add("hidden");
                this.addFormContainer.classList.remove("hidden");
                this.input.focus();
            }
        }

        async savePalette(e: MouseEvent) {                  
            // fetch color from input text field and package into object
            const colorData = {
                colors: '#FFFFF, #FF00F, #00FFF, #FFF00, #00FFF',
                name: 'My Color Test',
            };
            const colorRes: Response = await fetch("/setColorData", {
                    headers: { "Content-Type": "application/json; charset=utf-8" },
                    method: 'POST',
                    body: JSON.stringify(colorData)
            });
            console.log("colorRes", colorRes);
        }
    });
    
})();