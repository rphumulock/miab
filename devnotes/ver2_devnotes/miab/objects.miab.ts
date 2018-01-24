'use strict';

import { GameStatus, GameState, ConnectionType, OnlineStatus, FrameType } from './enums.miab';
import { IStringStringMap, INumberStringMap, IAssignedScroll, IStringTMap } from './interfaces.miab';

export class UserGame {
    gameId: string;
    gameCode: string;
    playerIndex: number;
    playerName: string;
    myStatus: GameStatus = GameStatus.none;
    myScrollId: string;
    previousScroll: IAssignedScroll;
    currentScroll: IAssignedScroll;
}

export class StreamUser {
    uniqueId: string;
    pushId: string;
    gameListId: string;
    presence: {
        connection: ConnectionType,
        status: OnlineStatus;
    } = {
        connection: ConnectionType.created,
        status: OnlineStatus.online
    };
    game: UserGame;
}


export class UserGameList {
    id: string;
    user: string;
    myGames: IStringStringMap = {};
}

export class Game {
    id: string;
    user: string;
    gameCode: string;
    gameState: GameState = GameState.init;
    players: INumberStringMap = {};
    playerCount = 0;
    minPlayersReq = 5;
    maxPlayers = 10;
    currentFrame: number = -1;
    scrolls: INumberStringMap = {};
    submissions: number[] = [0,0,0,0,0,0,0,0,0,0,0];
    bgimage: string;
}

export class Frame {
    user: string;
    gameId: string;
    scrollId: string;
    type: FrameType;
    onGameTurn: number;
    val: string;
    element: string;
};

export class Scroll {
    id: string;
    owner: string;
    playerName: string;
    gameId: string;
    // currentUser: string;
    // firebase array of frames
    frames: IStringTMap<Frame> = {};
    bgimage: string;
}

export class LobbyPlayer {
    id: string;
    index: string;
    name: string;
}

export class GameTurnDetails {
    currentGameTurn: number;
    assignedScroll: IAssignedScroll;
    showPrevious: boolean;
    previousFrame: Frame;
    isCompletedGame: boolean;
}
