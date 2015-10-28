﻿
interface IGameObject {
    //bdraw(): void;
    pixelWidth: number;
    pixelHeight: number;
    name: string;
    imagesToLoad: { count: number, name: string }[];
    spriteArray: { count: number, name: string, offset: number }[];
    spriteCanvas: HTMLCanvasElement;
    spriteCount: number;
    spriteImage: HTMLImageElement;
    type: string;
    x: number;
    y: number;
}