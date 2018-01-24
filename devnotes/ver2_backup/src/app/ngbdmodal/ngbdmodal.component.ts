// Vendor Imports
import {
    Component,
    Input,
    ApplicationRef,
    ChangeDetectorRef
} from '@angular/core';
import {  NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
    selector: 'ngbd-modal-content',
    template:
    `
        <div class="modal-header">
            <h4 class="modal-title"> {{ modalTitle }}</h4>
            <button *ngIf="allowDismissal()" type="button" class="close" aria-label="Close" (click)="activeModal.dismiss()">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div *ngIf="isTextBody()" class="modal-body text-center">
            <p>{{ modalOptions.message }}</p>
        </div>
        <div *ngIf="isImageBody()" class="modal-body center-block">
            <img id="modalImage" class="img-rounded img-responsive" [src]="modalOptions.imgSrcUrl">
        </div>
        <div *ngIf="customHtml()">
            <div class="modal-body" [innerHTML]="modalOptions.innerHtml"></div>
        </div>
        <div *ngIf="cancelOkFooter()" class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="activeModal.close(false)">Cancel</button>
            <button type="button" class="btn btn-secondary" (click)="activeModal.close(true)">Ok</button>
        </div>
        <div *ngIf="submitFooter()" class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="activeModal.close(true)">Submitt</button>
        </div>
    `,
    styleUrls: ['ngbdmodal.component.css']
})
export class NgbdModalComponent {

    @Input() modalOptions: DialogOptions;

    constructor(
        public activeModal: NgbActiveModal,
        public changeRef: ChangeDetectorRef) { }

    provideOptions(options: DialogOptions) {
        this.modalOptions = options;
        this.changeRef.markForCheck();
    }

    allowDismissal(): boolean {
        if (this.modalOptions) {
            if (this.modalOptions.buttons.find(button => button === Buttons.crossClose)) {
                return true;
            }
        } else {
            return false;
        }
    }

    cancelOkFooter(): boolean {

        if (this.modalOptions) {

            if (this.modalOptions.buttons.find(button => button === Buttons.okcancel)) {
                return true;
            }

        } else {
            return false;
        }
    }

    submitFooter(): boolean {

        if (this.modalOptions) {

            if (this.modalOptions.buttons.find(button => button === Buttons.submit)) {
                return true;
            }

        } else {
            return false;
        }
    }

    isImageBody(): boolean {
        if (this.modalOptions && this.modalOptions.imgSrcUrl) {
            return true;
        } else {
            return false;
        }
    }

    isTextBody(): boolean {
        if (this.modalOptions && this.modalOptions.message) {
            return true;
        } else {
            return false;
        }
    }

    customHtml(): boolean {
        if (this.modalOptions && this.modalOptions.innerHtml) {
            return true;
        } else {
            return false;
        }
    }

};

/**
 * Enumeration of the button option types
 */
export enum Buttons {
    crossClose,
    okcancel,
    submit
}

/**
 * Options used to display the dialog modal
 */
export class DialogOptions {

    innerHtml: string;
    imgSrcUrl: string;

    constructor(
        public title: string,
        public buttons: Array<Buttons>,
        public message?: string
    ) { }

}


