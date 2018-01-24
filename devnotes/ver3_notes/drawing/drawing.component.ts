// Vendor Imports
import {
    Component,
    OnInit,
    AfterContentInit,
    ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';


// App Imports
import { NodePaths, Frame } from 'miablib/miab';
import { concatPath } from 'miablib/global';
import {
    UserSessionService,
    GameSessionService,
    SessionErrorsService
} from '../../session';
import { FirebaseProjectService } from '../../../core/firebaseutils';
import { NgModalService } from '../../../shared/ngmodalservice';
import { LoggingService } from '../../../shared';
import { AbstractGameTurnComponent } from '../abstract.component';
import { GameTurnDetailsService } from '../services/details.service';
import { GameTurnSubscriptionService } from '../services/subscription.service';
import {
    DragEventsHandler,
    TouchEventsHandler,
    Emoji,
    ResizeEditorService,
    ImgQueueService,
} from '../drawinglibrary';

let blobGen = require('../../../shared/resources/dataUrlToBlob.js');
let DrawingBoard = require('../canvas/drawingboard.js');

@Component({
    templateUrl: 'drawing.component.html',
    styleUrls: ['drawing.component.css', '../canvas/drawingboard.css'],
    encapsulation: ViewEncapsulation.None, // required for drawing board
    /**
     * We wll inject specific services/modules at the component level so they
     * are re-created upon component intialization and do not maintain state
     * across views or the during the app life cycle
     * 
     * Providing the service at the component level ensures that every instance of the 
     * component gets its own, private instance of the service.
     * 
     * https://angular.io/guide/dependency-injection#when-to-use-ngmodule-versus-an-application-component
     * https://angular.io/guide/hierarchical-dependency-injection
     */
    providers: [
        TouchEventsHandler, DragEventsHandler,
        ImgQueueService, ResizeEditorService
    ]
})
export class DrawingFrameComponent extends AbstractGameTurnComponent implements AfterContentInit {

    defaultBoard: any;
    setupEmojiList: boolean;
    emojis: Array<Emoji>;

    constructor(
        public dragEvents: DragEventsHandler,
        public touchEvents: TouchEventsHandler,
        public imgQueue: ImgQueueService,
        public resizeEditor: ResizeEditorService,
        protected detailsService: GameTurnDetailsService,
        protected subscriptionService: GameTurnSubscriptionService,
        protected modalService: NgModalService,
        protected route: ActivatedRoute,
        protected projectsMgr: FirebaseProjectService,
        protected userSession: UserSessionService,
        protected gameSession: GameSessionService,
        protected sessionErrors: SessionErrorsService,
        protected router: Router,
        protected logger: LoggingService) {
        // Invoke the abstract classes contructor - required with inheritance
        super(
            gameSession, projectsMgr, 
            detailsService, subscriptionService,
            modalService, sessionErrors, 
            route, router, logger);
    }

    /**
     * Will first call the base classes ngOnInit function which is 
     * responsible for retreiving and setting this game turns 
     * details. 
     * 
     * It then proceeds to get the emoji list data provided by the 
     * twemoji service accessed via the resolution guard and 
     * ActivatedRoute object
     */
    ngOnInit() {
        super.ngOnInit();

        this.route.data.subscribe(
            (data: any) => {
                if (!data) {
                    this.setupEmojiList = false;
                    return;
                }

                this.logger.log('drawing cmpt data result: ');
                this.logger.object(data);

                if (!data.emoji) {
                    this.setupEmojiList = false;
                    return;
                }

                this.emojis = data.emoji as Array<Emoji>;
                let count = 0;
                let max = 6;
                this.emojis = this.emojis.filter(value => {
                    let returnEmoji = count < max;
                    count++;
                    return returnEmoji;
                });
                this.logger.log('resolver returned ' + this.emojis.length + ' emojis: ');
                this.setupEmojiList = true;
            });
    }

    /**
     * Initializes the drawing board component
     */
    ngAfterContentInit() {

        this.defaultBoard = new DrawingBoard.DrawingBoard.Board(
            'default-board', {
                webStorage: false,
                enlargeYourContainer: true,
                droppable: true,
                errorMessage: 'Your browser does not support canvas!'
            });

        this.imgQueue.initTouchEventListener();
        this.resizeEditor.initTouchEventListener();
        this.touchEvents.initTouchListeners();

        //this.logger.object(this.defaultBoard);
    }

    protected processSubmitFrame(): Promise<any> {

        // https://github.com/Leimi/drawingboard.js/blob/master/js/board.js
        //let imagDataUrl = this.defaultBoard.getImg();
        // custom code added to simple undo history stack to allow 
        let imagDataUrl = this.logger.object(this.defaultBoard.history.getCurrent());

        return this.submitImage(imagDataUrl)
            .then(
            url => {
                this.logger.log('img upload url: ' + url);

                let toSubmit: Frame = new Frame(
                    this.userSession.userId,
                    this.gameSession.gameId,
                    this.details.assignedScroll.scrollId,
                    this.details.currentTurn,
                    false,
                    url
                );

                this.frameSubmitted = true;

                return this.projectsMgr.default.db.ref(concatPath([
                    NodePaths.FRAMES
                ])).push(toSubmit);
            });

    }

    protected async submitImage(imgAsDataUrl: any) {

        let date = new Date(Date.now());

        let newFileName = 'img-' + this.userSession.userId + '-'
            + date.getTime() + '.png';

        let fileLocRef = this.projectsMgr.default.storage.ref('userimages/' + newFileName);

        let fileBlob = blobGen.DataUrlToBlob(imgAsDataUrl);

        let fileUrl: string;

        // https://firebase.google.com/docs/reference/js/firebase.storage.UploadTaskSnapshot
        return fileLocRef.put(fileBlob)
            .then(
            snap => {
                return Promise.resolve(snap.downloadURL);
            });

    }

}


