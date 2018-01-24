import { Component, OnInit, AfterContentInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '../services/customvalidators';
import * as $ from 'jquery';
import * as firebase from 'firebase';

import { LandingPageService } from '../services/landingpage.service';

/**
 * Purpose: Capture user emails
 * 
 * Major components: Input box, submit button
 * 
 * 
 * To-do: 
 * - Remove all dependencies to the landing page service?
 */
@Component({
  templateUrl: './contact.component.html',
  styleUrls: ['contact.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  providers: [LandingPageService]
})
export class ContactComponent implements AfterContentInit, OnInit {
  subscriptionForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
    private ls: LandingPageService) { }

  ngOnInit() {
    // Setup the Form Control
    this.subscriptionForm = this.formBuilder.group(
      {
        'email': ['', [
          Validators.required,
          CustomValidators.validateEmail,
          Validators.minLength(6),
          Validators.maxLength(36)
        ]]
      }
    )
  }

  ngAfterContentInit() {
    /*
     Loader
    */
    $('.loader-img').fadeOut();
    $('.loader').delay(1000).fadeOut('slow');

  }

  submitForm(): void {

    let emailControl = this.subscriptionForm.controls['email'];

    if (this.subscriptionForm.valid !== true) {

      $('.success-message').hide();
      $('.error-message').hide();
      $('.error-message').html('Invalid Email! Try again, don\'t miss out!');

      let jqueryFadeInOptions: any = {
        duration: 600,
        complete: this.onFadeInComplete
      };

      // http://api.jquery.com/fadein/
      $('.error-message').fadeIn(jqueryFadeInOptions);

      return;
    }

    this.ls.firebaseApp.database().ref('subscribers').push(
      { email: this.subscriptionForm.controls['email'].value }
    ).then(this.addEmailCallback).catch(err => console.log(err));
  }

  /**
   * Callback function for the jquery FadeIn animation
   * http://api.jquery.com/fadein/
   */
  private onFadeInComplete() {

    // http://api.jquery.com/oe/
    let eventType: any = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

    function animationEventHandler(form: JQuery) {
      $(form).removeClass('animated shake');
    }

    let subscribeForm = $('.subscribe form');

    // Add an event handler on the shake event to remove the shake class
    $(subscribeForm).one(eventType, animationEventHandler($(subscribeForm)));

    // Add the class to animate the invalid form entry
    $(subscribeForm).addClass('animated shake');
  }

  /**
   * Callback function given to firebase push method call and returned
   * Promise<any> object.
   * 
   * This is an instance function since it is used primairly in callbacks...
   * So the 'this' refers to this instance -> 
   * https://github.com/Microsoft/TypeScript/wiki/'this'-in-TypeScript
   */
  private addEmailCallback = (value: any) => {

    $('.error-message').hide();
    $('.success-message').hide();
    $('.subscribe form').hide();
    $('.success-message').html('Thank you for subscribing!');
    $('.success-message').fadeIn('fast', function () {
      (<any>$('.top-content')).backstretch('resize');
    });

  }
}
