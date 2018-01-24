// Vendor Imports
import { Component } from '@angular/core';

// App Imports
import { NavMenuService } from '../menus';

@Component({
  templateUrl: 'pagenotfound.component.html',
  styleUrls: ['pagenotfound.component.css']
})
export class PageNotFoundComponent {

  constructor(protected navService: NavMenuService) {
  }

  ngAfterViewChecked() {
    this.navService.hide();
  }

}