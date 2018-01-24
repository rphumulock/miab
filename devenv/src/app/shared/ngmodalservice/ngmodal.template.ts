// Vendor Imports
import {
    Component,
    Input,
    ApplicationRef,
    ChangeDetectorRef,
    AfterViewInit,
    ChangeDetectionStrategy,
    ViewEncapsulation
} from '@angular/core';
import {
    NgbActiveModal, ModalDismissReasons
} from '@ng-bootstrap/ng-bootstrap';
//import 'tether'; // Required for ng-bootstrap
//import 'bootstrap'; // Required for ng-bootstrap

// App Imports
import { DialogOptions, Buttons } from './ngmodal.service';



/**
 * Requires at the min bootstrap version 4.0.0-alpha.6
 */
@Component({
    selector: 'ngbd-modal-content',
    templateUrl: 'ngmodal.template.html',
    styleUrls: ['ngmodal.template.css'],
    changeDetection: ChangeDetectionStrategy.OnPush, // <- some stackoverflow shit
    encapsulation: ViewEncapsulation.Emulated
})
export class NgModalComponentTemplate implements AfterViewInit {

    // These are acutally superfulous, checking against
    // the function is good enough
    modalTitle: string;
    allowDismissal: boolean;
    cancelOkFooter: boolean;
    submitFooter: boolean;
    isImageBody: boolean;
    isTextBody: boolean;
    customHtml: boolean;

    updateBindings: boolean;
    optionsProcessed: boolean;

    @Input() modalOptions: DialogOptions;

    constructor(
        public activeModal: NgbActiveModal,
        public changeRef: ChangeDetectorRef) {
    }

    /**
     * Only update the dialog settings afther the view
     * has initialized
     */
    ngAfterViewInit() {
        this.updateBindings = true;

        if (this.modalOptions && !this.optionsProcessed) {
            this.initBindingsUpdate();
        }
    }

    /**
     * Helper function to update the relevant module bindings.
     */
    protected initBindingsUpdate() {

        this.optionsProcessed = true;
        this.modalTitle = this.modalOptions.title;
        this.allowDismissal = this.checkAllowDismissal();
        this.cancelOkFooter = this.checkCancelOkFooter();
        this.submitFooter = this.checkSubmitFooter();
        this.isImageBody = this.checkIsImageBody();
        this.isTextBody = this.checkIsTextBody();
        this.customHtml = this.checkCustomHtml();

        // Attempt to invode change detector
        //this.changeRef.markForCheck();
        this.changeRef.detectChanges();
    }

    dismiss() {
        this.activeModal.dismiss();
    }

    /**
     * Function used to provide this dialog service
     * with the options to properly display your modal
     * @param options 
     */
    provideOptions(options: DialogOptions) {
        this.modalOptions = options;

        // Ensure the view has initialized first
        if (this.updateBindings && !this.optionsProcessed) {
            this.initBindingsUpdate();
        }
    }

    updateMessage(newMessage: string) {
        if (this.modalOptions) {
            this.modalOptions.message = newMessage;
            this.changeRef.detectChanges();
        }
    }

    /**
     * This is used on input labels 'click' events to ensure
     * that the input label text loses focus and gives 
     * it to the proper input element
     * @param id id of input element - must be unique on page
     */
    select(id: string) {
        let elem = document.getElementById(id);
        elem.focus();
        elem.click();
    }

    protected checkAllowDismissal(): boolean {
        if (this.modalOptions) {
            if (this.modalOptions.buttons.find(button => button === Buttons.crossClose)) {
                return true;
            }
        } else {
            return false;
        }
    }

    protected checkCancelOkFooter(): boolean {
        if (this.modalOptions) {

            if (this.modalOptions.buttons.find(button => button === Buttons.okcancel)) {
                return true;
            }

        } else {
            return false;
        }
    }

    protected checkSubmitFooter(): boolean {

        if (this.modalOptions) {

            if (this.modalOptions.buttons.find(button => button === Buttons.submit)) {
                return true;
            }

        } else {
            return false;
        }
    }

    protected checkIsImageBody(): boolean {
        if (this.modalOptions && this.modalOptions.imgSrcUrl) {
            return true;
        } else {
            return false;
        }
    }

    protected checkIsTextBody(): boolean {
        if (this.modalOptions && this.modalOptions.message) {
            return true;
        } else {
            return false;
        }
    }

    protected checkCustomHtml(): boolean {
        if (this.modalOptions && this.modalOptions.innerHtml) {
            return true;
        } else {
            return false;
        }
    }

};



