/**
 * Helper file see 
 * https://gist.github.com/Hufschmidt/e06bdd5592f177c58ba7cad8a023d999
 */

// Load external modules
let path = require('path');


// Hard-coded path to project root (relative to this file)
let projectRoot = path.resolve(__dirname, '..');


// Export as module
module.exports = {
  /**
   * root(relpath)
   *  Creates an absolute path from a path relative to the project root.
   */
  root: function(relpath) {
    //console.log('helpers projRoot: ' + projectRoot );
    //console.log('relPath: ' + relpath);
    var strRet = '';
    if (relpath) {
      strRet = path.resolve(projectRoot, relpath);
      //return path.resolve(projectRoot, relpath);
    } else {
      strRet = projectRoot;
     //return projectRoot;
    }
    //console.log('returned path: ' + strRet)
    return strRet;
  },

  /**
   * hasFlag(flag)
   *  Checks for 'flag' inside argument-list.
   */
  hasFlag(flag) {
    return process.argv.join('').indexOf(flag) > -1;
  }
}