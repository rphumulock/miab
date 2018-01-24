// Vendor Imports

// App Imports

// Exports
export enum RedirectAction {
    NewRedirect,
    StartRoute,
    ClearQueue
}

export interface RedirectOptions {
    source: string;
    action: RedirectAction;
    url?: string;
    defer?: boolean;
}
