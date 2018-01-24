// Vendor Imports
import { Injectable } from '@angular/core';


// App Imports
import { LoggingService } from '../../../shared';
import {
    Emoji,
    ImgAttributes,
    ImgQueueService,
    DragEventsHandler,
    TouchEventsHandler
} from './';

@Injectable()
export class ResizeEditorService {

    protected img: Emoji;
    protected originalSize: ImgAttributes;
    protected newSize: ImgAttributes;
    protected imgElement: HTMLImageElement;
    protected resizeDiv: HTMLDivElement;
    protected slider: HTMLInputElement;
    protected sliderLastVal: number;
    protected touchEvents: TouchEventsHandler;

    constructor(
        protected dragEvents: DragEventsHandler,
        protected logger: LoggingService) {
        this.sliderLastVal = 0;
    }

    initTouchEventListener() {
        // add touch support

        this.touchEvents = new TouchEventsHandler(this.logger);
        this.touchEvents.initTouchListeners();


        if (!this.resizeDiv) {
            this.logger.log('resize-area during initTouchEvents');
            this.resizeDiv = document.getElementById('resize-area') as HTMLDivElement;
            //this.logger.object('height: ' + this.resizeDiv.offsetHeight + ' | width: ' + this.resizeDiv.offsetWidth);
        }

        this.resizeDiv.addEventListener('touchdragdrop', this.touchdragdrop);
    }

    acceptImgToEdit(imgToEdit: Emoji) {
        // remove any previous entries
        this.resetEditorTarget();
        this.img = imgToEdit;
        this.addImgToEditor();
    }

    dragstart = (event: DragEvent) => {
        this.dragEvents.dragstart(event, this.getImg());
    }

    /**
    * This drop DragEvent handler is used to capture the image
    * dropped onto the space on the test component where the images
    * are being dragged onto to be resized
    * @param event - drag event
    */
    drop(event: DragEvent) {
        this.logger.log('drop recevied in img editor..:');
        // this.logger.object(event);
        let data = event.dataTransfer.getData('emoji');
        let img = JSON.parse(data) as Emoji;
        this.logger.object(img);

        if (!this.resizeDiv) {
            this.resizeDiv = ((event.target) as HTMLDivElement);
        }

        this.acceptImgToEdit(img);
    }

    touchend = (event: TouchEvent) => {
        this.touchEvents.touchend(event, this.getImg());
    }

    /**
     * Will accept a custom event of "touchdragdrop", which
     * includes a "detail" property which is the image/emoji 
     * object we want to add to the editor
     */
    touchdragdrop = (event: CustomEvent) => {
        this.logger.log('img editor touch drag and drop event received');
        let emoji = event.detail.img;
        this.acceptImgToEdit(emoji);
    }


    /**
     * Applied to the 'done editing' button. This
     * method will proceed to provide the ImgQueueService
     * function parseThenAddToQueue with the necessary data
     * to add the editied image to the queue.
     */
    doneEditing(queue: ImgQueueService) {
        queue.addImageToQueue(this.getImg());
        this.resetEditorCanvas();
        this.resetEditorTarget();
    }

    /**
     * Used to speccify if the done editing button is enabled
     */
    doneEditingEnabled() {
        if (!this.imgElement) {
            return false;
        }
        return true;
    }

    /**
     * 
     * References:
     * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
     * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement
     * https://developer.mozilla.org/en-US/docs/Web/API/UIEvent
     * @param event 
     */
    sliderChanged(event: Event) {

        // this.logger.log('slider event recieved');
        // this.logger.object(event);
        let slider = (event.target as HTMLInputElement);
        if (!this.slider) { this.slider = slider; }

        // this.logger.log('value: ' + slider.value);

        this.updateImageSize(+slider.value);
    }

    protected getImg(): Emoji {
        if (this.newSize) {
            let resizedImg: Emoji = this.img;
            resizedImg.attributes = this.newSize;
            return resizedImg;
        } else {
            return this.img;
        }
    }

    protected resetEditorTarget() {
        this.img = null;
        this.imgElement = null;
        this.newSize = null;
        this.originalSize = null;
    }

    protected resetEditorCanvas() {
        // Reset slider
        if (this.slider) {
            this.slider.value = '0';
            this.sliderLastVal = 0;
        }

        if (this.resizeDiv) {
            /**
            * Will iterate through all child nodes of the 
            * img editor element and remove them.
            */
            while (this.resizeDiv.firstChild) {
                this.resizeDiv.removeChild(this.resizeDiv.firstChild);
            }
        }
    }

