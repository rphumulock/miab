// Vendor Imports
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';

// App Imports
import {
    FirebaseObservable,
    SubscribeOptions,
    EventTypes
} from 'miablib/firebaseutil';
import {
    IGamePlayerEntry,
    NodePaths
} from 'miablib/miab';
import {
    concatPath
} from 'miablib/global';
import { FirebaseProjectService } from '../../../core/firebaseutils';
import { GameSessionService, UserSessionService } from '../../session';
import { NgModalService } from '../../../shared/ngmodalservice';
import { LoggingService } from '../../../shared';

@Component({
    templateUrl: 'lobby.component.html',
    styleUrls: ['lobby.component.css']
})
export class TestLobbyComponent implements OnInit {

    players: any;
    playerCount: number;
    readyToStart: boolean;
    gameCode = 'TestCODE';

    constructor(
        protected modalService: NgModalService,
        protected route: ActivatedRoute,
        protected router: Router,
        protected logger: LoggingService) {
        this.playerCount = 0; // so its never undefined
    }

    ngOnInit() {
        this.setupLobbySubscription();
        this.readyToStart = false; // use this to test enabled/disabled button
    }

    submitStartGame() {
        this.logger.log('Submitting start game request');
    }

    protected setupLobbySubscription() {

        let testPlayers: IGamePlayerEntry[] = [
            { playerName: 'test1',
                userId: '12345601'
            },
            { playerName: 'test2',
                userId: '12345602'
            },
            { playerName: 'test3',
                userId: '12345603'
            },
            { playerName: 'test4',
                userId: '12345604'
            },
            { playerName: 'test5',
                userId: '12345605'
            },
            { playerName: 'test6',
                userId: '12345606'
            },
            { playerName: 'test7',
                userId: '12345607'
            },
            { playerName: 'test8',
                userId: '12345608'
            },
            { playerName: 'test9',
                userId: '12345609'
            },
            { playerName: 'test10',
                userId: '12345610'
            }
        ];

        this.playerCount = testPlayers.length;
        this.players = Observable.of(testPlayers);
    }


}

