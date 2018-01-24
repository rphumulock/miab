// Vendor Imports
import {
    Component,
    OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';


// App Imports
import {
    Frame,
    Game, Scroll,
    IUserGamesCollection
} from 'miablib/miab';
import { LoggingService } from '../../shared';
import { GameDetailsService } from './services/gamedetails.service';

export interface AccordianTracker {
    first: boolean;
    second: boolean;
    third: boolean;
}

@Component({
    templateUrl: 'completedgames.component.html',
    styleUrls: ['completedgames.component.css']
})
export class CompletedGamesComponent implements OnInit {

    protected collection: IUserGamesCollection;
    protected selectedGame: Game;
    protected selectedScroll: Scroll;
    /**
     * An array of scrolls
     */
    public games: Array<Game>;
    /**
     * An array of scrolls
     */
    public scrolls: Array<Scroll>;
    /**
    * An array of frames
    */
    public frames: Array<Frame>;

    enableGameCodeBox: boolean;
    activeAccordian: AccordianTracker;

    constructor(
        protected gameDetailsService: GameDetailsService,
        protected route: ActivatedRoute,
        protected logger: LoggingService) {

        this.resetAccordians();
        this.toggleAccordian(1);
    }



    ngOnInit() {

        this.route.data.subscribe(
            (games: IUserGamesCollection) => {
                this.collection = games;
                this.enableGameCodeBox = games.GameCode ? true : false;
                this.selectGame(games.LastPlayedGame, games.LastPlayedScrolls);
            });
    }

    protected selectGame(game: Game, scrolls?: Array<Scroll>) {
        this.selectedGame = game;
        if (scrolls) {
            this.scrolls = scrolls;
        } else {
            this.gameDetailsService.getScrolls(game).subscribe(
                (gameScrolls: Array<Scroll>) => {
                    this.scrolls = gameScrolls;
                });
        }
    }

    protected resetAccordians() {
        this.activeAccordian = {
            first: false,
            second: false,
            third: false
        };
    }

    /**
     * will toggle the open/closing of accordians to represent
     * the games, scrolls and frames
     * @param id accordin id number
     */
    public toggleAccordian(id: number) {
        this.logger.log('toggle accordian requested: ' + id);
        this.resetAccordians();

        switch (id) {
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

    public clickGame(game: Game) {
        this.logger.log('game selection event received')
        this.logger.object(game);
        this.selectGame(game);
        this.toggleAccordian(2);
    }

    public clickScroll(scroll: Scroll) {
        this.logger.log('scroll selection event received');
        this.logger.object(scroll);
        this.frames = scroll.frames;
        this.selectedScroll = scroll;
        this.toggleAccordian(3);
    }

    public clickFrame(frame: Frame) {
        this.logger.log('frame selection event received')
        this.logger.object(frame);
    }

}
