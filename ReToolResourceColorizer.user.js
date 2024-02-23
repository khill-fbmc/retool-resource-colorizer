// ==UserScript==
// @name         ReTool Resource Colorizer
// @namespace    http://fortunabmc.com/
// @version      0.4.0
// @description  Colorize the header backgrounds of ReTool Workflow Blocks
// @author       khill-fbmc
// @license      MIT
// @match        https://*.retool.com/workflows/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=retool.com
// ==/UserScript==

const GITHUB_URL = "https://github.com/khill-fbmc/retool-resource-colorizer";
const USERSCRIPT_URL = "https://openuserjs.org/scripts/khill-fbmc/ReTool_Resource_Colorizer";
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

            #${MENU_BUTTON_ID}:hover {
                cursor: pointer;
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

function applyStylesToElement(element, styles = {}) {
    Object.assign(element.style, styles);
    return element;
}

function createElementWithText(type, text, styles = {}) {
    const element = document.createElement(type);
    element.textContent = text;
    return applyStylesToElement(element, styles);
}

function createElementWithHTML(type, html, styles = {}) {
    const element = document.createElement(type);
    element.innerHTML = html;
    return applyStylesToElement(element, styles);
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

function processDivs() {
    const containsError = text => /fail|error/i.test(text);
    const containsSuccess = text => /pass|success/i.test(text);
    const containsRrcDirective = text => containsError(text) || containsSuccess(text);

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
}

function createMenu() {
    const menu = document.createElement('div');
    menu.id = MENU_ID;
    document.body.appendChild(menu);

    // Add a menu heading
    const menuHeading = createElementWithText('h5', 'ReTool Resource Colorizer', { padding: '10px', margin: '0', borderRadius: "5px", backgroundColor: 'aliceblue', textAlign: 'center' });
    menu.appendChild(menuHeading);


    const ul = document.createElement('ul');
    menu.appendChild(ul);

    // Define menu items with text and click handlers
    const menuItems = [
        { text: 'Refresh Colors', onClick: () => processDivs() },
        { text: 'GitHub Source', url: GITHUB_URL },
        { text: 'Userscript Page', url: USERSCRIPT_URL },
    ];

    log("Creating", menuItems.length, "Menu Items");
    menuItems.forEach(itemConfig => {
        const li = document.createElement('li');
        const item = createElementWithHTML('a', itemConfig.text, { display: 'block', padding: '5px 10px' });
        item.classList.add(MENU_ITEM_CLASS);

        if (itemConfig.url) {
            item.href = itemConfig.url;
            item.target = "_blank"; // Open in new tab
        } else if (itemConfig.onClick) {
            item.addEventListener('click', itemConfig.onClick);
        }
        li.appendChild(item);
        ul.appendChild(li);
    });

    return menu;
}

function addMenuToFooter() {
    const menu = document.getElementById(MENU_ID);
    const views = document.querySelectorAll('div[data-testid="split-view-view"]');
    const footer = views[views.length - 1];
    if (footer) {
        const menuButton = createElementWithText('span', 'RRC', {
            marginRight: '10px',
            marginLeft: 'auto',
            color: 'var(--text-secondary)'
        });
        menuButton.id = MENU_BUTTON_ID;
        menuButton.onclick = () => {
            menu.style.display = menu.style.display !== 'block' ? 'block' : 'none';
        };
        footer.firstElementChild.style.display = 'flex';
        footer.firstElementChild.style.justifyContent = 'flex-end';
        footer.firstElementChild.appendChild(menuButton);
    }
}

//------------------------------------- MAIN ----------------------------------
(function () {
    'use strict';

    console.log("Starting ReTool Response Colorizer [RRC]");

    addStyleToHead(CUSTOM_CSS);
    log("Added custom CSS to head");

    watchDOMForElements(`div[data-testid^="Workflows::BlockContainer::"]`).then(() => {
        log("Adding Menu");
        createMenu();
        addMenuToFooter();
        log("Coloring Headers");
        processDivs();
    });
})();
