#!/usr/bin/env node
// var wizard = require("../lib/command-line/wizard")
var program = require('commander');
var service = require('../lib/service.js');
var fs = require('fs');
const path = require('path');

program.
    version('0.1.0');
program
    .command('import <ServiceUrl>')
    .alias('i')
    .description('This command imports metadata and collections from a ODATA service url.\n') 
    .option('-d, --dest [destinationPath]', "Destination Path", "./")
    .action((serviceurl, args)=>{
        var dest = [args.dest,path.basename(serviceurl)].join("");
        service.downloadDataFromODataServiceUrl(serviceurl, dest);
    });
program   
    .command('generate <filename.xlsx|xls>')
    .alias('g')
    .description('This command generates metadata and data from a excel spreadsheet.\n') 
    .option('-d, --dest [destinationPath]', "Destination Path", "./")
    .action((filename, args) => {
        var basename = path.basename(filename).split(".")[0];
        var dest = [args.dest, [basename+"-metadata", 'xml'].join(".")].join("");
        service.generateMetadata(filename, dest, function(){
            console.log("\n\Generated data and metadata file Succesfully! \n\tDatafile= %s  \n\tMetadata file= %s\n", filename, dest);
        });
    });
program   
    .command('xltojson <filname.xlsx|xls>')
    .alias('x')
    .description('This command generates a json file from a excel spreadsheet.\n') 
    .option('-d, --dest [destinationPath]', "Destination Path", "./")
    .action((filename, args) => {
        if (!fs.existsSync(filename)) {
           // file not found exception
        }
        var basename = path.basename(filename).split(".")[0];
        var destfilename = [args.dest, [basename, 'json'].join(".")].join("/");
        service.excelToJson(filename, destfilename, (response) => {
            console.log("\n\tExported %s to %s successfully\n", filename, destfilename);
        });
    });
program.parse(process.argv);

//wizard.run();