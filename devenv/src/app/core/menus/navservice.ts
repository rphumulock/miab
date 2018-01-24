// Vendor Imports
import { Injectable } from '@angular/core';
import {
    Observable,
    Subject
} from 'rxjs';


// App Imports
import { LoggingService } from '../../shared';

export enum NavOptions {
    ShowAll,
    HideAll,
    ShowFooter,
    HideFooter,
    ShowNav,
    HideNav,
    ShowSettings,
    HideSettings,
    ShowHeader,
    HideHeader,
    ShowTopMenus,
    HideTopMenus
}

@Injectable()
export class NavMenuService {

    protected subject: Subject<NavOptions>;
    get isVisible(): Observable<NavOptions> { return this.subject.asObservable(); }

    protected optionMapping: Map<NavOptions, string>;

    constructor(
        protected logger: LoggingService) {
        this.subject = new Subject();
        this.initMapping();
    }

    hide() {
        //this.logger.log('hiding menus'); 
        this.subject.next(NavOptions.HideAll);
    }

    show() {
        //this.logger.log('showing menus'); 
        this.subject.next(NavOptions.ShowAll);
    }

    /**
     * Will broadcast navmenu options to all subscribers (the menus)
     * @param option nav option
     */
    update(option: NavOptions) {
        //this.logger.log('broadcasting menu option: ' + this.optionMapping.get(option));
        this.subject.next(option);
    }

    /**
     * Returns a string representation of the enumeration
     * @param option nav option
     */
    mapping(option: NavOptions): string {
        return this.optionMapping.get(option);
    }

    protected initMapping() {
        this.optionMapping = new Map<NavOptions, string>();
        this.optionMapping.set(NavOptions.ShowAll, 'ShowAll');
        this.optionMapping.set(NavOptions.HideAll, 'HideAll');
        this.optionMapping.set(NavOptions.ShowFooter, 'ShowFooter');
        this.optionMapping.set(NavOptions.HideFooter, 'HideFooter');
        this.optionMapping.set(NavOptions.ShowNav, 'ShowNav');
        this.optionMapping.set(NavOptions.HideNav, 'HideNav');
        this.optionMapping.set(NavOptions.ShowSettings, 'ShowSettings');
        this.optionMapping.set(NavOptions.HideSettings, 'HideSettings');
        this.optionMapping.set(NavOptions.ShowHeader, 'ShowHeader');
        this.optionMapping.set(NavOptions.HideHeader, 'HideHeader');
        this.optionMapping.set(NavOptions.ShowTopMenus, 'ShowTopMenus');
        this.optionMapping.set(NavOptions.HideTopMenus, 'HideTopMenus');

    }
}


