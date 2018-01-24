// Vendor Imports
import { Injectable, ComponentFactoryResolver, Injector, ComponentRef } from '@angular/core';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

// App Imports
import { NgModalComponentTemplate } from './ngmodal.template';


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

@Injectable()
export class NgModalService {

    modalRef : NgbModalRef;

    constructor(private modalService: NgbModal) { }

    /**
     * This function is the primary function of this service that
     * is used to display modal dialogs.
     * @param options - DisplayOptions for the modal
     */
    public show(component: any, options: DialogOptions): NgbModalRef {

        if ( this.modalRef ) {
            this.modalRef.close();
        }

        // If you specify ng-bootstrap options use them according to their
        // open functon
        if (options.ngbOptions) {
            this.modalRef = this.modalService.open(component, options.ngbOptions);
        } else {
            this.modalRef = this.modalService.open(component);
        }

        // Gets the instance of the component created and calls our
        // provideOptions method and gives it the modal options.
        this.modalRef.componentInstance.provideOptions(options);
        return this.modalRef;
    }

    /**
     * Will display a default error message dialog and return an NgModalRef
     * object. This will only present the user with a close button to close 
     * the error.
     * @param message - error message
     * @param staticDialog - if true user can only close via the buttons
     * @param title - optional error title
     */
    public error(message: string, staticDialog?: boolean, 
        title?: string, autoCloseTimeout?: number): NgbModalRef {

        if (!title) {
            title = 'Oh No!';
        }

        let buttons: Array<Buttons> = [Buttons.crossClose];

        let options: DialogOptions = new DialogOptions(title, buttons, message);

        if (staticDialog) {
            options.ngbOptions = { backdrop: 'static' };
        } else {
            options.ngbOptions = { backdrop: true };
        }

        //options.imgSrcUrl = '../img/loading.gif'; // Oh No Image!

        this.show(NgModalComponentTemplate, options);

        if ( autoCloseTimeout ) {
            setTimeout(this.modalRef.close, autoCloseTimeout);
        }

        return this.modalRef;
    }

    /**
     * Will display a default waiting dialog and return an NgbModalRef 
     * object. This will not present the user with any close dialog 
     * options. 
     * @param msg - wait message
     * @param title - wait title
     */
    public waiting(message: string, title?: string) {

        if (!title) {
            title = 'Please wait...';
        }

        let options: DialogOptions = new DialogOptions(title, [], message);
        options.imgSrcUrl = '../img/loading.gif';
        options.ngbOptions = { backdrop: 'static' };
        return this.show(NgModalComponentTemplate, options);
    }
}
