// Vendor Imports
import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';

// App Imports
import { collection } from './collection.emoji';
import { LoggingService } from '../../../shared';
import { TwemojiService } from './twemoji.service';
import { Emoji } from '../drawinglibrary';

let detectBrowser = require('../../../shared/resources/detectbrowser.js');


@Injectable()
export class EmojiResolveGuard implements Resolve<Array<string>> {

  protected currentIdx: number;

  constructor(
    protected logger: LoggingService,
    protected router: Router,
    protected twemojiService: TwemojiService) {
    this.currentIdx = 0;
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any> {

    //this.logger.log('emoji resolve guard.');
    return this.getEmojis(41)
      .catch(
      err => {
        //let errMsg = 'Unable to load required resources for route.\
        //Resetting your game session. :(';
        // responsible for resetting the game and navigating back to main menu
        //this.sessionErrors.notifyError(errMsg, 3000, true);
        // this.router.navigate(['/game']);
        return Promise.reject(err);
      });

  }

  public getEmojis(count: number): Promise<any> {

    let emojiCollection = collection.split('|');

    let max = this.currentIdx + count;

    let totalCollectionCount = emojiCollection.length;

    emojiCollection = emojiCollection.filter((val, index) => {
      return index >= this.currentIdx && index < max;
    });

    let log = {
      'count-requested': count,
      'current-idx': this.currentIdx,
      'next-idx': max,
      'total-length:': totalCollectionCount,
      'subset-length': emojiCollection.length
    };

    //this.logger.object(log);
    

    if (!emojiCollection || emojiCollection.length === 0) {
      return Promise.reject('no more emojis to load');
    }

    return Promise.all(emojiCollection.map(this.twemojiService.parseIconId))
      .then(
      values => {
        // this.logger.log('finished processing emojis, array length: ' + values.length);

        let validEmojiArr = values.filter(this.twemojiService.filterInvalid); // removes invalid emojis

        /*
        this.logger.log('removed ' + (values.length - validEmojiArr.length) +
          ' invalid emojis. new count: ' + validEmojiArr.length);
        */

        return validEmojiArr;
      })
      .then(
      validEmojis => {
        return Promise.all(validEmojis.map(this.twemojiService.returnDataURL));
      })
      .then(
      results => {
        //this.logger.log('returning ' + results.length + ' emojis from request');
        this.currentIdx = this.currentIdx + count;
        return results;
      })
      .catch(
      err => {
        this.logger.error('Error while retreiving emjoii\'s: ' +
          '\n start index: ' + (this.currentIdx - count));
        this.logger.object(err);

        return Promise.reject(err);
      });

  }


}

