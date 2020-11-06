
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
    /**
     * ColorIndexList
     * shows current list of color palettes
     * and lists that have been recently added from localstorage
    **/
    customElements.define('color-index-list', class ColorIndexList extends HTMLElement {
        constructor() {
            super();            
        } 
        async connectedCallback() {
            const colorRes = await fetch("/colorData");               
            const colorItems: ColorItems = await colorRes.json();
            this.appendChild(this.getColorItems(colorItems));
        }

        getColorItems(colorItems: ColorItems): Node {
            let colorItemList: Node = this.ownerDocument.createElement("ul");
            const colorKeys = Object.keys(colorItems);
            for(let colorKey of colorKeys) {
                const colorItemContainer = document.createElement("div");
                colorItemContainer.classList.add("color-item-container");
                const colorItemTitle = document.createElement("div");
                colorItemTitle.classList.add("color-item-title");

                const colorItemListContainer = document.createElement("div");
                colorItemListContainer.classList.add("color-item-list");

                colorItemTitle.innerText = colorKey;
                colorItems[colorKey].split(",").forEach((color)=> {
                    const colorDiv = document.createElement("div");                    
                    colorDiv.setAttribute("style", `background-color:${color}`);
                    colorItemListContainer.appendChild(colorDiv)
                });
                colorItemContainer.appendChild(colorItemTitle);
                colorItemContainer.appendChild(colorItemListContainer);
                colorItemList.appendChild(colorItemContainer);
            }
            return colorItemList;
        }

    });

    /**
     * Save button and indicates that there's data in localStorage that hasn't been saved
     */
    customElements.define('color-save-btn',  class ColorSaveBtn extends HTMLDivElement {
        constructor() {
            super();
        }        
    }, { extends: "button" });

    class PaletteInput {

    }

})();