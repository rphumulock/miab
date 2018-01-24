// Vendor Imports
import { Injectable } from '@angular/core';


// App Imports
import { LoggingService } from '../../../shared';
import { Emoji, ImgAttributes } from './';

//let dragandDropTouch = require('../canvas/DragDropTouch.js');

@Injectable()
export class DragEventsHandler {


    constructor(
        protected logger: LoggingService) { }


    /**
    * The Event interface's preventDefault() method tells the user agent that 
    * if the event goes unhandled, its default action should not be taken as 
    * it normally would be. The event continues to propagate as usual with only 
    * the exception that the event does nothing if no event listeners call 
    * stopPropagation(), which terminates propagation at once.
    * 
    * This is necessary because the some elements do not expect the drop event
    * so they don't handle and propagate the event, so here we prevent that
    * default action so the event continues to propogate.
    * 
    * references:
    * https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
    * https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation
    * @param event 
    */
    public allowDrop(event: DragEvent) {
        // this.logger.log('dragover  recevied in target..:');
        // this.logger.object(event);
        event.preventDefault();
    }

    /**
    * 
    * dragstart event triggers the begining of a DragEvent.
    * 
    * The DragEvent object also carries with it a DataTransfer object
    * which is used to hold the data that is being dragged during a drag and drop
    * operation. 
    * 
    * The  DataTransfer object exposes a setData method to append data
    * to its data store.
    * 
    * We use a combination of these resouces to add the images element 
    * 
    * You can also use the element typescript element to cast your type to
    * a known element and use properties and methods.
    * 
    * references:
    * https://developer.mozilla.org/en-US/docs/Web/Events/dragstart
    * https://developer.mozilla.org/en-US/docs/Web/API/DragEvent
    * https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer
    * https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/setData
    * http://definitelytyped.org/docs/flipsnap--flipsnap/interfaces/htmlelement.html
    * @param event 
    */
    public dragstart = (event: DragEvent, emoji: Emoji) => {
        this.logger.log('dragstart event recevied in target..:');
        this.logger.object(event);
        this.logger.object(emoji);

        event.dataTransfer.setData('emoji', JSON.stringify(emoji));
    }
}


