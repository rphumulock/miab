'use strict';

export enum ConnectionType {
    created,
    initial,
    reconnect
};

export enum OnlineStatus {
    online,
    offline
}

export enum GameStatus {
    none,
    hosting,
    inqueue,
    started,
    completed,
    err
}

export enum GameState {
    init,
    ready,
    started,
    complete,
    err
}

export enum FrameType {
    text,
    image
};

