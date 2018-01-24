/**
 * Exports a series of functions that will check the browser type and return a true/false value.
 * https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
 * 
 * Author: Edwin Gathura
 */
if (typeof module != 'undefined') {
  // node module exports
  module.exports = {
    // Opera 8.0+
    isOpera: function () {
      return (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    },

    // Firefox 1.0+
    isFirefox: function () {
      return typeof InstallTrigger !== 'undefined';
    },

    // Safari 3.0+ "[object HTMLElementConstructor]" 
    isSafari: function () {
      return /constructor/i.test(window.HTMLElement) || (function (p) {
        return p.toString() === "[object SafariRemoteNotification]";
      })(!window['safari'] || safari.pushNotification);
    },

    // Internet Explorer 6-11
    isIE: function () {
      return /*@cc_on!@*/ false || !!document.documentMode;
    },

    // Edge 20+
    isEdge: function () {
      return !isIE && !!window.StyleMedia;
    },

    // Chrome 1+
    isChrome: function () {
      return !!window.chrome && !!window.chrome.webstore;
    },

    // Blink engine detection
    isBlink: function () {
      return (this.isChrome || this.isOpera) && !!window.CSS;
    }
  }

}
