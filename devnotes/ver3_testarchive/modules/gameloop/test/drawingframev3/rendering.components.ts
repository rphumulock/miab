// Vendor Imports
import {
    Component,
    OnInit,
    AfterContentInit,
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
    DragEventsHandler,
    TouchEventsHandler,
    Emoji,
    ResizeEditorService,
    ImgQueueService
} from '../../drawinglibrary';
import {
    ViewPortManagementService,
    OrientationState, ViewPortChange,
    ViewPortEvent,
} from '../../../../shared';
import { EmojiResolveGuard } from '../../twemoji/emoji-resolve.guard';
import { } from './'
import { TestBaseDrawingComponent } from './base.component';

@Component({
    selector: 'mobile-view',
    templateUrl: 'mobileview.component.html',
    styleUrls: ['mobileview.component.css', '../../canvas/drawingboard.css'],
    encapsulation: ViewEncapsulation.None, // required for drawing board
})
export class TestMobileDrawingComponent extends TestBaseDrawingComponent {

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
        super(
            imgQueue, dragEvents, touchEvents,
            resizeEditor, changeDetector, viewportMgr,
            emojiService, modalService, route,
            projectsMgr, userSession, gameSession,
            eventsBroker, router, logger);
    }

}

@Component({
    selector: 'full-view',
    templateUrl: 'fullview.component.html',
    styleUrls: ['fullview.component.css', '../../canvas/drawingboard.css'],
    encapsulation: ViewEncapsulation.None, // required for drawing board
})
export class TestFullViewDrawingComponent extends TestBaseDrawingComponent {

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
        super(
            imgQueue, dragEvents, touchEvents,
            resizeEditor, changeDetector, viewportMgr,
            emojiService, modalService, route,
            projectsMgr, userSession, gameSession,
            eventsBroker, router, logger);
    }
}