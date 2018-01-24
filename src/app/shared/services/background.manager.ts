// Vendor Imports
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// App Imports
import { LoggingService } from '../';

/**
 * This class is responsible for monitoring viewport changes
 * and emitting events so we can react to the changes on devices
 * the present challenges to our view
 * template
 * 
 * default functions:
 * - onfocus/onblur: if iphone, hide menus, emit viewport event
 * - resize: determine orientation vs height. hide menus, emit viewport event
 */
@Injectable()
export class BackgroundManagementService {

    protected rootElem: HTMLElement;
    protected isFirst: boolean;

    constructor(
        protected logger: LoggingService,
        protected router: Router) {
        this.isFirst = true;
        this.router.events.subscribe(this.detectBackground);
        this.updateBackground();
    }

    public updateBackground() {
        this.applyBackgroundClass(
            this.backgroundType(this.router.routerState.snapshot.url));
    }

    /**
     * Routing events callback which will reset 
     * this managers resize growth and shrunk 
     * settings when the current url which uses
     * this service changes.
     */
    protected detectBackground = (event: any) => {
        //this.logger.log('routing event received in background management service');
        //this.logger.log(event.toString());

        if (!this.canApply()) {
            return;
        }

        let typeRegex = /^([\w]+)\(/;
        let type = typeRegex.exec(event.toString())[1];

        if (type === 'NavigationEnd') {

            let path = '';
            let pathRegexPatterns = [
                /\(path: ([^)]+)\)/,
                /urlAfterRedirects: \'([^\']+)\'/,
                /\([^)]\)/
            ];
            for (let i = 0; i < pathRegexPatterns.length; i++) {
                //this.logger.log('testing pattern number: ' + i + '| pattern: ' + pathRegexPatterns[i]);
                let matchArr = pathRegexPatterns[i].exec(event.toString());
                if (matchArr) {
                    path = matchArr[1];
                    break;
                }
            }

            //this.logger.log('event: ' + type + ' | path: ' + path);
            this.applyBackgroundClass(this.backgroundType(path));
        }

    }

    protected applyBackgroundClass(type: number) {

        if (!this.canApply()) {
            return;
        }

        if (type === 1) {
            this.rootElem.classList.remove('light-background');
            this.rootElem.classList.add('dark-background');
        } else {
            this.rootElem.classList.remove('dark-background');
            this.rootElem.classList.add('light-background');
        }
    }

    protected canApply(): boolean {
        let wasFirst = this.isFirst;
        this.isFirst = false;
        if (!this.rootElem) {
            this.rootElem = document.getElementById('root-element');
        }

        if (!this.rootElem) {
            if (!wasFirst) {
                this.logger.error('root component element not found! - background management service');
            }
            return;
        }
    }

    protected backgroundType(path: string): number {

        let isDark =
            path.toLowerCase().indexOf('accounts') !== -1 ||
            path.toLowerCase().indexOf('error') !== -1;


        if (isDark) {
            return 1;
        }

        return 0;
    }

}

