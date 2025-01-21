export const createElement = (
    tag: keyof HTMLElementTagNameMap,
    prop: any
): HTMLElement => Object.assign(document.createElement(tag), prop);

export const TAU = Math.PI * 2;

export const normalize = (rad: number) => rad - TAU * Math.floor(rad / TAU);

export const userSelectNoneForAllBrowsers: Partial<CSSStyleDeclaration> &
    Record<string, string | null> = {
    userSelect: "none",
    "-webkit-touch-callout": "none" /* iOS Safari */,
    "-webkit-user-select": "none" /* Safari */,
    "-khtml-user-select": "none" /* Konqueror HTML */,
    "-moz-user-select": "none" /* Old versions of Firefox */,
    "-ms-user-select": "none" /* Internet Explorer/Edge */,
    "user-select": "none" /* Non-prefixed version, currently
                                        supported by Chrome, Edge, Opera and Firefox */,
};
