// Vendor Imports
import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// App Imports
import { NgbdModalComponent, DialogOptions } from '../ngbdmodal/ngbdmodal.component';

@Injectable()
export class NgbdModalService {

    modalRef: NgbModalRef;

    constructor(private modalService: NgbModal) { }

    public show(options: DialogOptions): NgbModalRef {
        this.modalRef = this.modalService.open(NgbdModalComponent);
        this.modalRef.componentInstance.provideOptions(options);
        return this.modalRef;
    }
}
