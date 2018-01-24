// Vendor Imports
import {
    Component
} from '@angular/core';


// App Imports
import { 
    LoggingService, isMobile 
} from '../../../../shared';
import {
    DragEventsHandler,
    TouchEventsHandler,
    Emoji,
    ResizeEditorService,
    ImgQueueService
} from '../../drawinglibrary';
import { } from './mobileview.component';
import { } from './fullview.component';


@Component({
    template: 
    `
        <mobile-view *ngIf="useMobileView"></mobile-view>
        <full-view *ngIf="!useMobileView"></full-view>
    `,
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
export class TestDrawingBootstrapComponent {

    public useMobileView: boolean;
    constructor(protected logger: LoggingService) {
        this.useMobileView = isMobile(logger);
    }
}

