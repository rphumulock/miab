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
import { LoggingService } from '../../../shared';
import { UserSessionService, GameSessionService } from '../../session';



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

@Component({
    //selector: 'ngbd-accordion-config',
    templateUrl: 'test.component.html',
    styleUrls: ['test.component.css'],
   // providers: [NgbAccordionConfig]
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

    constructor(
        protected userSession: UserSessionService,
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