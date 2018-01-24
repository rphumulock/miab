// Vendor Imports
import { Injectable } from '@angular/core';

// App Imports
import { Configuration } from '../configs/app.config';
import { FirebaseProject, FirebaseProjectsManager } from 'miablib/firebaseutil';


@Injectable()
export class FirebaseProjectService {

    protected projectManager: FirebaseProjectsManager;
    get projects(): FirebaseProjectsManager { return this.projectManager; }

    protected _default: FirebaseProject;
    get default(): FirebaseProject { 
        if (!this._default.isInitialized) {
            this._default.initProject();
        }
        return this._default;
     }

    constructor(protected config: Configuration) {
        this.projectManager = new FirebaseProjectsManager();


        let appProjects = Array<FirebaseProject>();

        /**
         * Unocomment to use dynamic configuration using 
         * application wide constant set in webpack during build
         * 
         * This is how you want your production app to be configured
         */
        /*
        if ( process.env.ENV === 'production') {
            appProjects.push(new FirebaseProject('prod', config.FIREBASE_PRODUCTION_PROJECT, true));
            appProjects.push(new FirebaseProject('dev', config.FIREBASE_DEV_PROJECT, false));
        } else {
            appProjects.push(new FirebaseProject('dev', config.FIREBASE_DEV_PROJECT, true));
            appProjects.push(new FirebaseProject('prod', config.FIREBASE_PRODUCTION_PROJECT, false));
        }
        */

        // Explicit config -- Testing
        appProjects.push(new FirebaseProject('dev', config.FIREBASE_DEV_PROJECT, true));
        appProjects.push(new FirebaseProject('prod', config.FIREBASE_PRODUCTION_PROJECT, false));
        appProjects.push(new FirebaseProject('crm', config.FIREBASE_WEBCRM_PROJECT, false));


        // Give the project manager our configs to manage
        this.projectManager.addProjects(appProjects);

        // Initilaize access to the default project
        this.projectManager.default.initProject(); // -> or do this somewhere else...
        //this.projectManager.project('landing').initProject();

        this._default = this.projectManager.default;
    }

}

