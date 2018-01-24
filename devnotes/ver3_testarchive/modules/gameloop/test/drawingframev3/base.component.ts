// Vendor Imports
import {
    Component,
    OnInit,
    AfterContentInit,
    AfterViewInit,
    ViewEncapsulation,
    ChangeDetectorRef
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
    ViewPortManagementService,
    OrientationState,
    ViewPortEvent,
} from '../../../../shared';
import {
    DragEventsHandler,
    TouchEventsHandler,
    Emoji,
    ResizeEditorService,
    ImgQueueService
} from '../../drawinglibrary';
import { EmojiResolveGuard } from '../../twemoji/emoji-resolve.guard';
import { } from '../../../../shared';
import { TestAbstractGameTurnComponent } from './testabstract.component';
import { setTimeout } from 'core-js/library/web/timers';

let blobGen = require('../../../../shared/resources/dataUrlToBlob.js');
let DrawingBoard = require('../../canvas/drawingboard.js');

@Component({
    template: '',
})
export class TestBaseDrawingComponent extends TestAbstractGameTurnComponent implements AfterContentInit, AfterViewInit {

    defaultBoard: any;
    canvasId: string;
    setupEmojiList: boolean;
    emojis: Array<Emoji>;
    collection: Array<Emoji>;

    currentIdx: number;
    collectionMsg: string;
    nextAvail: boolean;
    isLandscape: boolean;
    initialView = {
        isInitial: true,
        isLandscape: false,
        processed: false
    }

    constructor(
        public imgQueue: ImgQueueService,
        public dragEvents: DragEventsHandler,
        public touchEvents: TouchEventsHandler,
        public resizeEditor: ResizeEditorService,
        protected changeDetector: ChangeDetectorRef,
        protected viewportMgr: ViewPortManagementService,
        protected emojiService: EmojiResolveGuard,
        protected modalService: NgModalService,
        protected route: ActivatedRoute,
        protected projectsMgr: FirebaseProjectService,
        protected userSession: UserSessionService,
        protected gameSession: GameSessionService,
        protected eventsBroker: SessionEventsBroker,
        protected router: Router,
        protected logger: LoggingService) {

        super(logger);
        this.currentIdx = 0;
        this.collectionMsg = 'Loading...';
        viewportMgr.change(true).subscribe(this.monitorOrientation);
    }

    imgClickTest(event: Event) {

        this.logger.log('test click event');
        this.logger.object(event);
        event.preventDefault();

    }

    openControls = false;
    toggleControls() {
        this.openControls = !this.openControls;
        this.imgQueue.controlsOpen = this.openControls;
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
                    this.collectionMsg = 'Emoji\'s unavailable :(';
                    this.setupEmojiList = false;
                    this.nextAvail = false;
                    return;
                }

                //this.logger.log('drawing cmpt data result: ');
                //this.logger.object(data);

                if (!data.emoji) {
                    this.setupEmojiList = false;
                    this.nextAvail = false;
                    return;
                }

                this.collection = data.emoji as Array<Emoji>;
                //this.logger.log('resolver returned ' + this.collection.length + ' emojis: ');

                this.displayEmojis(40);

                /*
                this.emojis = data.emoji as Array<Emoji>;
                let count = 0;
                let max = 40;
                this.emojis = this.emojis.filter(value => {
                    let returnEmoji = count < max;
                    count++;
                    return returnEmoji;
                });

                this.logger.log('resolver returned ' + this.emojis.length + ' emojis: ');
                */

