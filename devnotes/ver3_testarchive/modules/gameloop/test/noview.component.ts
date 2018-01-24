// Vendor Imports
import {
    Component,
    OnInit
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';


// App Imports
import {
    NgModalComponentTemplate,
    NgModalService
} from '../../../shared/ngmodalservice';
import { LoggingService } from '../../../shared';
import { NoViewService } from './noview.service';


@Component({
    template: 
    `<div>
        <p>{{ message }}</p>
        <p id="domValElm">this is dom text to be read later</p>
    </div>`
})
export class NoViewComponent {

    message: string;
    changeValue = 10;
    constructor(
        protected noViewService: NoViewService,
        protected logger: LoggingService) {
        this.message = 'Welcome to the no view component.\n \
        This component is used to test the behavior of injected \
        services and callback functions when the view where that \
        function lives is no longer in view.\n To understand the test \
        and the behavior please see the console logs and actual source \
        code for this component.\n\nThank you!';

        this.noViewService.noViewCallback = this.myCallback;
    }

    myCallback = () => {
        this.logger.log('NoView Callback Invoked!!');
        this.changeValue = 12;
        this.logger.object(this.changeValue);
        let domTextElm = document.getElementById('domValElm') as HTMLParagraphElement;
        this.logger.object(domTextElm);
        let domText = domTextElm.textContent;
        this.logger.log(domText);

    }

}