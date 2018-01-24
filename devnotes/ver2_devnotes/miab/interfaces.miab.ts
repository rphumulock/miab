'use strict';

import { LobbyPlayer, UserGame } from './objects.miab';

export interface IStringTMap<T> { [key: string]: T; };
export interface INumberTMap<T> { [key: number]: T; };

export interface IStringAnyMap extends IStringTMap<any> {};
export interface INumberAnyMap extends INumberTMap<any> {};

export interface IStringStringMap extends IStringTMap<string> {};
export interface INumberStringMap extends INumberTMap<string> {};

export interface IStringNumberMap extends IStringTMap<number> {};
export interface INumberNumberMap extends INumberTMap<number> {};

export interface IStringBooleanMap extends IStringTMap<boolean> {};
export interface INumberBooleanMap extends INumberTMap<boolean> {};

export interface IAssignedScroll {
    id: string;
    playerIndex: number;
}

export interface IGameRequest {
    user: string;
    id: string;
}

export interface IJoinGameRequest {
    id: string;
    user: string;
    gameCode: string;
}

export interface IStartGameRequest{
    id: string;
    user: string;
}

export interface LobbyCollection{
    joined: LobbyPlayer[];
}

export interface NextScrollResults{
    userInfo: UserGame,
    nextId: string
}