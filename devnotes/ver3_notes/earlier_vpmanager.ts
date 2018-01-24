// Vendor Imports
import { Injectable, ReflectiveInjector } from '@angular/core';
import { Router } from '@angular/router';
//import { Event } as RoutingEvent from '@angular/router';
import { Subject, Observable } from 'rxjs';

// App Imports
import { LoggingService } from '../';
import { isMobile, isApple } from '../';
import { NavMenuService, NavOptions } from '../../core/menus';

export enum ViewPortChange {
    height,
    orientation
}

export enum OrientationState {
    portrait,
    landscape
}

export function oritentationToString(
    v: OrientationState) {
    return v ===
        OrientationState.portrait ? 'portrait' : 'landscape';
}

export interface ViewPortEvent {
    event: any;
    width: number;
    height: number;
    type: ViewPortChange;
    orientation: OrientationState;
}

export interface NavBroadcastOptions {
    onEnlarge: NavOptions;
    onContract: NavOptions;
}

/**
 * This class is responsible for monitoring viewport changes
 * and emitting events so we can react to the changes on devices
 * the present challenges to our view
 * template
 * 
 * default functions:
 * - onfocus/onblur: if iphone, hide menus, emit viewport event
 * - resize: determine orientation vs height. hide menus, emit viewport event
 */
@Injectable()
export class ViewPortManagementService {

    /**
     * exposes a observable that components with forms 
     * can subscribe to and use to adjust to changes
     * in their view.
     */
    get change(): Observable<ViewPortEvent> { return this.subject.asObservable(); };
    /**
     * the subject we use to emit our viewport change
     * events to any subscriber
     */
    protected subject: Subject<ViewPortEvent>;
    /**
     * Will return the iOS version or false
     * https://gist.github.com/Craga89/2829457
     */
    protected iOS: number | boolean;

    protected initialHeight: number;
    protected initialWidth: number;

    protected lastHeight: number;
    protected lastWidth: number;

    protected initialOrientation: OrientationState;
    protected lastOrientation: OrientationState;


    protected navService: NavMenuService;
    protected enableUpdatesQueue: Array<NavBroadcastOptions>;
    protected allowNavUpdates: boolean;
    protected navBroadcastOptions: NavBroadcastOptions;

    //protected navUpdateOnResizeGrowth: NavOptions;
    //protected navUpdateOnResizeShrunk: NavOptions;
    protected currentUrl: string;

    constructor(
        protected logger: LoggingService,
        protected router: Router) {

        this.currentUrl = this.router.routerState.snapshot.url;
        this.router.events.subscribe(this.routingEvent);

        this.initialHeight = window.innerHeight;
        this.initialWidth = window.innerWidth;
        this.lastWidth = window.innerWidth;
        this.lastHeight = window.innerHeight;

        this.allowNavUpdates = false;

        if (this.initialWidth > this.initialHeight) {
            this.initialOrientation = OrientationState.landscape;
            this.lastOrientation = OrientationState.landscape;
        } else {
            this.initialOrientation = OrientationState.portrait;
            this.lastOrientation = OrientationState.portrait;
        }

        //this.requestNavService();

        this.iOS = isApple(this.logger);

        this.logger.log('viewport manager service constructor');
        this.printTb(this.initialWidth, this.initialHeight,
            this.lastWidth, this.lastHeight);

        this.subject = new Subject<ViewPortEvent>();
        window.addEventListener('orientationchange', this.screenSizeChanged);
        window.addEventListener('resize', this.screenSizeChanged);
    }

    /**
     * Uses angulars injector class to instantiate the
     * NavMenuService and its dependencies
     * 
     * @see https://angular.io/guide/dependency-injection
     * @see https://angular.io/api/core/ReflectiveInjector
     */
    protected requestNavService() {
        this.logger.log('requesting new injector for navservice');
        let injector = ReflectiveInjector.resolveAndCreate([NavMenuService, LoggingService]);
        this.logger.object(injector);
        this.navService = injector.get(NavMenuService);
        this.logger.object(this.navService);
    }

