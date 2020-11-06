
/**
 * 
 * ColorIndexApp Init
 * 
 * Load JSON file with colors
 * Send palettes to color-index-list
 * 
 **/ 

async function fetchColors() {
    console.log("LOADED APP");
    return await fetch("/colorData");
 }
customElements.define('color-index-app', class ColorIndexApp extends HTMLElement {
   constructor() {
    super();

   } 
    async connectedCallback() {
       const colorJSON = await fetchColors();       
        console.log("APP LOADED");
        console.log("colorJSON", colorJSON);        
   }

});

/**
 * ColorIndexList
 * shows current list of color palettes
 * and lists that have been recently added from localstorage
**/
customElements.define('color-index-list', class ColorIndexList extends HTMLElement {

});

/**
 * Save button and indicates that there's data in localStorage that hasn't been saved
 */
customElements.define('color-index-list',  class SavePaletteBtn extends HTMLElement {

});

class PaletteInput {

}