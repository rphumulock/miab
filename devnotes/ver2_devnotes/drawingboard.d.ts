// http://stackoverflow.com/questions/38445132/import-js-file-with-typescript-2-0
//http://stackoverflow.com/questions/12687779/how-do-you-produce-a-d-ts-typings-definition-file-from-an-existing-javascript
//http://stackoverflow.com/questions/42636948/angular-2-aot-calling-function-chartmodule-function-calls-not-supported
//import * as DrawingBoard from './drawingboard.js';

/*
export function DrawingBoardFactory(){
  var db= require('./drawingboard.js');
  return db;
}*/

//var DrawingBoard = DrawingBoardFactory();
export * from './drawingboard.js';
export declare let DrawingBoard: any;