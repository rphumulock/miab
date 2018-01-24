// Vendor Imports
import {
    Injectable,
    Inject,
    forwardRef
} from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// App Imports
import {
    DialogOptions,
    Buttons,
    NgModalComponentTemplate,
} from './';
import { LoggingService } from '../index';

@Injectable()
export class NgModalService {

    modalRef: NgbModalRef;

    constructor(
        @Inject(forwardRef(() => LoggingService)) protected logger: LoggingService,
        protected modalService: NgbModal) { }

    public close = () => {
        if (this.modalRef) {
            try {
                this.modalRef.close();
            } catch (err) {
                this.logger.error('error caught closing modal');
                this.logger.error(err);
            }
        }
    }

    public dismiss = () => {
        if (this.modalRef) {
            try {
                this.modalRef.dismiss();
            } catch (err) {
                this.logger.error('error caught dismissing modal');
                this.logger.error(err);
            }
        }
    }

    /**
     * This function is the primary function of this service that
     * is used to display modal dialogs.
     * @param options - DisplayOptions for the modal
     */
    public show(component: any, options: DialogOptions): NgbModalRef {

        if (this.modalRef) {
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

        if (autoCloseTimeout) {
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
