// Vendor Imports

// App Imports

// Exports
export interface SessionErrorEvent {
    message: string;
    error?: any;
    redirect?: string;
    resetSession?: boolean;
}

