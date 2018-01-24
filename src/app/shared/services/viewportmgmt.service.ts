// Vendor Imports
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
//import { Event } as RoutingEvent from '@angular/router';
import { Subject, Observable } from 'rxjs';

// App Imports
import { LoggingService } from '../';
import { isMobile, isApple } from '../';
import { NavMenuService, NavOptions } from '../../core/menus';
import {
    ViewPortChange,
    OrientationState,
    oritentationToString,
    EventDelta,
    ViewPortEvent,
    NavBroadcastOptions
} from './viewportmgmt.types';


type EventSource = -1 | 0 | 1;

declare global {
    interface Window {
        rootInjector: any;
    }
};

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
    protected disableUpdatesQueue: Array<number>;
    protected disableNavUpdates: boolean;
    public customNavBroadcastOptions: NavBroadcastOptions;

    protected keyboardOpen: boolean;
    protected lastEventOrientationChange: boolean;
    protected lastEvent: ViewPortEvent;
    protected currentUrl: string;

    constructor(
        protected logger: LoggingService,
        protected router: Router) {

        this.currentUrl = this.router.routerState.snapshot.url;
        this.router.events.subscribe(this.routingEvent);

        this.readInitialDimensions();

        this.iOS = isApple(this.logger);

        window.addEventListener('orientationchange', this.screenSizeChanged);
        window.addEventListener('resize', this.screenSizeChanged);

        this.subject = new Subject<ViewPortEvent>();
        setTimeout(this.completeInitalization, 100);

    }


    /**
     * exposes a observable that components with forms 
     * can subscribe to and use to adjust to changes
     * in their view.
     */
    public change(requestLast: boolean): Observable<ViewPortEvent> {
        if (requestLast) {
            setTimeout(this.sendLastEvent, 50);
        }
        return this.subject.asObservable();
    };

    protected sendLastEvent = () => {
        while (!this.lastEvent) { } // wait for class to init

        this.subject.next(this.lastEvent);
    }

    protected readInitialDimensions() {
        this.initialHeight = window.innerHeight;
        this.initialWidth = window.innerWidth;
        this.lastWidth = window.innerWidth;
        this.lastHeight = window.innerHeight;

        this.disableNavUpdates = false;

        if (this.initialWidth > this.initialHeight) {
            this.initialOrientation = OrientationState.landscape;
            this.lastOrientation = OrientationState.landscape;
        } else {
            this.initialOrientation = OrientationState.portrait;
            this.lastOrientation = OrientationState.portrait;
        }
    }

    /**
     * Uses angulars injector class to instantiate the
     * NavMenuService and its dependencies
     * 
     * 
     * @see https://angular.io/guide/dependency-injection
     * @see https://stackoverflow.com/questions/36455305/accessing-root-angular-2-injector-instance-globally
     */
    protected completeInitalization = () => {

        //this.logger.log('requesting navservice from global injector');
        this.navService = window.rootInjector.get(NavMenuService);
        //this.logger.object(this.navService);

        this.newProcessEvent(new Event('ViewPort Service Constructor'), -1);
    }

    /**
     * This is expected to be used on components that
     * require a full view
     * 
     * A behavior we noticed is that the navigation end 
     * event fires after a route is validated, accepted and 
     * the component renders. This means that the component will
     * usually call this function before the event fires. 
     * 
     * This can be a problem because this services routing event
     * callback would then nullify the recent disable request.
     * 
     * So we use queue such that the routing event callback will
     * see if a component requested this to be disabled and will use 
     * that setting instead of simply resetting this
     * service and re-enabling it. 
     * @param options viewport navmenuservice options
     */
    public requestDisableNavUpdates() {

        if (this.disableUpdatesQueue === undefined || this.disableUpdatesQueue == null) {

            this.disableNavUpdates = true;

            this.disableUpdatesQueue = [];
        } else {
            this.disableUpdatesQueue = [1];
        }

        this.newProcessEvent(new Event('Disable Viewport Updates'), -1);

    }



    /**
     * Will return a NavBroadcastOptions object. If there
     * are no options or they are null we return default
     * options of HideAll, and ShowAll
     * @param options viewport navmenuservice options
     */
    protected getNavBroadcastOptions(): NavBroadcastOptions {
        if (!this.customNavBroadcastOptions) {
            return {
                onEnlarge: NavOptions.ShowAll,
                onContract: NavOptions.HideAll
            }
        } else {
            return this.customNavBroadcastOptions;
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
            this.newProcessEvent(event, 1);
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
            this.newProcessEvent(event, 0);
        }
    }

    protected canBroadCast(): boolean {
        if (this.navService && !this.disableNavUpdates) {
            return true;
        }

        return false;
    }

    protected newProcessEvent(event: Event, source: EventSource) {

        this.currentUrl = this.router.routerState.snapshot.url;

        let eventHeight = window.innerHeight;
        let eventWidth = window.innerWidth;

        //this.printTb(event.type, eventWidth, eventHeight, this.lastWidth, this.lastHeight);

        let orientation = this.windowOrientation(eventWidth, eventHeight);

        let isOrientationChange = false;

        //this.logger.log('event source: ' + source);

        if (this.iOS && (source === -1)) {
            /**
             * iOS orientation change event pattern:
             * 
             * First event:
             *  - type = resize
             *  - updates = width & height
             * 
             * Second event:
             *  - type = orientationchange
             *  - updates = same width & height
             */
            isOrientationChange = true;
        } else {

            /**
             * Android orientation change event pattern:
             * 
             * First event:
             *  - type = orientationchange
             *  - updates = width
             * 
             * Second event:
             *  - type = resize
             *  - updates: height
             * 
             */
            if (this.lastEventOrientationChange) {
                this.lastEventOrientationChange = false;
                isOrientationChange = true;
                orientation = this.lastOrientation;
            } else if (event.type === 'orientationchange') {
                isOrientationChange = true;
                this.lastEventOrientationChange = true;
                if (this.lastOrientation === OrientationState.landscape) {
                    orientation = OrientationState.portrait;
                } else {
                    orientation = OrientationState.landscape;
                }
            }

        }

        let isLandscape = orientation === OrientationState.landscape;

        if (!isOrientationChange) {
            isOrientationChange = this.isOrientationChange(eventWidth, eventHeight);
        }

        let mobile = isMobile(this.logger);

        let isActiveGame =
            this.router.routerState.snapshot.url.indexOf('activegame') !== -1;

        let log = {
            'keyboardopen': this.keyboardOpen,
            'isorietchange': isOrientationChange,
            'activegame': isActiveGame,
            'ismobile': mobile,
            'canbroadcast': this.canBroadCast(),
            'islandscape': isLandscape
        };

        //this.logger.log('pre-keyboard open check values');
        //this.logger.object(log);


        if (source !== -1) {
            this.keyboardOpen = Boolean(source);
        } else {
            if (!isOrientationChange && mobile) {
                this.keyboardOpen = eventHeight < this.lastHeight;
            }
        }

        let stop = false;
        let step = 1;


        log = {
            'keyboardopen': this.keyboardOpen,
            'isorietchange': isOrientationChange,
            'activegame': isActiveGame,
            'ismobile': mobile,
            'canbroadcast': this.canBroadCast(),
            'islandscape': isLandscape
        }

        //this.logger.object(log);


        while (!stop && step < 5) {

            //this.logger.log('processing event - step: ' + step);

            switch (step) {

                case 1:
                    stop = !mobile || isActiveGame;
                    break;

                case 2:
                    stop = this.keyboardOpen;
                    if (this.keyboardOpen && this.canBroadCast()) {
                        this.navService.update(this.getNavBroadcastOptions().onContract);
                    }
                    break;


                case 3:
                    if (isLandscape) {
                        stop = true;
                        if (this.canBroadCast()) {
                            this.navService.update(NavOptions.HideFooter);

                            if (!this.keyboardOpen) {
                                this.navService.update(NavOptions.ShowHeader);
                            }
                        }

                    }
                    break;

                case 4:
                    stop = true;
                    if (!this.keyboardOpen && this.canBroadCast()) {
                        this.navService.update(this.getNavBroadcastOptions().onEnlarge);
                    }
                    break;

            }

            step++;

        }

        let eventDelta: EventDelta;
        let eventType: ViewPortChange;

        if (!isOrientationChange) {
            eventType = ViewPortChange.height;
            eventDelta = eventHeight < this.lastHeight ? -1 : 1;
        } else {
            this.lastOrientation = orientation;
            eventType = ViewPortChange.orientation;
            eventDelta = orientation === OrientationState.landscape ? -1 : 1;
        }

        this.lastHeight = window.innerHeight;
        this.lastWidth = window.innerWidth;

        let vpEvent: ViewPortEvent = {
            'event': event,
            width: window.innerWidth,
            height: window.innerHeight,
            type: eventType,
            orientation: this.lastOrientation,
            delta: eventDelta
        };


        //this.logger.log('viewportmanager broadcasting event:');
        //this.logger.object(vpEvent);
        this.lastEvent = vpEvent;
        this.subject.next(vpEvent);

    }

    /**
     * Window resize event callback used to monitor
     * when virtual keyboards are shown and will
     * automate some changes to the dom
     * @param event window resize event callback
     */
    protected screenSizeChanged = (event: Event) => {
        this.newProcessEvent(event, -1);
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

        //this.logger.log(
        //    'detected device orientation: ' + oritentationToString(current));

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

        //this.logger.log(
        //    'is new orientation change per width/height: ' + isChange);
        return isChange;
    }

    /**
     * Will print some troubleshooting
     * values when working with this service
     * @param width current viewport width
     * @param height current viewport height
     */
    protected printTb(
        eventType: string,
        width: number, height: number,
        lastWidth: number, lastHeight: number) {

        let msgHeader = '\n-----  ----  printing tb information ----  -----';

        let msgPart1 = '\nurl: ' + this.currentUrl;

        let msgPart2 = '\nwidth: ' + width + ' | height: ' + height;

        let msgPart3 = '\nlast width: ' + lastWidth + ' | last height: ' + lastHeight;

        let msgPart4 = '\nisMobile: ' + isMobile(this.logger) + ' | isApple: ' + this.iOS;

        let msgPart5 = '\ninitialOrientation: ' + oritentationToString(this.initialOrientation)
            + ' | lastOrientation: ' + oritentationToString(this.lastOrientation);

        let msgPart6 = '\nisOrientationChange: ' + this.isOrientationChange(width, height) +
            ' | eventName: ' + eventType;

        let msgPart7 = '\nnavService Available: ' + (this.navService ? 'true' : 'false')
            + ' | navService Enabled: ' + !this.disableNavUpdates;

        let wholeMsg = msgHeader + msgPart1 + msgPart2 + msgPart3 +
            msgPart4 + msgPart5 + msgPart6 + msgPart7;

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

                //this.logger.log('navmenuservice broadcast options queue:')
                //this.logger.object(this.enableUpdatesQueue);
                if (this.disableUpdatesQueue && this.disableUpdatesQueue[0]) {
                    this.disableNavUpdates = true;
                    this.disableUpdatesQueue = []; // empty the queue
                } else {
                    this.disableNavUpdates = false;
                    this.customNavBroadcastOptions = null;
                }

            }
            this.currentUrl = path;
        }

    }


}

