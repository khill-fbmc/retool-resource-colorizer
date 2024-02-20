// ==UserScript==
// @name         ReTool Resource Colorizer
// @namespace    http://fortunabmc.com/
// @version      0.1.0
// @description  Colorize the header backgrounds of ReTool Workflow Blocks
// @author       khill-fbmc
// @license      MIT
// @match        https://*.retool.com/workflows/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=retool.com
// ==/UserScript==


const ERROR_CLASS = 'rrc-error-block';
const SUCCESS_CLASS = 'rrc-success-block';
const MENU_ID = 'rrc-menu';
const MENU_BUTTON_ID = 'rrc-menu-btn';
const MENU_ITEM_CLASS = 'rrc-menu-item';
const CUSTOM_CSS = `
            .${ERROR_CLASS} {
                background-color: rgba(255, 0, 0, 0.2) !important;
            }

            .${SUCCESS_CLASS} {
                background-color: rgba(0, 255, 0, 0.2) !important;
            }

            #${MENU_ID} {
                position: fixed;
                bottom: 30px;
                right: 20px;
                background-color: rgba(255,255,255,0.9);
                padding: 10px;
                border-radius: 5px;
                display: none;
                z-index: 1000;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }

            .${MENU_ITEM_CLASS} {
                padding: 5px;
                margin-bottom: 5px; /* Space between items */
            }

            .${MENU_ITEM_CLASS}:hover, .${MENU_BUTTON_ID}:hover {
                background-color: #efefef;
            }

            .${MENU_ITEM_CLASS}:last-child {
                margin-bottom: 0; /* Remove margin for the last item */
            }
        `;

const log = (...args) => console.log("[RRC]", ...args);

function isValidCSSColor(color) {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
}

function createElementWithText(type, text, styles = {}) {
    const element = document.createElement(type);
    element.textContent = text;
    Object.assign(element.style, styles);
    return element;
}

function addStyleToHead(styles) {
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.appendChild(document.createTextNode(styles));
    document.head.appendChild(styleElement);
}

function watchDOMForElements(selector) {
    return new Promise((resolve, reject) => {
        const observer = new MutationObserver((mutationsList, observer) => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                observer.disconnect();
                resolve(elements);
            }
        });

        observer.observe(document.body, { subtree: true, childList: true });
    });
}

//------------------------------------- MAIN ----------------------------------
(function() {
    'use strict';

    const containsError = (text) => text.includes("error");
    const containsSuccess = (text) => text.includes("success");
    const containsRrcDirective = (text) => containsError(text) || containsSuccess(text);

    const processDivs = () => {
        const nodes = document.querySelectorAll('div[data-testid^="Workflows::BlockContainer::"]');

        log("Found", nodes.length, "Resource Blocks");

        nodes.forEach(div => {
            const extractedText = div.getAttribute('data-testid').split("::")[2];
            //if (containsRrcDirective(extractedText)) {
                //log(extractedText, "contains a directive");

                const header = div.querySelector(".blockHeader");
                if (header) {
                    let cssColor = '';
                    if (extractedText.includes("_$")) {
                        const colorName = extractedText.split("_$")[1];
                        if (isValidCSSColor(colorName)) {
                            cssColor = colorName;
                        } else {
                            log("-> Invalid CSS color name:", colorName);
                        }
                    } else {
                        const cssClass = containsError(extractedText) ? ERROR_CLASS : containsSuccess(extractedText) ? SUCCESS_CLASS : "";
                        if (cssClass) {
                            header.classList.add(cssClass);
                            log("Applied css class", cssClass, "to", extractedText);
                        }

                    }

                    if (cssColor) {
                        header.style.backgroundColor = cssColor;
                        log("Applied", cssColor, "to", extractedText);
                    }
                }
            //}
        });
    };

    const createMenu = () => {
        const menu = createElementWithText('ul', '');
        menu.id = MENU_ID;
        document.body.appendChild(menu);

        // Define menu items with text and click handlers
        const menuItems = [
            {text: 'Menu Item 1', onClick: () => alert('Clicked Item 1')},
            {text: 'Menu Item 2', onClick: () => alert('Clicked Item 2')},
            // Add more items as needed
        ];
        log("Creating", menuItems.length, "Menu Items");
        menuItems.forEach(itemConfig => {
            const item = createElementWithText('li', itemConfig.text);
            item.classList.add(MENU_ITEM_CLASS);
            if (itemConfig.onClick) {
                item.addEventListener('click', itemConfig.onClick);
            }
            menu.appendChild(item);
        });

        return menu;
    };

    const toggleMenuVisibility = () => {
        const menu = document.getElementById(MENU_ID);
        menu.style.display = menu.style.display !== 'block' ? 'block' : 'none';
    };

    const addMenuToFooter = () => {
        const views = document.querySelectorAll('div[data-testid="split-view-view"]');
        const footer = views[views.length - 1];
        if (footer) {
            const menuButton = createElementWithText('span', 'RRC', {
                marginRight: '10px',
                marginLeft: 'auto',
                color: 'var(--text-secondary)'
            });
            menuButton.id = MENU_BUTTON_ID;
            menuButton.onclick = toggleMenuVisibility;
            footer.firstElementChild.style.display = 'flex';
            footer.firstElementChild.style.justifyContent = 'flex-end';
            footer.firstElementChild.appendChild(menuButton);
        }
    };


    // Initialization
    console.log("Starting ReTool Response Colorizer [RRC]");
    addStyleToHead(CUSTOM_CSS);
    log("Added custom CSS to head");
    const main = async () => {
        await watchDOMForElements(`div[data-testid^="Workflows::BlockContainer::"]`);
        log("Adding Menu");
        createMenu()
        addMenuToFooter();
        log("Coloring Headers");
        processDivs();
    };
    main();
    /*
    setTimeout(() => {
        console.log("ReTool Response Colorizer is GO!");
        addMenuToFooter();
        processDivs();
    }, 5000);
    */
})();
