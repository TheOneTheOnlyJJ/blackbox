interface Api {
  newUserStorage(): void;
}

declare global {
  interface Window {
    api: Api;
  }
}

// Ensure TypeScript recognizes this file as part of the global declarations
export {};