                this.setupEmojiList = true;
                this.nextAvail = true;
            });
    }

    ngAfterViewInit() {

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


        // we disabled pre-caching next set of emojis
        // to help mobile devices

        setTimeout(this.preCacheNext, 600);
    }

    protected monitorOrientation = (event: ViewPortEvent) => {
        this.isLandscape = event.orientation === OrientationState.landscape;

        if (this.initialView.isInitial) {
            this.initialView.isLandscape = this.isLandscape;
            this.initialView.isInitial = false;
        } else if (!this.initialView.processed) {
            this.initialView.processed = true;
            if (this.initialView.isLandscape) {
                this.logger.log('requesting change detection!');
                this.logger.log('current url: ' + this.route.snapshot.url);
                let url = '/activegame/' + this.route.snapshot.url;
                //this.router.navigate([url]);
                window.location.reload();
            }
        }

    }



    protected preCacheNext = () => {
        // pre-caching next 80 emojis
        this.emojiService.getEmojis(120)
            .then(
            results => {

                this.collection = this.collection.concat(results);
            });
    }

    protected backAvail(): boolean {
        return this.currentIdx - 40 > 0;
    }

    protected nextEmojis() {

        if (!this.nextAvail) {
            return;
        }

        let nextIndex = this.currentIdx + 40;

        let loadMore = nextIndex >= this.collection.length;

        if (!loadMore) {
            this.displayEmojis(nextIndex);
        } else {
            this.setupEmojiList = false; // hide current emoji list
            this.emojiService.getEmojis(80)
                .then(
                results => {

                    this.logger.log('successfully requested more emojis');

                    let log = {
                        'prevous-length': this.collection.length
                    };

                    this.collection = this.collection.concat(results);

                    log['new-length'] = this.collection.length;
                    log['next-index'] = nextIndex;
                    this.logger.object(log);

                    // incase the new length is still not enough for 
                    // a whole new set of 40 emojis
                    if (nextIndex >= this.collection.length) {
                        let diff = this.collection.length - this.currentIdx;
                        nextIndex = this.currentIdx + diff;
                        this.nextAvail = false;
                    }

                    this.displayEmojis(nextIndex);

                    setTimeout(this.preCacheNext, 400);
                })
                .catch(
                err => {

                    this.nextAvail = false;

                    if (err !== 'no more emojis to load') {
                        this.logger.error('unable to request next set of emojis');
                        this.logger.error(err);
                    } {
                        this.logger.log(err);
                    }

                    // show previous emoji list if available
                    if (this.emojis) {
                        this.setupEmojiList = true;
                    } else {
                        this.collectionMsg = 'Unable to get next emoji view.\n\
                        Emojis no longer available';

                        this.setupEmojiList = false;
                    }

                });
        }

    }

    protected previousEmojis() {

        let nextIndex = this.currentIdx - 40;

        if (nextIndex < 40) {
            return;
        }

        this.displayEmojis(nextIndex);
    }

    protected displayEmojis(nextIndex: number) {

        /*
        this.logger.log('display emoji next requested');
        this.logger.object({
            'next-index': nextIndex,
            'current-index': this.currentIdx,
            length: this.collection.length
        });
        */

        let diff;

        if (nextIndex > this.currentIdx) {
            diff = nextIndex - this.currentIdx;
        } else {
            diff = this.currentIdx - nextIndex;
            diff *= -1;
        }

        let max = this.currentIdx + diff;
        let min = max - Math.sqrt(Math.pow(diff, 2));

        let inView = this.collection.filter(
            (val, index) => {
                let valid = index >= min && index < max;
                return valid;
            });

        if (inView) {
            this.currentIdx = nextIndex;
            this.emojis = inView;
            this.setupEmojiList = true; // show current emoji list
            if (diff < 0) {
                this.nextAvail = true;
            }
        } else {

            let log = {
                'next-index': nextIndex,
                'diff': diff,
                'max': max,
                'min': min
            };

            this.logger.error('error while calculating and updating emoji next view');
            this.logger.error(log);
            this.collectionMsg = 'Unable to get next emoji view.\nEmojis no longer available';
            this.setupEmojiList = false;
        }

    }

    /**
     * Initializes the drawing board component
     */
    ngAfterContentInit() {
        /*
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
        */

        //this.logger.object(this.defaultBoard);
    }

    submitFrame() {
        this.processSubmitFrame();
    }

    protected doneEditingWrapper() {
        if (this.resizeEditor.doneEditingEnabled()) {
            this.toggleControls();
            this.resizeEditor.doneEditing(this.imgQueue);
        }
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


