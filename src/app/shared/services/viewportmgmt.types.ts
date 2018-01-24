// Vendor Imports


// App Imports
import { NavOptions } from '../../core/menus';

// Exports
export enum ViewPortChange {
    height,
    orientation
}

export enum OrientationState {
    portrait,
    landscape
}

export function oritentationToString(
    v: OrientationState) {
    return v ===
        OrientationState.portrait ? 'portrait' : 'landscape';
}

export type EventDelta = 1 | -1;

export interface ViewPortEvent {
    event: any;
    width: number;
    height: number;
    type: ViewPortChange;
    orientation: OrientationState;
    delta: EventDelta
}

export interface NavBroadcastOptions {
    onEnlarge: NavOptions;
    onContract: NavOptions;
}

