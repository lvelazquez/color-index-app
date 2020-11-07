
/**
 * 
 * ColorIndexApp Init
 * 
 * Load JSON file with colors
 * Send palettes to color-index-list
 *  
 **/ 
(function() {
    "use strict";
    interface ColorItems {
        [id: string]: string;
    }
    interface ColorIndexResponse extends Response {
        statusCode: number;
    }
    

    /**
     * ColorIndexList
     * shows current list of color palettes
     * and lists that have been recently added from localstorage
    **/
    customElements.define('color-index-list', class ColorIndexList extends HTMLElement {
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
                         copyColorList = `[${this.colorItems[currentTarget.dataset.key!]}]`;                            
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
            const colorRes: Response = await fetch("/colorData");  
            if(colorRes.ok) {
                this.colorItems  = await colorRes.json();
                this.colorKeys = Object.keys(this.colorItems);
                this.ownerDocument.getElementById("color-index-loader").classList.add("hidden");

                for(let colorKey of this.colorKeys) {
    
                    const colorItemContainer = document.createElement("div");
                    colorItemContainer.setAttribute("data-key", colorKey);
                    colorItemContainer.classList.add("color-item-container");
    
                    const colorItemTitle = document.createElement("div");
                    colorItemTitle.classList.add("color-item-title");
    
                    const colorItemListContainer = document.createElement("div");
                    colorItemListContainer.classList.add("color-item-list");    
                    
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

    customElements.define('palette-input',  class PaletteInput extends HTMLDivElement {
        constructor() {
            super();
            console.log("palette input ");
        }
        connectedCallback() {
            
            const input = this.ownerDocument.createElement("input");
            const submitBtn = this.ownerDocument.createElement("button");
            submitBtn.addEventListener("click", this.savePalette)
            this.appendChild(submitBtn);
            this.appendChild(input);
        }
        savePalette(e: MouseEvent) {
            console.log(e);
        }
    }, { extends: "div" });
    
})();