/** 
 * Module: firebase.observable.ts
 * @description This module provides an interface between
 * the firebase api and the observable design pattern.
 * 
 * Features include:
 * - Automatically disposing listening connections when 
 * subscriptions are disposed
 * 
 * - Unwrapping objects to Map<any, any> iterable 
 * key-value pair objects upon request
 * 
 * - EventType enumeration to reduce chances of errors
 * when selecting options
 * 
 * @author Edwin Gathura, egathura@gmail.com, Zumbiil, Inc
 */

import 'firebase';
import { Observable, Observer } from 'rxjs';
/**
 * Listing of the supported firebase event types
 */
const EventTypeStrs = {
    VALUE: 'value',
    CHILD_ADDED: 'child_added',
    CHILD_CHANGED: 'child_changed',
    CHILD_REMOVED: 'child_removed',
    CHILD_MOVED: 'child_moved'
};

export enum EventTypes {
    VALUE,
    CHILD_ADDED,
    CHILD_CHANGED,
    CHILD_REMOVED,
    CHILD_MOVED
}

/**
 * Options used in the constructor of the FirebaseObservable class
 * 
 */
export class SubscribeOptions {
    /**
     * Specifies if this obersable should attempt to 
     * unwrap the data as a collection (Map) of
     * key value pairs. 
     * 
     * Note: If you are targeting a node where the immediate 
     * children have a keyvalue pair of <any, string> and you 
     * are using the "child_added", "child_removed", or "child_changed"
     * events, this will return a Map<int,char> of the child entries (strings)
     * returned by firebased (based on the event type). 
     * 
     * If you requested unwrapped data, if the 
     * snapshot does not exist, this will return the 
     * firebase.database.Datasnapshot (which firebase returns anyway)
     * 
     * The default will be false.
     */
    unwrap?: boolean;
    /**
     * The event type to listen for see EventTypes const
     * of this module or.... PLEASE READ THE FIREBASE DOCS
     * https://firebase.google.com/docs/reference/js/firebase.database.Reference#on
     */
    eventType: EventTypes;
    /**
     * The node path to request data from firebase or a 
     * firebase reference object.
     */
    node: string | firebase.database.Reference | firebase.database.Query;
    /**
     * Specifies that the value type returned will always be 
     * the relevant firebase.database.DataSnapshot. Usually
     * a snapshot is only returned if the data at that node 
     * does not exist
     * 
     * You can then even get the firebase.database.Reference
     * of the returned snapshot from the "ref" property.
     * https://firebase.google.com/docs/reference/js/firebase.database.Reference#ref
     * 
     * The default option is false.
     */
    preserveSnapshot?: boolean;
    /**
     * Specifies that the snapshot/data should only be returned
     * when/if the snapshot actually has data.
     * 
     * If you select this option the event type will always be
     * 'value'
     * 
     * The default option is false
     */
    existsOnly?: boolean;

    /**
     * 
     * @param referencePath - path to the key we are requesting
     * @param eventType - firebase event type; 
     */
    constructor(
        referencePath: string | firebase.database.Reference | firebase.database.Query,
        firebaseEvent: EventTypes) {
            this.eventType = firebaseEvent;
            this.node = referencePath;
    }
}


/**
 * @desc Class provides a means to easily create/return
 * observables of firebase events and data
 */
export class FirebaseObservable {

    /**
     * The parsed event type from the SubscribeOptions
     * object in the constructor
     */
    protected eventType: string;

    /**
     * Will return an instance of this classs
     * @param app - an initialized firebase app
     * @param node - the path to the node to request data from
     * @param listen - whether or not to listen to changes or return a single snapshot
     */
    constructor(protected app: firebase.app.App, protected options: SubscribeOptions) {
        this.parseEventType();
    }

    /**
     * Will parse and correspond the EventType enumeration to its
     * actual firebase api value
     */
    protected parseEventType() {

        switch (this.options.eventType) {
            case EventTypes.VALUE:
                this.eventType = EventTypeStrs.VALUE;
                break;
            case EventTypes.CHILD_ADDED:
                this.eventType = EventTypeStrs.CHILD_ADDED;
                break;
            case EventTypes.CHILD_CHANGED:
                this.eventType = EventTypeStrs.CHILD_CHANGED;
                break;
            case EventTypes.CHILD_REMOVED:
                this.eventType = EventTypeStrs.CHILD_REMOVED;
                break;
            case EventTypes.CHILD_MOVED:
                this.eventType = EventTypeStrs.CHILD_MOVED;
                break;
        }
    }

