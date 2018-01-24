'use strict';

export function concatPath(args: string[]): string {
    let returnPath = '';

    args.forEach(element => {
        returnPath += element + '/';
    });

    while ( returnPath.endsWith('/') ) {
        returnPath = returnPath.substring(
            0, returnPath.length - 1);
    }

    return returnPath;
}