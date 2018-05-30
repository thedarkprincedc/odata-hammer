#!/usr/bin/env node

// 
var wizard = require("../lib/command-line/wizard")
var program = require('commander');
var importa = require('../lib/import.js');
var exporta = require('../lib/export.js');

program.
    version('0.1.0');
program
    .command('import <ODataServiceUri>')
    .alias('i')
    .description('Import Metadata and Data from Service Url') 
    .option('-d, --dest [destinationPath]', "Destination Path", "./")
    .action(importServiceUri);
program   
    .command('generate <ExcelSpreadsheetFilename>')
    .alias('g')
    .description('Generate Metadata and Data from Excel Spreadsheet') 
    .option('-d, --dest [destinationPath]', "Destination Path", "./odataservice-dump")
    .action(generateMetadataFromExcel);
program.parse(process.argv);
wizard.run();

function importServiceUri(endpointUrl, args){
    console.log("Import");
    console.log(endpointUrl);
    console.log(args.dest);
    importa.downloadDataFromODataServiceUrl(endpointUrl, args.dest);
}
function generateMetadataFromExcel(excelFilename, args){
    console.log("Generate");
    console.log(excelFilename);
    console.log(args.dest);
    exporta.generateMetadata();
}

