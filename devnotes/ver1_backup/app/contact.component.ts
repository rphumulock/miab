import { Component, AfterContentInit, AfterViewInit, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import CustomValidators from './CustomValidators';
import * as $ from 'jquery';
//import * as WOW from 'wowjs'; 
//window = require('window');
//const WOW = require('./assets/js/wow.min.js'); 
//window.wow = new WOW.WOW({ live: false });
//import { WOW } from 'wow';
//var WOW = require('wow');
//declare var WOW
//require('window');
//Window.WOW = require('imports-loader?this.window!exports-loader?Wow!./assets/js/wow.min.js')
//import WOW from 'assets/js/wow.min.js';
//import WOW from 'wowjs'; 

require('./assets/jquery.countdown.js');

@Component({
  templateUrl: './contact.component.html'
})
export class ContactComponent implements AfterContentInit, AfterViewInit, OnInit {
  subscriptionForm: FormGroup;
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(){
    // Setup the Form Control
    this.subscriptionForm = this.formBuilder.group(
      {
        'email': ['', [Validators.required, CustomValidators.validateEmail]]
      }
    )
  }

  ngAfterContentInit() {
    /*
     Loader
    */
    $(".loader-img").fadeOut();
    $(".loader").delay(1000).fadeOut("slow");

  }
  ngAfterViewInit() {
    /*
      Wow
    */
    //new Window.WOW().init();

    // Initialize the countdown timer
    this.initCountDown();
  }

  initCountDown() {

    /*
          Countdown initializer
      */
    var now = new Date();
    var countTo = 25 * 24 * 60 * 60 * 1000 + now.valueOf();
    (<any>$('.timer')).countdown(countTo, function (event) {
      $(this).find('.days').text(event.offset.totalDays);
      $(this).find('.hours').text(event.offset.hours);
      $(this).find('.minutes').text(event.offset.minutes);
      $(this).find('.seconds').text(event.offset.seconds);
    });


  }

  submitForm(): void {

    let myTest: boolean = false;

    if (myTest) {
      $('.success-message').hide();
      $('.error-message').hide();
      $('.error-message').html("You have tested the failure message");
      $('.error-message').fadeIn('fast', function () {
        $('.subscribe form').addClass('animated shake').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
          $(this).removeClass('animated shake');
        });
      });
    }
    else {
      $('.error-message').hide();
      $('.success-message').hide();
      $('.subscribe form').hide();
      $('.success-message').html("You have tested the success message!");
      $('.success-message').fadeIn('fast', function () {
        (<any>$('.top-content')).backstretch("resize");
      });
    }
  }
}