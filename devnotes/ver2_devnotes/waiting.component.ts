import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';


@Component({
    selector: 'waiting',
    templateUrl: './waiting.component.html',
    styleUrls: ['./waiting.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class WaitingComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
        
    }
}