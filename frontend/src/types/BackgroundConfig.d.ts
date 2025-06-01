export type BackgroundType = "image" | "video" | "threejs" | "color";

export interface BaseBackgroundConfig {
  type: BackgroundType;
}

export interface ImageBackgroundConfig extends BaseBackgroundConfig {
  type: "image";
  src: string;
  alt?: string;
}

export interface VideoBackgroundConfig extends BaseBackgroundConfig {
  type: "video";
  src: string;
  options?: {
    autoPlay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;
  };
}

export interface ThreeJSBackgroundConfig extends BaseBackgroundConfig {
  type: "threejs";
  sceneId: string;
  params?: Record<string, unknown>;
}

export interface ColorBackgroundConfig extends BaseBackgroundConfig {
  type: "color";
  value: string;
}

export type BackgroundConfig =
  | ImageBackgroundConfig
  | VideoBackgroundConfig
  | ThreeJSBackgroundConfig
  | ColorBackgroundConfig;

export interface PageBackgroundSettings {
  [pageId: string]: BackgroundConfig;
}
