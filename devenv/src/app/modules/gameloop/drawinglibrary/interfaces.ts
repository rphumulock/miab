

export interface ImgAttributes {
    width: number;
    height: number;
}

export interface Emoji {
    id: string;
    tag: string;
    isValid: boolean;
    src: string;
    alt: any;
    dataUrl?: string;
    attributes?: ImgAttributes;
}

export interface TouchDnDEventData {
    img: Emoji;
    touchEvent: TouchEvent;
    target: HTMLElement;
}
