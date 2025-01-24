export interface JSDocs {
    id: number;
    name: PackageNameEnum;
    variant: string;
    kind: number;
    flags: DeclarationFlags;
    children: JSDocsChild[];
    groups: Group[];
    packageName: PackageNameEnum;
    readme: Readme[];
    symbolIdMap: { [key: string]: SymbolIDMap };
    files: Files;
}

export interface JSDocsChild {
    id: number;
    name: ChildName;
    variant: DeclarationVariant;
    kind: number;
    flags: DeclarationFlags;
    comment?: ChildComment;
    children: ChildChild[];
    groups: Group[];
    sources: Source[];
    extendedTypes?: ExtendedType[];
}

export interface ChildChild {
    id: number;
    name: string;
    variant: DeclarationVariant;
    kind: number;
    flags: PurpleFlags;
    sources: Source[];
    signatures?: Signature[];
    overwrites?: InheritedFrom;
    type?: ExtendedType;
    inheritedFrom?: InheritedFrom;
    comment?: ChildComment;
    defaultValue?: string;
}

export interface ChildComment {
    summary: Summary[];
}

export interface Summary {
    kind: Kind;
    text: string;
}

export enum Kind {
    Code = "code",
    RelativeLink = "relative-link",
    Text = "text",
}

export interface PurpleFlags {
    isInherited?: boolean;
    isProtected?: boolean;
}

export interface InheritedFrom {
    type: InheritedFromType;
    target?: number;
    name: string;
    package?: PackageNameEnum;
}

export enum PackageNameEnum {
    RbuljanGamepad = "@rbuljan/gamepad",
    Typescript = "typescript",
}

export enum InheritedFromType {
    Array = "array",
    Intrinsic = "intrinsic",
    Reference = "reference",
}

export interface Signature {
    id: number;
    name: string;
    variant: SignatureVariant;
    kind: number;
    flags: SignatureFlags;
    sources: Source[];
    parameters?: Parameter[];
    type: SignatureType;
    overwrites?: InheritedFrom;
    inheritedFrom?: InheritedFrom;
    comment?: SignatureComment;
}

export interface SignatureComment {
    summary: Summary[];
    blockTags?: BlockTag[];
}

export interface BlockTag {
    tag: string;
    content: Summary[];
}

export interface SignatureFlags {
    isInherited?: boolean;
}

export interface Parameter {
    id: number;
    name: string;
    variant: ParameterVariant;
    kind: number;
    flags: ParameterFlags;
    type: ExtendedType;
    defaultValue?: string;
    comment?: ChildComment;
}

export interface ParameterFlags {
    isRest?: boolean;
}

export interface ExtendedType {
    type: InheritedFromType;
    target?: SymbolIDMap;
    name?: string;
    package?: PackageNameEnum;
    elementType?: ExtendedType;
    typeArguments?: ExtendedType[];
}

export interface SymbolIDMap {
    sourceFileName: SourceFileName;
    qualifiedName: string;
}

export enum SourceFileName {
    NodeModulesTypescriptLIBLIBDOMDTs = "node_modules/typescript/lib/lib.dom.d.ts",
    NodeModulesTypescriptLIBLIBEs2015CollectionDTs = "node_modules/typescript/lib/lib.es2015.collection.d.ts",
    SrcControllersButtonTs = "src/controllers/button.ts",
    SrcControllersControllerOptionsTs = "src/controllers/ControllerOptions.ts",
    SrcControllersControllerStateTs = "src/controllers/ControllerState.ts",
    SrcControllersControllerTs = "src/controllers/controller.ts",
    SrcControllersJoystickTs = "src/controllers/joystick.ts",
    SrcGamepadTs = "src/gamepad.ts",
}

export enum ParameterVariant {
    Param = "param",
}

export interface Source {
    fileName: FileName;
    line: number;
    character: number;
    url: string;
}

export enum FileName {
    ControllersButtonTs = "controllers/button.ts",
    ControllersControllerTs = "controllers/controller.ts",
    ControllersJoystickTs = "controllers/joystick.ts",
    GamepadTs = "gamepad.ts",
}

export interface SignatureType {
    type: PurpleType;
    target?: number;
    name?: ChildName;
    package?: PackageNameEnum;
    declaration?: Declaration;
    types?: InheritedFrom[];
}

export interface Declaration {
    id: number;
    name: string;
    variant: DeclarationVariant;
    kind: number;
    flags: DeclarationFlags;
    children?: Declaration[];
    groups?: Group[];
    sources: Source[];
    type?: DeclarationType;
    defaultValue?: string;
}

export interface DeclarationFlags {}

export interface Group {
    title: string;
    children: number[];
}

export interface DeclarationType {
    type: InheritedFromType;
    name: string;
}

export enum DeclarationVariant {
    Declaration = "declaration",
}

export enum ChildName {
    Boolean = "boolean",
    Button = "Button",
    Gamepad = "Gamepad",
    Joystick = "Joystick",
    Void = "void",
}

export enum PurpleType {
    Intrinsic = "intrinsic",
    Reference = "reference",
    Reflection = "reflection",
    Union = "union",
}

export enum SignatureVariant {
    Signature = "signature",
}

export interface Files {
    entries: { [key: string]: string };
    reflections: Reflections;
}

export interface Reflections {
    "1": number;
}

export interface Readme {
    kind: Kind;
    text: string;
    target?: number;
}
