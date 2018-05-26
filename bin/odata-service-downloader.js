#!/usr/bin/env node

// var importa = require('../lib/import.js');
var exporta = require('../lib/export.js');

// var arguments = process.argv.slice(2);

// if(arguments.length > 0){
//   importa.parseArguments(function(arg){
//     importa.downloadDataFromODataServiceUrl(arg.serviceUrl);
//   });
// }
// else{
//   importa.displayCommands();
// }

exporta.generateMetadata();
