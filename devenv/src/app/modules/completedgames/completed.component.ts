// Vendor Imports
import {
    Component, OnInit
} from '@angular/core';
import * as firebase from 'firebase';
//import {NgbAccordionConfig} from '@ng-bootstrap/ng-bootstrap';

// App Imports
import {
    NodePaths, GameStatus,
    GameState, Game,
    Frame, Scroll,
} from 'miablib/miab';
import { concatPath } from 'miablib/global';
import { LoggingService } from '../../shared';



/*export class NgbdAccordionStatic {
    
}*

export class NgbdAccordionConfig {
    constructor(config: NgbAccordionConfig) {
    // customize default values of accordions used by this component tree
    config.closeOthers = true;
    config.type = 'info';
  }
}*/
export interface AccordianTracker {
    first: boolean,
    second: boolean,
    third: boolean
}

interface TestFrame {
    type: number;
    val: string;
}

@Component({
    templateUrl: 'completed.component.html',
    styleUrls: ['completed.component.css'],
})
export class CompletedGamesTestComponent implements OnInit {

    first: boolean;
    second: boolean;
    third: boolean;
    enableGameCodeBox: boolean;
    activeAccordian: AccordianTracker;
    
    
    scrolls: string[] = [
        't','g','x','t','g','x',
        't','g','x','t','g','x'
    ]

    /*
    scrolls: [
        { isodd: false },
        { isodd: true },
        { isodd: false },
        { isodd: true },
        { isodd: false },
        { isodd: true },
        { isodd: false },
        { isodd: true },
        { isodd: false },
        { isodd: true },
        { isodd: false },
        { isodd: true }
    ];*/

    frames: TestFrame[] = [
        { type: 0, val: 'First Frame' },
        { type: 1, val: '' },
        { type: 0, val: 'Third Frame' },
        { type: 1, val: '' },
        { type: 0, val: 'Fifth Frame' },
        { type: 1, val: '' },
        { type: 0, val: 'Sixth Frame' },
    ]

    constructor(
        protected logger: LoggingService) {
        this.first = true;
        this.second = true;
        this.third = true;
        // enable/disable to show/hide game code box
        this.enableGameCodeBox = true;
        
        this.toggleAccordian(1);
    }

    ngOnInit() {
    }

    gameCode(): string {
            return 'None';
    }

    clickGame(event: MouseEvent){
        this.logger.log('game selection event received')
        this.logger.object(event.target);
        this.toggleAccordian(2);
    }

    clickScroll(event: MouseEvent){
        this.logger.log('scroll selection event received')
        this.logger.object(event.target);
        this.toggleAccordian(3);
    }

    clickFrame(event: MouseEvent){
        this.logger.log('frame selection event received')
        this.logger.object(event.target);
    }

    toggleAccordian(id: number) {

        this.logger.log('toggle accordian requested: ' + id);

        /*
        this.activeAccordian.first = false;
        this.activeAccordian.second = false;
        this.activeAccordian.third = false;
        */

        this.activeAccordian = {
            first: false,
            second: false,
            third: false
        };

        switch(id) {
            case 1:
                this.activeAccordian.first = true;
                break;
            case 2: 
                this.activeAccordian.second = true;
                break;
            case 3: 
                this.activeAccordian.third = true;
                break;
        }
        
        this.logger.object(this.activeAccordian);
    }

}