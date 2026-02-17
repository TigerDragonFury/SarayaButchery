/// <reference types="@google/model-viewer" />

declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string;
        'ios-src'?: string;
        poster?: string;
        alt?: string;
        ar?: boolean;
        'ar-modes'?: string;
        'ar-scale'?: string;
        'ar-placement'?: string;
        'camera-controls'?: boolean;
        'touch-action'?: string;
        'auto-rotate'?: boolean;
        'auto-rotate-delay'?: number;
        'rotation-per-second'?: string;
        'interaction-prompt'?: string;
        'interaction-prompt-style'?: string;
        'interaction-prompt-threshold'?: number;
        'shadow-intensity'?: number;
        'shadow-softness'?: number;
        'environment-image'?: string;
        exposure?: number;
        'camera-orbit'?: string;
        'min-camera-orbit'?: string;
        'max-camera-orbit'?: string;
        'field-of-view'?: string;
        'min-field-of-view'?: string;
        'max-field-of-view'?: string;
        loading?: 'auto' | 'lazy' | 'eager';
        reveal?: 'auto' | 'interaction' | 'manual';
        'skybox-image'?: string;
        'disable-zoom'?: boolean;
        'disable-pan'?: boolean;
        'disable-tap'?: boolean;
        'interpolation-decay'?: number;
        'xr-environment'?: boolean;
        style?: React.CSSProperties;
        className?: string;
        ref?: React.Ref<HTMLElement>;
      },
      HTMLElement
    >;
  }
}
