// Vendor Imports
import { Injectable } from '@angular/core';


// App Imports
import { LoggingService } from '../../../shared';
import { Emoji, TouchDnDEventData } from './';



@Injectable()
export class TouchEventsHandler {

    protected drawingboard: HTMLCanvasElement;
    protected imgQueue: HTMLDivElement;
    protected editor: HTMLDivElement;

    constructor(
        protected logger: LoggingService) { }

    /**
     * Will search the DOM to instantiate our class
     * member values.
     */
    public initTouchListeners() {
        this.drawingboard = document.getElementById('drawing-board-canvas') as HTMLCanvasElement;
        this.imgQueue = document.getElementById('img-queue') as HTMLDivElement;
        this.editor = document.getElementById('resize-area') as HTMLDivElement;
        /*
        this.logger.log('initializing touch events...');
        
        this.logger.log('drawingboard')
        this.logger.object(this.drawingboard);

        this.logger.log('img queue')
        this.logger.object(this.imgQueue);

        this.logger.log('img editor')
        this.logger.object(this.editor);
        */
    }

    /**
     * This method is intended to allow emoji drag and drop events
     * to work on mobile browsers driven by touch events. 
     * 
     * This is done by attaching to the touch event "touchend"
     * and creating a new custom event that we have already subsribed to
     * "touchdragdrop" and dispatching that event to the dom element
     * where the touch event ended.
     * 
     * References:
     * https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
     * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
     * https://mobiforge.com/design-development/touch-friendly-drag-and-drop
     * 
     */
    public touchend = (event: TouchEvent, emoji: Emoji) => {
        this.logger.log('touchend event recevied...:');
        let lastTouch = event.changedTouches[0];

        /*
        this.logger.log(
            'img id: ' + emoji.id + ' | pageX: ' +
            lastTouch.pageX + ' | pageY: ' + lastTouch.pageY);
        */

        let listeners = [this.drawingboard, this.imgQueue, this.editor];

        this.logger.log('touchend event listeners');
        this.logger.object(listeners);

        let located: HTMLElement;
        let index = 0;
        while (!located && index < listeners.length) {
            located = this.detectHit(listeners[index], lastTouch.pageX, lastTouch.pageY);
            index++;
        }

        this.logger.log('located element: ');
        this.logger.object(located);

        let eventData: TouchDnDEventData = {
            img: emoji,
            touchEvent: event,
            target: located
        };

        let customEvent: CustomEvent =
            new CustomEvent('touchdragdrop', { detail: eventData });

        located.dispatchEvent(customEvent);
    }

    /**
     * Given an html element and the location of a touch event
     * we are able to calculatw if the touch event occured 
     * within the boundries of that element.
     * 
     * If that is the case it will return that element otherwise
     * it will return null
     * 
     * References:
     * https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
     * 
     * @param elem html element
     * @param pageX touch event pageX value
     * @param pageY touch event pageY value
     */
    protected detectHit(
        elem: HTMLElement, pageX: number, pageY: number): HTMLElement {

        let clientRect = elem.getBoundingClientRect();
        this.logger.log('client rect value:');
        this.logger.object(clientRect);

        let inVerticalSpace = pageY > clientRect.top && pageY < clientRect.bottom;
        let inHorizontalSpace = pageX > clientRect.left && pageX < clientRect.right;
        let hitDetected = inVerticalSpace && inHorizontalSpace;
        this.logger.log('hit detected: ' + hitDetected);
        return hitDetected ? elem : null;

    }

}


