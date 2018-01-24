// Vendor Imports
import { Injectable } from '@angular/core';
import {
    Resolve,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router
} from '@angular/router';
import { Http, Response, RequestOptions, RequestMethod, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs';
import * as twemoji from 'twemoji';

// App Imports
import { collection } from './collection.emoji';
import { LoggingService } from '../../../shared';
import { Emoji } from '../drawinglibrary';

let detectBrowser = require('../../../shared/resources/detectbrowser.js');

@Injectable()
export class TwemojiService {

    protected useManualRequest: boolean;

    // For troubleshooting..
    protected attemptCount: number;

    constructor(
        protected logger: LoggingService,
        protected http: Http) { }

    /**
     * Will return the emoji unicode value from an icon UTF-8 html
     * encoded entry.
     * @param iconId UTF-8 html encoded value
     */
    protected getUnicodeValue(iconId: string): any {
        let newIconId = iconId.replace(/&#x/g, '');
        return twemoji.convert.fromCodePoint(newIconId);
    }

    /**
     * Will return a parsed value of the emoji html
     * encoding that can be used a a Html Element Id
     * @param icondId UTF-8 html encoded value
     */
    protected getEmojiHtmlId(iconId: string): string {
        let newIconId = iconId.replace(/&#x/g, '');
        return newIconId.replace(/;/g, '');
    }

    /**
     * Will return an Emoji object that after processing the 
     * iconId and getting a return value from the twemoji
     * api
     * @param iconId UTF-8 html encoded value
     */
    public parseIconId = (iconId: string): Promise<Emoji> => {

        let unicodeId = this.getUnicodeValue(iconId);
        let imgElement = twemoji.parse(unicodeId);

        let imgSrc = this.getImgSrc(imgElement);

        if (!imgSrc) {
            return Promise.resolve(this.invalidEmojiFactory(iconId, imgElement));
        }

        let imgAlt = this.getImgAlt(imgElement);

        if (!imgAlt) {
            return Promise.resolve(this.invalidEmojiFactory(iconId, imgElement));
        }

        let emoji: Emoji = {
            id: this.getEmojiHtmlId(iconId),
            tag: imgElement,
            isValid: true,
            src: imgSrc,
            alt: imgAlt
        };

        return Promise.resolve(emoji);

    }

    /**
     * Will parse a img element string and return that
     * img elements src attribute value
     * @param imgElement img html element as string 
     */
    protected getImgSrc(imgElement: string) {
        let srcExp = /src="([^")]+)"/;
        let srcResults = srcExp.exec(imgElement);

        if (!srcResults || !srcResults[1]) {
            /*
            let errMsg = 'error locating src tag for: '
              + iconId + ' - tag: ' + imgElement;
            this.logger.log(errMsg);
            this.logger.object(srcResults);
            */
            return null;
        }

        return srcResults[1];
    }

    /**
     * Will parse a img element string and return that
     * img elements alt attribute value
     * @param imgElement img html element as string 
     */
    protected getImgAlt(imgElement: string) {
        let altExp = /alt="([^")]+)"/;
        let altResults = altExp.exec(imgElement);

        if (!altResults || !altResults[1]) {
            /*
            let errMsg = 'error locating alt tag for: '
              + iconId + ' - tag: ' + imgElement;
            this.logger.log(errMsg);
            this.logger.object(altResults);
            */
            return null;
        }

        return altResults[1];
    }

    /**
     * Factory method to return Emoji objects that 
     * are specified as invalid
     * @param iconId UTF-8 html encoded value
     * @param imgElement img html element as string 
     */
    protected invalidEmojiFactory(
        iconId: string, imgElement: string): Emoji {
        let emoji: Emoji = {
            id: this.getEmojiHtmlId(iconId),
            tag: imgElement,
            isValid: false,
            src: null,
            alt: null
        };

        return emoji;
    }

    /**
     * Used in emoji array filter function to remove any emoji
     * values that were invalid during parsing
     * @param entry emoji entry
     */
    public filterInvalid(entry: Emoji): boolean {
        return entry.isValid;
    }

    /**
     * Will parse a icons url, retrieve it and set its 
     * dataUrl property
     * @param icon emoji icon entry
     */
    public returnDataURL = async (icon: Emoji): Promise<Emoji> => {

        // Must subscribe to init http requests as they are cold observables
        // this.makeCORSPreflightRequest(icon).subscribe();

        let promise: Promise<any> = this.makeSimpleRequest(icon)
            .then(
            (res: Response) => {
                return this.simpleRequestResponse(res, icon);
            })
            .catch(
            err => {
                this.handleRequestErrors(err);
                icon.isValid = false;
                // or attempt local storage request
                return Promise.resolve(icon);
            });

        return promise;
        //return Promise.resolve(icon);

    }

    /**
     * Will make a simple CORS request for our emoji img png file
     * 
     * Refernces:
     * https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
     * https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
     * https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
     * @param icon 
     */
    protected makeSimpleRequest(icon: Emoji): Promise<Response> {

        /**
         * Since we are using a simple request according to the 
         * CORS specification we do not have to do a preflight
         * CORS request, simply make the image request.
         */
        /**
         * We start by making a cross origin preflight request. This is 
         * necessary because we are not making a simple request 
        */
        let headersCtrOpts = {
            //'Origin': 'localhost',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.8',
            //'Access-Control-Request-Method': 'GET'
        };

        let headersArg: any = new Headers(headersCtrOpts);

        let options = new RequestOptions({
            headers: headersArg,
            // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
            // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
            responseType: ResponseContentType.Blob
        });

        return this.http.get(icon.src, options).toPromise();

    }

    /**
     * By setting the responseType propery in the XHR request we
     * can use the returned blob object and a file reader to return
     * a string representation of the data base64 encoded
     * 
     * Reference:
     * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
     * https://stackoverflow.com/questions/8778863/downloading-an-image-using-xmlhttprequest-in-a-userscript
     * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
     * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/response
     * https://fetch.spec.whatwg.org/#response-class
     * https://developer.mozilla.org/en-US/docs/Web/API/FileReader
     * https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
     * 
     * @param res XHR response object
     * @param icon Emoji object to retrieve
     */
    protected simpleRequestResponse(res: Response, icon: Emoji): Promise<Emoji> {

        //this.logger.log('simple request response: ');
        //this.logger.object(res);

        let imageBlob = res.blob();
        //this.logger.object(imageBlob);

        let reader = new FileReader();

        reader.onload = (event: UIEvent) => {
            let result = (event.target as FileReader).result;
            icon.dataUrl = result;
        };

        reader.readAsDataURL(imageBlob);

        return Promise.resolve(icon);
    }

    /**
     * Will make a preflight CORS request for our emoji img png file
     * Currently it seems to immediately return the image since the 
     * OPTIONS header is unallowed by twitters cdn
     * Refernces:
     * https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
     * https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
     * https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
     * @param icon 
     */
    protected makeCORSPreflightRequest(icon: Emoji) {

        this.logger.log('preflight request hostinfo: ' + window.location.hostname);
        /**
         * We start by making a cross origin preflight request. This is 
         * necessary because we are not making a simple request 
        */
        let headersCtrOpts = {
            'Origin': 'localhost',
            'Access-Control-Allow-Origin': window.location.hostname,
            'Access-Control-Request-Method': 'OPTIONS, GET',
            // Any header that is not one of the forbidden header names 
            // https://fetch.spec.whatwg.org/#forbidden-header-name
            'Access-Control-Request-Headers': 'Accept, Accept-Language'
        };

        let headersArg: any = new Headers(headersCtrOpts);

        let optionsCtrOpts = {
            method: RequestMethod.Get, // Twitter CDN does not accept preflight OPTIONS request
            headers: headersArg
        };

        let options = new RequestOptions(optionsCtrOpts);

        return this.http.get(icon.src, options)
            .map(this.preflightResponse)
            .catch(this.handleRequestErrors);

    }

    /**
     * Will handle the preflight response object
     */
    protected preflightResponse = (res: Response) => {

        this.logger.log('preflight response: ');
        this.logger.object(res);
    }

    /**
     * Will parse the XHR request error message
     * @param error error object/msg
     */
    protected handleRequestErrors(error: Response) {

        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = error.status + ' - ' + (error.statusText || '') + ' ' + err;
        } else {
            let err = (error as Error);
            errMsg = err.message ? err.message : err.toString();
        }

        this.logger.error(errMsg);
        return Observable.throw(errMsg);
    }

    /**
   * We are using the twemoji library to provide users with images
   * they can use as part of their drawings.
   * 
   * As they are parsed to return an img element src attribute 
   * url, we have to account for the browser support capabilities
   * of the crossorigin attribute. 
   * 
   * Twitters cdn does provide the images with the required 
   * Access-Control-Allow-Origin for crossorigin loading there is a
   * problem to be addressed.
   * 
   * If the browser does not support the crossorigin attribute,
   * using the images in canvas will 'taint' the canvas and we will 
   * no longer be able to use the 'getImageData' or 'toDataURL' methods
   * we need to save user images. 
   * 
   * Therefore, for those browsers we have to serve the images via 
   * our servers domain (aka local storage)
   * https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
   * https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
   */
    protected makeManualRequest = (): boolean => {

        let isNullUndefined = this.useManualRequest === undefined ||
            this.useManualRequest === null;

        if (this.attemptCount < 2) {
            this.logger.log('attempt count: ' + this.attemptCount);
            this.logger.log('value upon entering: ' + this.useManualRequest);
            this.logger.log('isNullUndefined: ' + isNullUndefined);
            this.logger.log('isIE: ' + detectBrowser.isIE());
            this.logger.log('isFirefox: ' + detectBrowser.isFirefox());
            this.logger.log('isChrome: ' + detectBrowser.isChrome());
            this.logger.log('isSafari: ' + detectBrowser.isSafari());
            this.logger.log('isOpera: ' + detectBrowser.isOpera());
            this.logger.log('isBlink: ' + detectBrowser.isBlink());
        }

        if (!isNullUndefined) {
            return this.useManualRequest;
        }

        this.logger.log('proceeding to check browser');

        this.useManualRequest = detectBrowser.isIE()
            || detectBrowser.isSafari() || detectBrowser.isOpera();

        if (this.attemptCount < 2) {
            this.logger.log('value after check: ' + this.useManualRequest);
        }

        this.attemptCount++;
        return this.useManualRequest;
    }

    /**
   * A callback used to rewrite the image url returned by twemoji.parse
   * https://github.com/twitter/twemoji
   * 
   * -- Unused --
   * @param icon - returned icon name
   * @param options - the parse options
   */
    protected setLocalUrl(icon, options) {
        return '/img/twemoji/' + options.size + '/' + icon + '.png';
    }




}