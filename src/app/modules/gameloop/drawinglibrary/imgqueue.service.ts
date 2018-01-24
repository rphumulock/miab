// Vendor Imports
import { Injectable, Input } from '@angular/core';


// App Imports
import { LoggingService } from '../../../shared';
import {
    Emoji,
    DragEventsHandler,
    ResizeEditorService,
    TouchEventsHandler
} from './';

@Injectable()
export class ImgQueueService {

    protected imgQueue: Map<string, Emoji>;
    protected imgQueueArr: Array<string>;
    protected imgQueueElem: HTMLDivElement;
    protected queueLimit: number;
    protected touchEvents: TouchEventsHandler;

    public controlsOpen: boolean;

    constructor(
        protected dragEvents: DragEventsHandler,
        protected logger: LoggingService) {
        this.queueLimit = 1;
        this.imgQueueArr = new Array<string>();
        this.imgQueue = new Map<string, Emoji>();
    }

    initTouchEventListener() {
        this.touchEvents = new TouchEventsHandler(this.logger);
        this.touchEvents.initTouchListeners();

        // add touch support
        this.imgQueueElem = document.getElementById('img-queue') as HTMLDivElement;
        //this.logger.object(this.imgQueueElem);
        this.imgQueueElem.addEventListener('touchdragdrop', this.touchdragdrop);
    }

    /**
     * Applied to an 'edit image' button which will add the 
     * last added image to the resize editor
     */
    editImage(editor: ResizeEditorService) {
        let imgToEdit = this.imgQueueArr[this.imgQueueArr.length - 1];
        let img = this.imgQueue.get(imgToEdit);
        editor.acceptImgToEdit(img);
    }

    /**
     * Used to determine if the edit image button will be enabled 
     * or not
     */
    editButtonEnabled() {
        return (
            this.imgQueueArr && this.imgQueueArr.length > 0 &&
            this.imgQueue && this.imgQueue.size > 0);
    }

    /**
    * This drop DragEvent handler is used to capture the image
    * dropped onto the space on the test component where the images
    * are being dropped into a queue
    * @param event - drag event
    */
    drop(event: DragEvent) {
        // this.logger.log('queue drop recevied in target...:');
        // this.logger.object(event);
        if (!this.imgQueueElem) {
            this.imgQueueElem = ((event.target) as HTMLDivElement);
        }


        let data = event.dataTransfer.getData('emoji');
        // this.logger.log('image src data: ' + data);

        let emoji = JSON.parse(data) as Emoji;
        this.addImageToQueue(emoji);
    }

    touchend = (event: TouchEvent) => {
        if (!this.controlsOpen) {
            let imgElem = ((event.target) as HTMLImageElement);
            let id = imgElem.getAttribute('imgId');
            let emoji = this.imgQueue.get(id);
            this.touchEvents.touchend(event, emoji);
        }
    }

    /**
     * Will accept a custom event of "touchdragdrop", which
     * includes a "detail" property which is the image/emoji 
     * object we want to add to the queue
     */
    touchdragdrop = (event: CustomEvent) => {
        this.logger.log('img queue touch drag and drop event received');
        let emoji = event.detail.img;
        this.addImageToQueue(emoji);
    }

    /**
     * Applied to the emoji list images click listener, 
     * which will add the image to selected image queue. 
     * @param event - mouse event
     */
    queueEmoji(event: MouseEvent, emoji: Emoji) {
        this.logger.log('img queue click event received');
        this.addImageToQueue(emoji);
    }

