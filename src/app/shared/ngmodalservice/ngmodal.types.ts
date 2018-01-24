// Vendor Imports
import {
    ComponentFactoryResolver,
    Injector,
} from '@angular/core';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

// App Imports


// Exports 
/**
 * Enumeration of the button option types
 * You have to change the values to start from 1
 * because if the 'crossClose' validation works, it will
 * still always return false; (because 0 == false)
 */
export enum Buttons {
    crossClose = 1,
    okcancel = 2,
    submit = 3
}

/**
 * Options used to display the dialog modal
 */
export class DialogOptions {

    /**
     * Provide custom html to display
     */
    innerHtml: string;
    /**
     * Will display an image with this url as source
     */
    imgSrcUrl: string;
    /**
     * Ng-Bootstrap Modal Options..
     * https://ng-bootstrap.github.io/#/components/modal
     */
    ngbOptions: NgbModalOptions;

    constructor(
        public title: string,
        public buttons: Array<Buttons>,
        public message?: string
    ) { }

}

export interface LazyLoadedComponentResources {
    componentFactoryResolver: ComponentFactoryResolver;
    injector: Injector;
};