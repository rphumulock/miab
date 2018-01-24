// Vendor Imports
import { Injectable } from '@angular/core';
import {
    FormGroup,
    AbstractControl
} from '@angular/forms';
import { Subject, Observable } from 'rxjs';

// App Imports
import { LoggingService } from '../';

/**
 * This class is responsible for managing a reactive forms 
 * error message status. It exposes several observables 
 * a component class can subscribe to and will receive error
 * updates which the component class can use to update its
 * template
 */
@Injectable()
export class FormErrorManager {

    /**
     * A collection mapping controls to observables
     * for said controls and their current error state.
     */
    public formErrors: Map<string, Observable<string>>;
    /**
     * A collection mapping controls to Subjects that 
     * allow us to broadcast changes in the error status
     * of the controls
     */
    protected controlRxSubjects: Map<string, Subject<string>>;
    /**
     * The form group we are monitoring
     */
    protected form: FormGroup;
    /**
     * The control names we are monitoring in the provided
     * form group
     */
    protected controlNames: Array<string>;
    /**
     * For each control, where the key is the control name, 
     * provide another collection of error types that validators
     * will return and their error message
     */
    protected validationMessages: Map<string, Map<string, string>>;

    constructor(
        protected logger: LoggingService) {
    }

    /**
     * Initialize this FormErrorManager
     * @param form the form group to monitor
     * @param controlNames list of controls to monitor
     * @param validationMessages collection of control error messages
     */
    public initErrorManager(
        form: FormGroup,
        controlNames: Array<string>,
        validationMessages: Map<string, Map<string, string>>, ) {

        this.form = form;
        this.controlNames = controlNames;
        this.validationMessages = validationMessages;
        this.initControlObservables();
        this.resetFormErrors();
        this.registerControlSubscriptions();
    }

    /**
     * Will instantiate the required observables and create 
     * the rxjs Subjects needed
     */
    protected initControlObservables() {
        this.formErrors = new Map<string, Observable<string>>();
        this.controlRxSubjects = new Map<string, Subject<string>>();

        this.controlNames.forEach(control => {
            let newSubject = new Subject<string>();
            this.controlRxSubjects.set(control, newSubject);
            this.formErrors.set(control, newSubject.asObservable());
        });
    }

    /**
     * For each control it will broadcast an 
     * empty error value so the component can remove
     * any previous errors
     */
    protected resetFormErrors() {
        this.controlNames.forEach(val => { this.controlRxSubjects.get(val).next(''); });
    }

    /**
     * For each monitored control, we register to its
     * control status changed value
     */
    protected registerControlSubscriptions() {
        this.controlNames.forEach(val => {
            let control = this.form.get(val);
            control.statusChanges.subscribe(status => {
                this.logger.log(val + ' control status changed: ');
                this.logger.object(status);
                this.controlStatusChanged(val, control);
            });
        });
    }

    /**
     * The callback used to parse the control status
     * when the status changed event is received
     * @param controlName the control name
     * @param control the actual control
     */
    protected controlStatusChanged(
        controlName: string,
        control: AbstractControl) {

        // reset the error message if any
        this.controlRxSubjects.get(controlName).next('');

        if (control.pending || control.valid) {
            return;
        }

        // if the control was used but has no value, reset it
        if (control.dirty && !control.valid && !control.value) {
            control.reset();
            return;
        }

        if (control.dirty && !control.valid) {

            const messages = this.validationMessages.get(controlName);
            this.logger.warn(controlName + ' error object: ');
            this.logger.warn(control.errors);

            let controlErrors = messages.keys();
            let nextError = controlErrors.next().value;
            while (nextError) {
                this.logger.log('checking for ' + nextError + ' error in control.');
                if (control.errors[nextError] === undefined ||
                    control.errors[nextError] === null) {

                    nextError = controlErrors.next().value;
                    continue;
                }
                let errorUpdate = messages.get(nextError);
                // broadcast the available error message
                this.controlRxSubjects.get(controlName).next(errorUpdate);
                this.logger.warn('error found');
                this.logger.warn(errorUpdate);
                break; // only allow one error to be displayed at a time
            }
        }
    }
}
