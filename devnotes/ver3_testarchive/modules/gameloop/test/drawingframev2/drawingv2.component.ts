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
import {
    UserSessionService,
    GameSessionService,
    SessionEventsBroker
} from '../../../session';
import { FirebaseProjectService } from '../../../../core/firebaseutils';
import { NgModalService } from '../../../../shared/ngmodalservice';
import { LoggingService } from '../../../../shared';
import {
    DragEventsHandler,
    TouchEventsHandler,
    Emoji,
    ResizeEditorService,
    ImgQueueService
} from '../../drawinglibrary';


let blobGen = require('../../../../shared/resources/dataUrlToBlob.js');
let DrawingBoard = require('../../canvas/drawingboard.js');

@Component({
    templateUrl: 'drawingv2.component.html',
    styleUrls: ['drawingv2.component.css', '../../canvas/drawingboard.css'],
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
        ImgQueueService, ResizeEditorService,
    ]
})
export class TestDrawingComponentv2 implements AfterContentInit {

    defaultBoard: any;
    canvasId: string;
    setupEmojiList: boolean;
    emojis: Array<Emoji>;

    constructor(
        public imgQueue: ImgQueueService,
        public dragEvents: DragEventsHandler,
        public touchEvents: TouchEventsHandler,
        public resizeEditor: ResizeEditorService,
        protected modalService: NgModalService,
        protected route: ActivatedRoute,
        protected projectsMgr: FirebaseProjectService,
        protected userSession: UserSessionService,
        protected gameSession: GameSessionService,
        protected eventsBroker: SessionEventsBroker,
        protected router: Router,
        protected logger: LoggingService) {
    }

    imgClickTest(event: Event) {

        this.logger.log('test click event');
        this.logger.object(event);
        event.preventDefault();

    }

    openControls = false;
    toggleControls() {
        this.openControls = !this.openControls;
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
                let max = 100;
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
        this.canvasId = 'default-board';
        this.defaultBoard = new DrawingBoard.DrawingBoard.Board(
            this.canvasId, {
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

    submitFrame() {
        this.processSubmitFrame();
    }

    protected processSubmitFrame() {

        // https://github.com/Leimi/drawingboard.js/blob/master/js/board.js
        //let imagDataUrl = this.defaultBoard.getImg();
        // custom code added to simple undo history stack to allow 
        let imagDataUrl = this.logger.object(this.defaultBoard.history.getCurrent());

        this.logger.log('img as dataurl: ' + imagDataUrl);
        /*
        // Already tested and it works...
        return this.submitImage(imagDataUrl)
            .then(
            url => {
                this.logger.log('img upload url: ' + url);
            });
        */
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

    protected getHistoryStack() {
        this.logger.log('history stack: ')
        this.logger.object(this.defaultBoard.history);
        this.logger.object(this.defaultBoard.history.getCurrent());
    }

}


