declare module 'qrcode' {
  export interface QRCodeToCanvasOptions {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  export function toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options?: QRCodeToCanvasOptions,
    callback?: (error: Error | null | undefined) => void
  ): void;

  export function toDataURL(
    text: string,
    options?: QRCodeToCanvasOptions
  ): Promise<string>;
}
