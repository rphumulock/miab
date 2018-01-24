## Synopsis
This repo is used to develop and publish the angular Message in a Bottle project.

## Installation
To "install" and use this project....

1. Download a local copy via git clone
2. Checkout to a personal branch so your commits and don't affect the master branch -> "git checkout -b new-branch"
3. cd (change directory) into the folder where this repo was installed 
4. run the command "npm install"
5. run the command "npm link miablib" // Goto https://github.com/zumbiilInc/miablib and read the instructions there...

References:
https://docs.npmjs.com/cli/link

## Use
To use the classes etc, simply import this project into your code "import { .... } from 'miablib/miab'" like you normally
do for other dependencies. You can also add this project as a dependency into your projects package.json

*** IMPORTANT *** 
Before you can use this library you need to make sure you install the miablib library
https://github.com/zumbiilInc/miablib 

Also if you are using the devserver npm script, note that CopyWebpackPlugin will not work.
So first run build-dev to copy the new static files.

4.0.0-alpha.6/css/bootstrap.min.css is required either in index.html or in the component style sheet for 
the NgModalService
