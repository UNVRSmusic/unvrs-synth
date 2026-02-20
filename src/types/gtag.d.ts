// Type definitions for Google Analytics gtag.js
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: {
        [key: string]: any;
      }
    ) => void;
  }

  function gtag(
    command: 'config' | 'event' | 'js' | 'set',
    targetId: string | Date,
    config?: {
      [key: string]: any;
    }
  ): void;
}

export {};