    /**
     * This is expected to be used on components that use 
     * input elements. 
     * 
     * This enables automated navmenuservice updates if
     * it is determined that the virtual keyboard is 
     * being shown
     * @param options viewport navmenuservice options
     */
    public enableViewPortNavChanges(
        navMenusService: NavMenuService,
        options?: NavBroadcastOptions) {

        this.navService = navMenusService;
        let updateOptions = this.getNavBroadcastOptions(options);
        this.logger.log(
            'enable viewport nav changes requested.\
             | onEnlarge: ' + this.navService.mapping(updateOptions.onEnlarge) + '\
             | onContract: ' + this.navService.mapping(updateOptions.onContract));

        if (this.enableUpdatesQueue == undefined || this.enableUpdatesQueue == null) {
            this.logger.log('applying viewport navupdate settings now');
            this.allowNavUpdates = true;
            this.navBroadcastOptions = updateOptions;
            // this is required so the next time is queues the request because its a navigation away 
            this.enableUpdatesQueue = [];
        } else {
            this.logger.log('adding viewport navupdate settings to queue');
            this.enableUpdatesQueue = [updateOptions];
        }

        this.logger.object(this.enableUpdatesQueue);

    }

    /**
     * Will return a NavBroadcastOptions object. If there
     * are no options or they are null we return default
     * options of HideAll, and ShowAll
     * @param options viewport navmenuservice options
     */
    protected getNavBroadcastOptions(
        options?: NavBroadcastOptions): NavBroadcastOptions {
        if (!options) {
            return {
                onEnlarge: NavOptions.ShowAll,
                onContract: NavOptions.HideAll
            }
        } else {
            return options;
        }
    }

    /**
     * This callback can be applied to a component with input
     * forms. 
     * 
     * It assumes that the element using this to 
     * receive and react to the events is an input element
     * 
     * Will only respond when the device in question is 
     * an iOS device
     * 
     * @param event onfocus event object
     */
    public onfocus = (event: Event) => {
        this.logger.log('viewport onfocus event received. isIOS: ' + this.iOS);
        if (this.iOS) {
            if (this.navService && this.allowNavUpdates) {
                this.navService.update(this.navBroadcastOptions.onContract);
            }
            let vpEvent: ViewPortEvent = {
                'event': event,
                width: window.innerWidth,
                height: window.innerHeight,
                type: ViewPortChange.height,
                orientation: this.lastOrientation
            };

            this.logger.object(vpEvent);
            this.subject.next(vpEvent);
        }
    }

    /**
     * This callback can be applied to a component with input
     * forms. 
     * 
     * It assumes that the element using this to 
     * receive and react to the events is an input element
     * 
     * Will only respond when the device in question is 
     * an iOS device
     * 
     * @param event onblur event object
     */
    public onblur = (event: Event) => {
        this.logger.log('viewport onblur event received. isIOS: ' + this.iOS);
        if (this.iOS) {
            if (this.navService && this.allowNavUpdates) {
                this.navService.update(this.navBroadcastOptions.onEnlarge);
            }
            let vpEvent: ViewPortEvent = {
                'event': event,
                width: window.innerWidth,
                height: window.innerHeight,
                type: ViewPortChange.height,
                orientation: this.lastOrientation
            };

            this.logger.object(vpEvent);
            this.subject.next(vpEvent);
        }
    }

    /**
     * Window resize event callback used to monitor
     * when virtual keyboards are shown and will
     * automate some changes to the dom
     * @param event window resize event callback
     */
    protected screenSizeChanged = (event: Event) => {

        let eventHeight = window.innerHeight;
        let eventWidth = window.innerWidth;
        let isOrientation = event.type == 'orientationchange' ||
            this.isOrientationChange(eventWidth, eventHeight);

        this.printTb(eventWidth, eventHeight, this.lastWidth, this.lastHeight);
        this.logger.log('window received a resize/orientation event...:');
        this.logger.log('type: ' + event.type);
        this.logger.object(event);

        if (!isOrientation) {
            this.processResizeChange(eventHeight);
        } else {
            this.lastOrientation =
                this.windowOrientation(eventWidth, eventHeight);
        }

        let vpEvent: ViewPortEvent = {
            'event': event,
            width: window.innerWidth,
            height: window.innerHeight,
            type: isOrientation ? ViewPortChange.orientation : ViewPortChange.height,
            orientation: this.lastOrientation
        };

        this.logger.log('viewportmanager broadcasting event:');
        this.logger.object(vpEvent);

        this.lastHeight = window.innerHeight;
        this.lastWidth = window.innerWidth;
        this.subject.next(vpEvent);
    }

