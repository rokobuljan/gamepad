export const elNew = (tag, prop) => Object.assign(document.createElement(tag), prop);
export const el = (sel, PAR) => (PAR || document).querySelector(sel);
export const TAU = Math.PI * 2;
export const norm = (rad) => rad - TAU * Math.floor(rad / TAU);
export const lerpAngles = (A, B, w) => {
    const CS = (1 - w) * Math.cos(A) + w * Math.cos(B);
    const SN = (1 - w) * Math.sin(A) + w * Math.sin(B);
    return Math.atan2(SN, CS);
};