    /**
     * Provided a src url, this function will load and add
     * the image to the editor 
     */
    protected addImgToEditor() {
        if (!this.resizeDiv) {
            //this.logger.log('resize-area during addImgEvent');
            this.resizeDiv = document.getElementById('resize-area') as HTMLDivElement;
            //this.logger.object('height: ' + this.resizeDiv.offsetHeight + 'width: ' + this.resizeDiv.offsetWidth);
        }

        let img = new Image();
        img.id = 'resize-img';
        img.draggable = true;
        img.addEventListener('dragstart', this.dragstart);
        img.addEventListener('touchend', this.touchend);
        img.onload = (ev: Event) => {
            /*if (ev) {
                this.logger.object(ev);
            }*/

            // reset the editor div
            this.resetEditorCanvas();

            // add the new image
            this.resizeDiv.appendChild(img);

            if (this.img.attributes) {
                img.width = this.img.attributes.width;
                img.height = this.img.attributes.height;
            }

            this.originalSize = {
                width: img.width,
                height: img.height
            }

            // set the global varriables
            this.imgElement = img;
        };

        // set the source variable which will immediately start 
        // trying to load the image (hence defining onload first)
        img.src = this.img.dataUrl;
    }

    /**
     * Will update the images size adding the sliders increment
     * to the width and height and re-calculating aspect ratio if
     * necessary
     * @param sliderValue - number
     */
    protected updateImageSize(sliderValue: number) {
        
        let sliderDelta: number;
        sliderDelta = Math.sqrt(Math.pow(sliderValue - this.sliderLastVal, 2));
        if ( sliderValue < this.sliderLastVal ) { sliderDelta *= -1; }
        this.sliderLastVal = sliderValue;

        let log = {
            sliderVal: sliderValue,
            lastVal: this.sliderLastVal,
            delta: sliderDelta
        }

        this.logger.object(log);

        if (sliderValue === 0) {
            this.imgElement.width = this.originalSize.width;
            this.imgElement.height = this.originalSize.height;
            this.sliderLastVal = 0;

        } else {

            let proposedWidth: number;
            let proposedHeight: number;

            proposedWidth = this.imgElement.width + sliderDelta;
            proposedHeight = this.imgElement.height + sliderDelta;

            //this.logger.log('proposed size -> width:  ' + proposedWidth + ' height: ' + proposedHeight);

            let isWiderThanContainer = (proposedWidth > this.resizeDiv.clientWidth);
            let isTallerThanContainer = (proposedHeight > this.resizeDiv.clientHeight);
            let requiresAspectRatio = isWiderThanContainer || isTallerThanContainer;

            if (requiresAspectRatio) {
                this.logger.log('new size requires aspect ratio calc..');
                this.newSize = this.calculateAspectRatioFit(proposedWidth, proposedHeight);
            } else {
                this.newSize = { width: proposedWidth, height: proposedHeight };
            }

            this.logger.object(this.newSize);

            /*
            this.imgElement.setAttribute('resizeWidth', newSize.width.toString());
            this.imgElement.setAttribute('resizeHeight', newSize.height.toString());
            */
            this.imgElement.width = this.newSize.width;
            this.imgElement.height = this.newSize.height;

            this.logger.log('image after resize: ');
            this.logger.object(this.imgElement);
        }
    }

    /**
     * Ensures that the new size of the image maintains aspect ratio
     * when larget than the container
     * 
     * Reference:
     * https://stackoverflow.com/questions/3971841/how-to-resize-images-proportionally-keeping-the-aspect-ratio
     * @param proposedWidth 
     * @param proposedHeight 
     */
    protected calculateAspectRatioFit(proposedWidth, proposedHeight) {

        let widthRatio = this.resizeDiv.clientWidth / proposedWidth;
        let heightRatio = this.resizeDiv.clientHeight / proposedHeight;

        let ratio = Math.min(widthRatio, heightRatio);

        this.logger.log('widthRatio: ' + widthRatio);
        this.logger.log('heightRatio: ' + heightRatio);
        this.logger.log('aspectRatio: ' + ratio);

        return { width: proposedWidth * ratio, height: proposedHeight * ratio };
    }


}