    /**
     * Responsible for parsing an image source url 
     * and generating a HTMLImageElement which will be 
     * appended to this image queues stack
     * @param src - img src url
     * @param size - img original size as ImgAttributes interface
     */
    /*
    parseThenAddToQueue(src: string, size: string) {
        let img = new Image();
        img.id = 'queueImg';
        img.draggable = true;
        img.addEventListener('dragstart', this.dragEvents.dragstart);
        img.onload = (ev: Event) => {

            if (ev) {
                this.logger.object(ev);
            }

            if (size) {
                let sizeObj: ImgAttributes = JSON.parse(size);
                img.setAttribute('resizeWidth', sizeObj.width.toString());
                img.setAttribute('resizeHeight', sizeObj.height.toString());
            }

            // add the new image to the queue
            this.addImageToQueue(img);

        };

        // set the source variable which will immediately start 
        // trying to load the image (hence defining onload first)
        img.src = src;
    }*/

    dragstart = (event: DragEvent) => {
        if (!this.controlsOpen) {
            let imgElem = ((event.target) as HTMLImageElement);
            let id = imgElem.getAttribute('imgId');
            let emoji = this.imgQueue.get(id);
            this.dragEvents.dragstart(event, emoji);
        }
    }

    /**
     * Responsible for accepting an HTMLImageElement
     * and adding it to our image queue array. 
     * 
     * The array uses a FIFO process to maintain 
     * the size as well as ensuring duplicate images
     * are not added.
     * @param img - img html element
     */
    addImageToQueue(img: Emoji) {

        // this.logger.log('current image queue array:');
        // this.logger.object(this.imgQueueArr);

        if (this.imgQueueArr.length >= this.queueLimit) {
            let imgToRemove = this.imgQueueArr.shift();
            this.imgQueue.delete(imgToRemove);
        }

        // Remove any previous queue image of the same type
        this.imgQueueArr = this.imgQueueArr.filter(imgKey => {
            return img.id !== imgKey;
        });
        this.imgQueue.delete(img.id);

        // Add to queue
        this.imgQueue.set(img.id, img);
        this.imgQueueArr.push(img.id);

        // this.logger.log('post update image queue:');
        // this.logger.object(this.imgQueueArr);

        this.updateImgQueueElem();

    }

    protected getImgElement(img: Emoji): HTMLImageElement {
        let imgElem = new Image();
        imgElem.id = 'queued-img';
        imgElem.draggable = true;
        imgElem.addEventListener('dragstart', this.dragstart);
        imgElem.addEventListener('touchend', this.touchend);
        imgElem.setAttribute('imgId', img.id);
        imgElem.onload = (ev: Event) => {
            /*if (ev) {
                this.logger.object(ev);
            }*/
        };

        // set the source variable which will immediately start 
        // trying to load the image (hence defining onload first)
        imgElem.src = img.dataUrl;
        return imgElem;
    }

    /**
     * Will read the recently updated image queue array
     * and update the queue HTML element to display the 
     * images
     */
    protected updateImgQueueElem() {

        if (!this.imgQueueElem) {
            this.imgQueueElem = document.getElementById('img-queue') as HTMLDivElement;
        }
        this.logger.log('updating image queue element');
        // this.logger.log('current image queue element:');
        //this.logger.object(this.imgQueueElem);

        while (this.imgQueueElem.firstChild) {
            this.imgQueueElem.removeChild(this.imgQueueElem.firstChild);
        }

        //this.logger.log('image queue element emptied:');
        //this.logger.object(this.imgQueueElem);

        //let newImageList: HTMLUListElement = document.createElement('ul');
        //newImageList.id = 'imgQueueList';

        //this.logger.log('looping thru image array to append element');
        this.imgQueue.forEach(img => {
            let newListItem = document.createElement('div');
            newListItem.appendChild(this.getImgElement(img));
            this.imgQueueElem.appendChild(newListItem);
        });

        //this.imgQueueElem.appendChild(newImageList);

        for (let i = 0; i < this.imgQueueElem.children.length; i++) {
            let node = this.imgQueueElem.children.item(i);
            let img = node.firstElementChild;
            this.logger.log('image queue list node #' + i + ':');
            this.logger.object(img);
            this.logger.object(img.getBoundingClientRect());
        }

        //this.logger.log('post update image queue element:');
        //this.logger.object(this.imgQueueElem);

    }


}


