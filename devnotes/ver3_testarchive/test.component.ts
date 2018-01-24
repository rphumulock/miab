// Vendor Imports
import {
    Component, AfterViewInit
} from '@angular/core';

import { NgModalService, DialogOptions, Buttons } from './ngmodal.service';
import { NgModalComponentTemplate } from './ngmodal.template';

/**
 * Purpose: Use to test the ngmodalservice feature module
 * 
 * To use this, add it any of your modules import arrays and refernece it
 * in your templates however you want to...
 * 
 * e.g: add it to your routes
 * 
 * To-do:
 * 
 */
@Component({
    template:
    `
    <h4>NgModalService Testing Component</h4>
    <button (click)="showModal()">Click Me To Open</button>
    <button (click)="showError()">Click To Open Error Dialog</button>
    <button (click)="showWaiting()">Click To Open Waiting Daialog</button>
    `
})
export class NgModalServiceTestComponent implements AfterViewInit {

    constructor(
        private modalSvc: NgModalService) {
    }

    ngAfterViewInit() {
        this.showModal();
    }

    showModal() {

        let modalOptions: DialogOptions = new DialogOptions(
            'Test Dialog!!!',
            [Buttons.crossClose, Buttons.okcancel],
            'This is a message for my image!!!'
        );

        modalOptions.imgSrcUrl = 'http://pa1.narvii.com/6124/a1a8434c04ab8ef72890ffd6f476f580080c29ea_hq.gif';

        // Uncomment below to disable click to close functionality
        // more at https://ng-bootstrap.github.io/#/components/modal
        modalOptions.ngbOptions = { backdrop: 'static', size: 'sm' };

        let modalRef = this.modalSvc.show(NgModalComponentTemplate, modalOptions);

        modalRef.result
            .then(
            val => { console.log('Resolved promise result: ' + val); }
            )
            .catch(
            err => { console.log('Rejected promise result: ' + err); }
            );
    }

    showError() {

        let msg = 'Testing Error Messages in a Modal. Please see how this looks';

        this.modalSvc.error(msg, false, 'Error Dialog Test');

    }
    
    showWaiting() {
       let modal = this.modalSvc.waiting('Please wait, not doing much anyway.', 'Test Waiting Modal');

        setTimeout(this.closeModal, 5000, modal);
    }

    closeModal(modal) {
        modal.close();
    }

}
