// Vendor Imports
import {
    Component,
    OnInit,
    AfterViewInit
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';


// App Imports
import { LoggingService } from '../../../shared';


@Component({})
export abstract class TestAbstractGameTurnComponent {

    constructor(protected logging: LoggingService) {

    }

}