    /**
     * Will return an observable that can be used to subscribe to 
     * firebase events per the supplied options for 
     * this class instance. 
     * 
     * This class strictly adheres to the firebase api rules for 
     * the differing event types
     * 
     * If you requested unwrapped data, if the 
     * snapshot does not exist, this will return the 
     * firebase.database.Datasnapshot (which firebase returns anyway)
     * 
     * This significantly simplifies monitoring data events as you can then
     * use the Observable.take() operator to specify how many snapshots or value 
     * changes you want to capture, and it will then automatically unsubscribe 
     * the listener without having to explicity call the Subscription.unsubscribe function.
     * 
     * NOTE: ** You must unsubscribe from this function to stop it from listening **
     * 
     * e.g:
     * (new FirebaseObservable(app, options)).getOnChangeObservable.take(1).subscribe(callback);
     * 
     * The returned observable will also return error messages
     */
    getObservable(): Observable<firebase.database.DataSnapshot | Map<any, any> | any> {

        let ref: firebase.database.Reference | firebase.database.Query;
        let nodeType = typeof this.options.node;

        if (nodeType === 'string') {
            ref = this.app.database().ref((this.options.node as string));
        } else {
            /**
            * This is not necessary since as type assertion is not runtime 
            * and the functions requested by this method exist on both object
            * types 
            */
            try {
                ref = this.options.node as firebase.database.Reference;
            } catch (err) {
                ref = this.options.node as firebase.database.Query;
            }
        }

        let existsOnly = this.options.existsOnly;
        let event: string;
        let asSnap: boolean;


        if (existsOnly) {
            // the event type will always be 'value'            
            event = EventTypeStrs.VALUE;

            // snapshots will only be returned if the preserveSnapshot is selected
            asSnap = this.options.preserveSnapshot;

        } else {
            // whatever the user decides
            event = this.eventType;

            // preserve snapshots when selected, expecting deletion, or if DataSnapshot.exists() is false
            asSnap = this.options.preserveSnapshot || this.options.eventType === EventTypes.CHILD_REMOVED;
        }

        let unwrap = this.options.unwrap;
        let count = 0;

        let deferredObservable: Observable<firebase.database.DataSnapshot | Map<any, any | any>> =
            /**
             * Using the Observable.defer() operator allows us to ensure the monitoring
             * observable will not be instanitated until a subscription is requested
             */
            Observable.defer((): Observable<firebase.database.DataSnapshot | Map<any, any> | any> => {

                let firebaseSubscription;

                /**
                 * Inner observable used to connect to firebase and return
                 * a datasnapshot
                 */
                let innerObservable: Observable<firebase.database.DataSnapshot> =
                    Observable.create(
                        ( (observer: Observer<firebase.database.DataSnapshot>) => {

                            firebaseSubscription = ref.on(event,
                                snap => {
                                    console.log('snap recieved-count: ' + count);
                                    observer.next(snap);
                                },
                                err => {
                                    observer.error(err);
                                });

                            return function () {
                                ref.off(event, firebaseSubscription);
                            };
                        })
                    ).finally(() => {

                        ref.off(event, firebaseSubscription);

                    });


                /**
                 * Actual returned 'outer' observable used to filter 
                 * the return snapshots based on the user options.
                 */
                let outerObservable: firebase.database.DataSnapshot | Map<any, any> | any =
                    innerObservable.filter(snap => {

                        count++;
                        return existsOnly ? snap.exists() : true;

                    }).map(
                        snap => {
                            return this.processSnapshot(snap, unwrap, asSnap);
                        });

                return outerObservable;

            });

        return deferredObservable;
    }

    /**
     * This is an instance function that accepts a firebase.database.DataSnapshot
     * processes it based on use options and returns a value.
     * 
     * If the snapshot.exists() returns a false value, the actual snapshot will be returned.
     * @param snap - the firebase snapshot
     * @param unwrap - if the data should be transformed to an iterable Map<any, any>
     * @param asSnap - if the snapshot should be preserved and retured.
     */
    protected processSnapshot(snap, unwrap, asSnap): firebase.database.DataSnapshot | Map<any, any> | any {

        if (asSnap) {
            return snap;
        } else {
            if (snap.exists()) {
                if (unwrap) {
                    return this.unwrapData(snap.val());
                } else {
                    return snap.val();
                }
            } else {
                /**
                 * Usually when the child has no data or when
                 * a child_removed event type was requested
                 */
                return snap;
            }

        }
    }

    /**
     * This will return a Map<any,any> of key value pairs 
     * from the object provided.
     * @param nodeValues the value from the firebase snapshot
     */
    protected unwrapData(nodeValues: any): Map<any, any> {

        let dataMap: Map<any, any> = new Map<any, any>();

        for (let key in nodeValues) {
            if (nodeValues.hasOwnProperty(key)) {
                dataMap.set(key, nodeValues[key]);
            }
        }

        return dataMap;
    }

}
