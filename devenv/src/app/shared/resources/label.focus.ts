// Vendor Imports
import { Injectable } from '@angular/core';

// App Imports
import { LoggingService } from '../';

@Injectable()
export class LabelFocusDetector {

    public registerListeners(inputId: string, labelId: string) {

        let input = document.getElementById(inputId);

        if (!input) {
            console.error('unable to find input to add\
                label focus detection listeners - id: ' + inputId);
            return;
        }

        let label = document.getElementById(labelId);

        if (!input) {
            console.error('unable to find label to add\
                label focus detection listeners\
                - input id: ' + inputId +
                ' - label id: ' + labelId);
            return;
        }

        input.addEventListener('focus',
            event => {
                console.log('label is now active');
                label.classList.add('input-label-active');
            });

        input.addEventListener('blur',
            event => {
                console.log('label is now NOT active');
                label.classList.remove('input-label-active');
            });

    }

}

