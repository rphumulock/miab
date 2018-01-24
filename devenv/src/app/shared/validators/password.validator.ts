import { FormControl } from '@angular/forms';

export class PasswordValidator {

    static weakPasswordStrength(control: FormControl): { [error: string]: any } {
        // Reference: https://dzone.com/articles/use-regex-test-password
        let errors: any = {};
        let MIN_LEN_REGEXP = /(^.{6,36}$)/;
        let HAS_LWR_CASE = /(?=.*[a-z])/;
        let HAS_UPR_CASE = /(?=.*[A-Z])/;

        if (!MIN_LEN_REGEXP.test(control.value)) {
            errors.minlength = true;
        }
        if (!HAS_LWR_CASE.test(control.value)) {
            errors.haslowercase = true;
        }
        if (!HAS_UPR_CASE.test(control.value)) {
            errors.hasuppercase = true;
        }

        if (errors.minlength || errors.haslowercase || errors.hasuppercase) {
            return errors;
        } else {
            return null;
        }
    }

    static mediumPasswordStrength(control: FormControl): { [error: string]: any } {
        // Reference: https://dzone.com/articles/use-regex-test-password
        let PASS_REGEXP = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{5, })/;

        return PASS_REGEXP.test(control.value) ? null : {
            weakPassword: {
                msg:
                `Password must contain at least one:
          - lower case letter
          - upper case letter
          - numerical chracter (number)
        Password must be at least 6 chatacters long!
        `
            }
        };
    }

    static strongPasswordStrength(control: FormControl): { [error: string]: any } {
        // Reference: https://dzone.com/articles/use-regex-test-password
        let PASS_REGEXP = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8, })/;

        return PASS_REGEXP.test(control.value) ? null : {
            weakPassword: {
                msg:
                `Password must contain at least one:
          - lower case letter
          - upper case letter
          - numerical chracter (number)
          - special character
        Password must be at least 8 chatacters long!
        `
            }
        };

    }

}
