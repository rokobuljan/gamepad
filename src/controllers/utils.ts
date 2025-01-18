export const createElement = (
    tag: keyof HTMLElementTagNameMap,
    prop: any
): HTMLElement => Object.assign(document.createElement(tag), prop);

export const TAU = Math.PI * 2;

export const normalize = (rad: number) => rad - TAU * Math.floor(rad / TAU);
