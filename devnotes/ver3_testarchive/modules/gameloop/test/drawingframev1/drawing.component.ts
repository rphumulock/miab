// Vendor Imports
import {
    Component,
    ViewEncapsulation,
    AfterViewInit
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase';
import { Observable, Observer } from 'rxjs';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';


// App Imports
import {
    FirebaseObservable, SubscribeOptions,
    EventTypes,
} from 'miablib/firebaseutil';
import {
    NodePaths,
    IGamePlayerEntry,
    ICancelNewGameRequest,
    IJoinGameRequest,
    JoinRequestStatus,
    ICancelJoinGameRequest,
    GameStatus
} from 'miablib/miab';
import { concatPath } from 'miablib/global';
import {
    UserSessionService,
    GameSessionService
} from '../../../session';
import { FirebaseProjectService } from '../../../../core/firebaseutils';
import {
    NgModalComponentTemplate,
    NgModalService,
    DialogOptions, Buttons
} from '../../../../shared/ngmodalservice';
import { LoggingService } from '../../../../shared';
import { Emoji } from '../../drawinglibrary';


let blobGen = require('../../../../shared/resources/dataUrlToBlob.js');
let DrawingBoard = require('../../canvas/drawingboard.js');
//let dragandDropTouch = require('../../canvas/DragDropTouch.js');

export interface ImgAttributes {
    width: number,
    height: number
}

@Component({
    templateUrl: 'drawing.component.html',
    styleUrls: ['drawing.component.css', '../../canvas/drawingboard.css'],
    encapsulation: ViewEncapsulation.None, // required for drawing board
})
export class TestDrawingComponent {

    defaultBoard: any;
    testhtml: any;
    setupEmojiList: boolean;
    emojis: Array<Emoji>;
    resizeTarget: HTMLImageElement;
    resizeTargetOriginalSize: ImgAttributes;
    resizeDiv: HTMLDivElement;

    imgQueueArr: Array<HTMLImageElement>;
    imgQueueElem: HTMLDivElement;

    constructor(
        protected projectsMgr: FirebaseProjectService,
        protected modalService: NgModalService,
        protected route: ActivatedRoute,
        protected router: Router,
        protected userSession: UserSessionService,
        protected gameSession: GameSessionService,
        protected logger: LoggingService) {
    }

    ngOnInit() {
        this.route.data.subscribe(
            (data: any) => {
                if (!data) {
                    this.setupEmojiList = false;
                    return;
                }

                this.logger.log('drawing cmpt data result: ');
                this.logger.object(data);

                if (!data.emoji) {
                    this.setupEmojiList = false;
                    return;
                }

                this.emojis = data.emoji as Array<Emoji>;
                let count = 0;
                let max = 6;
                this.emojis = this.emojis.filter(value => {
                    let returnEmoji = count < max;
                    count++;
                    return returnEmoji;
                });
                this.logger.log('resolver returned ' + this.emojis.length + ' emojis: ');
                this.setupEmojiList = true;
            });
    }

    ngAfterViewInit() {

        this.testhtml = '<li>item1</li><li>item2</li><li>item3</li>';

    }

    ngAfterContentInit() {

        this.defaultBoard = new DrawingBoard.DrawingBoard.Board(
            'default-board', {
                webStorage: false,
                enlargeYourContainer: true,
                droppable: true,
                errorMessage: 'Your browser does not support canvas!'
            });

        //this.logger.object(this.defaultBoard);

    }

    submitDrawing() {

        // https://github.com/Leimi/drawingboard.js/blob/master/js/board.js
        let imagDataUrl = this.defaultBoard.getImg();

        this.submitImage(imagDataUrl)
            .then(
            url => {
                this.logger.log('img upload url: ' + url);
            });

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
    allowDrop(event: DragEvent) {
        //this.logger.log('dragover  recevied in target..:');
        //this.logger.object(event);
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
    dragstart = (event: DragEvent) => {
        this.logger.log('dragstart event recevied in target..:');
        this.logger.object(event);
        let img: HTMLImageElement = ((event.target) as HTMLImageElement);
        let srcAttr = ((event.target) as Element).attributes['src'];
        //this.logger.log('src: ' + srcAttr.value);
        event.dataTransfer.setData('imgsrc', srcAttr.value);

        let imgSize: ImgAttributes;
        if (img.hasAttribute('resizeWidth')) {
            imgSize = { width: +img.getAttribute('resizeWidth'), height: +img.getAttribute('resizeHeight') };
            event.dataTransfer.setData('imgsize', JSON.stringify(imgSize));
        } //else {
        //imgSize = { width: img.naturalWidth, height: img.naturalHeight };
        //}
    }

    /**
     * Original drop handler used to accept images dragged onto a <p> element
     * on the test component page. This is deprecated and only here for archival
     * purposes.
     * @param event 
     */
    drophandler(event: DragEvent) {
        this.logger.log('drop recevied in target..:');
        this.logger.object(event);
        let data = event.dataTransfer.getData('imgsrc');
        this.logger.object(data);


        let p = ((event.target) as HTMLParagraphElement);
        // this.logger.object(p);

        this.logger.log('initial para node count: ' + p.childNodes.length);

        if (p.childNodes.length > 10) {
            // remove previous span data
            p.removeChild(p.childNodes.item(3));
            this.logger.log('removed span, para node count: ' + p.childNodes.length);
        }

        let thirdBreak: Node = p.childNodes.item(3);
        let newHtml = document.createElement('span');

        let img = new Image();
        img.onload = (ev: Event) => {
            if (ev) {
                this.logger.object(ev);
            }
            newHtml.appendChild(img);
            newHtml.appendChild(document.createElement('br'));
            newHtml.appendChild(document.createTextNode('image src returned: ' + img.src));
            p.insertBefore(newHtml, thirdBreak);
            this.logger.log('after add, para node count: ' + p.childNodes.length);

        };

        img.src = data;
    }

    /**
     * This drop DragEvent handler is used to capture the image
     * dropped onto the space on the test component where the images
     * are being dragged onto.
     * @param event - drag event
     */
    divDropHandler(event: DragEvent) {

        this.logger.log('drop recevied in target..:');
        this.logger.object(event);
        let data = event.dataTransfer.getData('imgsrc');
        this.logger.object(data);

        this.resizeDiv = ((event.target) as HTMLDivElement);

        let img = new Image();
        img.id = 'resize-img';
        img.draggable = true;
        img.addEventListener('dragstart', this.dragstart);
        img.onload = (ev: Event) => {
            if (ev) {
                this.logger.object(ev);
            }

            // remove any previous entries
            while (this.resizeDiv.firstChild) {
                this.resizeDiv.removeChild(this.resizeDiv.firstChild);
            }

            // add the new image
            this.resizeDiv.appendChild(img);

            // set the global varriables
            this.resizeTarget = img;
            this.resizeTargetOriginalSize = { width: img.width, height: img.height };

        };

        // set the source variable which will immediately start 
        // trying to load the image (hence defining onload first)
        img.src = data;

    }

    /**
     * This drop DragEvent handler is used to capture the image
     * dropped onto the space on the test component where the images
     * are being dropped into a queue
     * @param event - drag event
     */
    queueDropHandler(event: DragEvent) {

        this.logger.log('-------==========---------==\
        ========--------======-------');
        this.logger.log('queue drop recevied in target...:');
        this.logger.object(event);
        let data = event.dataTransfer.getData('imgsrc');
        this.logger.log('image src data: ' + data);

        let size = event.dataTransfer.getData('imgsize');
        this.logger.log('image resize attr: ' + size);


        if (!this.imgQueueElem) {
            this.imgQueueElem = ((event.target) as HTMLDivElement);
        }

        let img = new Image();
        img.id = 'queueImg';
        img.draggable = true;
        img.addEventListener('dragstart', this.dragstart);
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
        img.src = data;

    }

    protected addImageToQueue(img: HTMLImageElement) {

        this.logger.log('current image queue array:');
        this.logger.object(this.imgQueueArr);

        if (!this.imgQueueArr) {
            this.imgQueueArr = new Array<HTMLImageElement>();
        };

        if (this.imgQueueArr.length >= 5) {
            this.imgQueueArr.shift();
        }

        // Remove any previous queue image of the same type
        this.imgQueueArr = this.imgQueueArr.filter(imgElem => {
            return imgElem.src !== img.src;
        });

        this.imgQueueArr.push(img);

        this.logger.log('post update image queue:');
        this.logger.object(this.imgQueueArr);

        this.updateImgQueueElem();

    }

    protected updateImgQueueElem() {

        this.logger.log('current image queue element:');
        this.logger.object(this.imgQueueElem);

        while (this.imgQueueElem.firstChild) {
            this.imgQueueElem.removeChild(this.imgQueueElem.firstChild);
        }

        this.logger.log('image queue element emptied:');
        this.logger.object(this.imgQueueElem);

        let newImageList: HTMLUListElement = document.createElement('ul');
        newImageList.id = 'imgQueueList';

        this.logger.log('looping thru image array to append element');
        this.imgQueueArr.forEach(element => {
            let newListItem = document.createElement('li');
            newListItem.appendChild(element);
            newImageList.appendChild(newListItem);
        });

        this.imgQueueElem.appendChild(newImageList);

        this.logger.log('post update image queue element:');
        this.logger.object(this.imgQueueElem);

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

        this.logger.log('slider event recieved');
        this.logger.object(event);
        let slider = (event.target as HTMLInputElement);

        this.logger.log('value: ' + slider.value);

        this.logger.log('current size -> width: ' + this.resizeTarget.width + ' height: ' + this.resizeTarget.height);

        this.logger.log('container size -> width: ' + this.resizeDiv.clientWidth + ' width: ' + this.resizeDiv.clientHeight);

        this.updateImageSize(+slider.value);

    }

    protected updateImageSize(sliderValue: number) {

        if (sliderValue === 0) {
            this.resizeTarget.width = this.resizeTargetOriginalSize.width;
            this.resizeTarget.height = this.resizeTargetOriginalSize.height;
        } else {

            let newSize: ImgAttributes;
            let proposedWidth: number;
            let proposedHeight: number;

            if (sliderValue < 0) {

                proposedWidth = this.resizeTargetOriginalSize.width + sliderValue;
                proposedHeight = this.resizeTargetOriginalSize.height + sliderValue;

            } else {

                proposedWidth = this.resizeTarget.width + sliderValue;
                proposedHeight = this.resizeTarget.height + sliderValue;

            }

            this.logger.log('proposed size -> width:  ' + proposedWidth + ' height: ' + proposedHeight);

            let isWiderThanContainer = (proposedWidth > this.resizeDiv.clientWidth);
            let isTallerThanContainer = (proposedHeight > this.resizeDiv.clientHeight);
            let requiresAspectRatio = isWiderThanContainer || isTallerThanContainer;

            if (requiresAspectRatio) {
                this.logger.log('new size requires aspect ratio calc..');
                newSize = this.calculateAspectRatioFit(proposedWidth, proposedHeight);
            } else {
                newSize = { width: proposedWidth, height: proposedHeight };
            }

            this.logger.object(newSize);

            this.resizeTarget.setAttribute('resizeWidth', newSize.width.toString());
            this.resizeTarget.setAttribute('resizeHeight', newSize.height.toString());
            this.resizeTarget.width = newSize.width;
            this.resizeTarget.height = newSize.height;

            this.logger.log('image after resize: ');
            this.logger.object(this.resizeTarget);
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