    /**
     * Assumes that the resize event was processed and 
     * determined not to be an orientation change. 
     * 
     * This will only change when this is a mobile device
     * 
     * @param height the viewport resize height
     */
    protected processResizeChange(height: number) {
        if (isMobile(this.logger) && !this.iOS) {
            if (height < this.lastHeight) {
                this.logger.log('viewport size has shrunk. assuming virtual keyboard opened');
                this.logger.object(this);
                if (this.navService && this.allowNavUpdates) {
                    this.navService.update(this.navBroadcastOptions.onContract);
                }
            } else if (height > this.lastHeight) {
                this.logger.log('viewport size has grown. assuming virtual keyboard closed');
                if (this.navService && this.allowNavUpdates) {
                    this.navService.update(this.navBroadcastOptions.onEnlarge);
                }
            }
        }
    }

    /**
     * Will return the window orientation with 
     * based on the provided width and height
     * @param width viewport width 
     * @param height viewport height
     */
    protected windowOrientation(width: number, height: number) {
        return (width > height) ? OrientationState.landscape :
            OrientationState.portrait;
    }

    /**
     * Will attempt to determine if an viewport orientation
     * change has occurred due to the windows new
     * with and height dimensions
     * @param width viewport width during this event
     * @param height viewport height during this event
     */
    protected isOrientationChange(width: number, height: number) {
        let current: OrientationState = this.windowOrientation(width, height);

        this.logger.log(
            'detected device orientation: ' + oritentationToString(current));

        let isChange = false;
        if (this.lastOrientation !== current) {
            switch (current) {
                case OrientationState.landscape:
                    isChange = width > this.lastWidth;
                    break;
                case OrientationState.portrait:
                    isChange = height > this.lastHeight;
                    break;
            }
        }

        this.logger.log(
            'is new orientation change per width/height: ' + isChange);
        return isChange;
    }

    /**
     * Will print some troubleshooting
     * values when working with this service
     * @param width current viewport width
     * @param height current viewport height
     */
    protected printTb(
        width: number, height: number,
        lastWidth: number, lastHeight: number) {

        let msgHeader = '\n-----  ----  printing tb information ----  -----';

        let msgPart1 = '\nurl: ' + this.currentUrl;

        let msgPart2 = '\nwidth: ' + width + ' | height: ' + height;

        let msgPart3 = '\nlast width: ' + lastWidth + ' | last height: ' + lastHeight;

        let msgPart4 = '\nisMobile: ' + isMobile(this.logger) +
            ' | initialOrientation: ' + oritentationToString(this.initialOrientation);

        let msgPart5 = '\nisApple: ' + this.iOS + ' | isOrientationChange: ' +
            this.isOrientationChange(width, height);

        let msgPart6 = '\nnavService Available: ' + (this.navService ? 'true' : 'false')
            + ' | navService Enabled: ' + this.allowNavUpdates;

        let wholeMsg = msgHeader + msgPart1 + msgPart2 + msgPart3 +
            msgPart4 + msgPart5 + msgPart6;

        this.logger.log(wholeMsg);
    }

    /**
     * Routing events callback which will reset 
     * this managers resize growth and shrunk 
     * settings when the current url which uses
     * this service changes.
     */
    protected routingEvent = (event: any) => {
        //this.logger.log('routing event received in viewport management service');
        //this.logger.log(event.toString());

        let typeRegex = /^([\w]+)\(/;
        let type = typeRegex.exec(event.toString())[1];

        let path = '';
        let pathRegexPatterns = [
            /\(path: ([^)]+)\)/,
            /urlAfterRedirects: \'([^\']+)\'/,
            /\([^)]\)/
        ];
        for (let i = 0; i < pathRegexPatterns.length; i++) {
            //this.logger.log('testing pattern number: ' + i + '| pattern: ' + pathRegexPatterns[i]);
            let matchArr = pathRegexPatterns[i].exec(event.toString());
            if (matchArr) {
                path = matchArr[1];
                break;
            }
        }

        //this.logger.log('event: ' + type + ' | path: ' + path);
        if (type === 'NavigationEnd') {

            if (this.currentUrl !== path) {
                this.logger.log(
                    'viewport manager caught navigation away from current url.\
                    \nprevious path: ' + this.currentUrl + ' | new path: ' + path);
                
                this.logger.log('navmenuservice broadcast options queue:')
                this.logger.object(this.enableUpdatesQueue);
                if (this.enableUpdatesQueue && this.enableUpdatesQueue[0]) {
                    this.allowNavUpdates = true;
                    this.navBroadcastOptions = this.enableUpdatesQueue[0];
                    this.enableUpdatesQueue = []; // empty the queue
                } else {
                    this.allowNavUpdates = false;
                    this.navBroadcastOptions = null;
                }
                
            }
            this.currentUrl = path;
        }

    }


}

