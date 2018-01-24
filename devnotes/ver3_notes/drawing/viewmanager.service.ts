// Vendor Imports
import { Injectable } from '@angular/core';


// App Imports
import { LoggingService } from '../../../shared';
import {
    Emoji,
    ResizeEditorService,
    ImgQueueService
} from './';


@Injectable()
export class ViewManagerService {

    constructor(
        protected editorService: ResizeEditorService,
        protected imgQueueService: ImgQueueService,
        protected logger: LoggingService) {
    }

    setImageQueue(service: ImgQueueService) {
        this.imgQueueService = service;
    }

    setEditor(service: ResizeEditorService) {
        this.editorService = service;
    }

    addToQueue(img: Emoji) {
        this.imgQueueService.addImageToQueue(img);
    }

    addToEditor(img: Emoji) {
        this.editorService.acceptImgToEdit(img);
    }

    imgQueueLimit(): number {
        return 5;
    }

}


