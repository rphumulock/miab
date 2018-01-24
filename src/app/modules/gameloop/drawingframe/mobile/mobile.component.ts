// Vendor Imports
import {
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';


// App Imports
import {
    UserSessionManager,
    GameSessionManager,
    SessionEventsBroker
} from '../../../session';
import {
    DragEventsHandler,
    TouchEventsHandler,
    ResizeEditorService,
    ImgQueueService
} from '../../drawinglibrary';
import {
    LoggingService,
    NgModalService,
    ViewPortManagementService,
    FirebaseProjectService
} from '../../../../shared';
import { EmojiResolveGuard } from '../../twemoji/emoji-resolve.guard';
import { BaseDrawingComponent } from '../base.component';
import {
    GameLoopManager,
    GameLoopEventsBroker,
} from '../../services';

@Component({
    selector: 'mobile-drawing',
    templateUrl: 'mobile.component.html',
    styleUrls: ['mobile.component.css', '../../canvas/drawingboard.css'],
    encapsulation: ViewEncapsulation.None, // required for drawing board
})
export class MobileDrawingComponent extends BaseDrawingComponent {

    previousMessage: string;

    constructor(
        // drawing specific
        public imgQueue: ImgQueueService,
        public dragEvents: DragEventsHandler,
        public touchEvents: TouchEventsHandler,
        public resizeEditor: ResizeEditorService,
        protected emojiService: EmojiResolveGuard,
        // abstract class
        protected eventsBroker: GameLoopEventsBroker,
        protected globalEventsBroker: SessionEventsBroker,
        protected gameloopManager: GameLoopManager,
        protected userSession: UserSessionManager,
        protected gameSession: GameSessionManager,
        protected projectsMgr: FirebaseProjectService,
        protected modalService: NgModalService,
        protected viewportMgr: ViewPortManagementService,
        protected router: Router,
        protected logger: LoggingService
    ) {
        super(imgQueue, dragEvents, touchEvents,
            resizeEditor, emojiService,
            eventsBroker, globalEventsBroker,
            gameloopManager, userSession, gameSession,
            projectsMgr, modalService,
            viewportMgr, router, logger);

    }

    protected processGameTurn() {
        this.previousMessage = this.details.previousFrame.val;
    }

}
