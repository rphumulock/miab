// Vendor Imports
import {
    Component,
    OnInit,
    ViewEncapsulation,
    AfterContentInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { GameSessionService } from '../services/gamesession.service';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs/Rx';
import * as $ from 'jquery';
import * as firebase from 'firebase';

// App Imports
import {
    NodePaths,
    Game,
    Scroll,
    Frame,
    GameState,
    FrameType
} from 'miablib/miab';
import { concatPath } from 'miablib/global';

/**
 * Purpose:
 * The purpose is to display the users completed game, and previously 
 * completed games and provide an interface between firebase and 
 * the user for ease of access
 * 
 * 
 * Major Component/Elements: 
 * - logic to get user games and user scrolls
 * - logic to display said games and scrolls
 * - logic to display the individual frames
 * - logic to retrieve image elements from firebase storage
 *  - either for background images (displays)
 *  - the actual frame images respectively  
 * 
 * To-do:
 * - convert from angularfire
 * - *** convert to firebaseobservables
 * - *** rebuild presentation logic for frames.
 * - caching on the client etc...
 */
@Component({
    templateUrl: './userchest.component.html',
    styleUrls: ['./userchest.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class UserChestComponent implements OnInit {

    private gradients: string[] = [
        '01.jpg', '02.jpg', '03.png',
        '04.png', '05.jpg', '06.jpg',
        '07.jpg', '08.png', '09.jpg',
        '10.jpg', '11.jpg'
    ];

    /**
     * An array of image urls, that we will create 
     */
    private gradientImgs: string[];

    /**
     * An observable of scrolls
     */
    private scrolls: Observable<Scroll>;

    /**
     * An observable of frames
     */
    private frames: Observable<Frame>;

    constructor(private af: AngularFire,
        private router: Router,
        private gameSession: GameSessionService,
        private modalService: NgbModal,
        @ViewChild('textModal') private textModalTemplateRef: TemplateRef<any>) { }

    ngOnInit() {

        this.getGradientUrls();
        this.getScrolls();
    }

    getFrames(scroll: Scroll) {
        let frameSubject = new Subject<Frame>();

        this.frames = frameSubject.map(frame => { return frame; });

        for (let k in scroll.frames) {
            if (frames.hasOwnProperty(k)) {
                frameSubject.next(this.appendFrameHtml(scroll.frames[k]));
            }
        }
    }

    private appendFrameHtml(frame: Frame): Frame {

        if (frame.type == FrameType.image) {
            frame.element = '<img src="' + frame.val + '" />';
        } else {
            frame.element = '<div>' + frame.val + '</div>'; // Add background images
        } return frame;
    }

    /**
     * Will assign the classes observable with the games scrolls
     * as an observable
     */
    private async getScrolls() {


        let options: SubscribeOptions = {
            listen: false,
            node: query,
            unwrap: true,
            eventType: EventTypes.VALUE,
            preserveSnapshot: false
        };

        let observableClass = new FirebaseObservable(app, options);

        this.scrolls = observableClass.getObservable();

        let scrollsRef = this.af.database.list(concatPath([
            NodePaths.GAMES, this.gameSession.gameId, 'scrolls'
        ])).$ref;

        let scrollSubject = new Subject<Scroll>();

        this.scrolls = scrollSubject.map(scroll => { return scroll; })

        let scrollIds: any;
        await scrollsRef.once('value', snap => scrollIds = snap.val());

        let count = 0;

        for (let i in scrollIds) {
            if (scrollIds.hasOwnProperty(i)) {
                let scrollRef = this.af.database.object(
                    scrollsRef + '/' + scrollIds[i]).$ref;

                let scroll: Scroll;
                await scrollRef.once('value', snap => scroll = snap.val());

                scroll.bgimage = this.gradientImgs[count];
                count++;
                scrollSubject.next(scroll);
            }
        }
    }

    /**
     * Will instantiate and create the array of image urls
     */
    private async getGradientUrls() {

        /**
         * Promise.all will return the values of a series 
         * of completed Promises. 
         * 
         * gradientImgs (see above or hover over), is an 
         * array of image urls
         */
        this.gradientImgs = await Promise.all(

            /**
             * This basically reads, foreach item in this 
             * array (which is a string), 
             */
            this.gradients.map(this.queryImgUrl)
        );
    }

    /**
     * This is a asynchronous instance function. 
     * 
     * Instance as in the "this" parameter is retained as the 
     * current instance of this class
     * 
     * Asyncronous as in it is required to return a Promise object
     */
    private queryImgUrl = async (imageName) => {

        /**
         * firebase.storage.getDownloadURL will return a Prmoise
         */
        return this.gameSession.storage.ref(
            'gradients/' + imageName).getDownloadURL();
    }
}