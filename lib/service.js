// ./lib/index.js
var mkdirp = require('mkdirp');
var ServiceMetadata = require('odata-v4-service-metadata').ServiceMetadata;
var fs = require('fs');
var format = require('xml-formatter');
var convertExcel = require('excel-as-json').processFile
var utility = require("./utility.js");
const path = require('path');
var inquirer = require('inquirer');

function downloadDataFromODataServiceUrl(serviceUrl, destDir){
    var serviceMetadataUrl = [serviceUrl, "$metadata"].join("");
    mkdirp(destDir, function (err) {
        if (err){
            console.error(err);
            return;
        } 
        var metadataUri = [destDir, "metadata.xml"].join("/");
        utility.download(serviceMetadataUrl, metadataUri, function(){
            console.log("Downloaded %s", metadataUri);
            utility.getEntitesFromMetadataFile(metadataUri, function(entities){
                entities.forEach(function(value){
                    var endpointUrl = [serviceUrl, value].join("");
                    var dest = [destDir,value].join("/")+".json";
                    utility.download(endpointUrl, dest, function(){
                        console.log("Downloaded %s", dest);
                    });
                });
            });
        });
    });   
}

function excelToJson($excelFilename, $outputFilename, onCompleteCallback){
    var options = {
        sheet:'1',
        isColOriented: false,
        omitEmtpyFields: false
    };
    convertExcel($excelFilename,  $outputFilename, options, (err, data) => {
        if(err){
            console.log("JSON conversion failure: #{err}");
            return;
        }
        onCompleteCallback({
            input: $excelFilename,
            output: $outputFilename,
            data: data
        })
    });
}

function generateMetadata($excelFilename, destPath, onCompleteCallback){
    console.log($excelFilename);
    $outputFilename = "./test.json";
    var dataTypeMap = {
        string: 'Edm.String',
        number: 'Edm.Number',
        default: 'Edm.String'
    }
    excelToJson($excelFilename,  $outputFilename, (response) => {
        var dataKeys = Object.keys(response.data[0]);
        var endPointName = "Default";
        var collectionName = path.basename($excelFilename).split(".")[0];
        var properties = {};
        var dkeys = [];
        dataKeys.forEach(function(value, index){
            var currType = typeof(response.data[0][value]);
            var odataType = (dataTypeMap[currType])?dataTypeMap[currType]:dataTypeMap.default;
            properties[value] = odataType;
            dkeys[index] = value;
        });
        var s = ServiceMetadata.defineEntities({
                namespace: 'NorthwindModel',
                containerName: 'NorthwindEntities',
                entities: [
                    {
                        name: endPointName,
                        collectionName: [collectionName],
                        keys: dkeys,
                        computedKey: true,
                        properties: properties
                    },
                ]
            }, {
            edmx :  "http://schemas.microsoft.com/ado/2007/06/edmx",
            m: "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata",
            xmlHead: ""
        });
        fs.writeFile("meta.xml", format(s.data), function(err) {
            if(err) {
                return console.log(err);
            }
            onCompleteCallback();
        }); 
    });
}
function getFiles(filepath){
    var choices = [];
    fs.readdirSync(filepath).forEach(file => {
        if(path.extname(file) == '.xlsx'){
          choices.push({name: file, value: file});
       }
    });
    return choices;
}
function wizard(dest){
    var choices = [{
        type: "list",
        name: "taskType",
        message: "What would you like to do?",
        choices: [
          {
            name: 'Convert excel file to json file',
            value: 'convert'
          },
          {
            name: 'Retrieve Metadata and collections from Service Url (External)',
            value: 'retrieve'
          },
          {
            name: 'Generate metadata and data from an excel file',
            value: 'generate'
          },
         ]
      },
      {
        when: function(response){
            return (response.taskType == 'convert');
        },
        type: "list",
        name: "filename",
        message: "Which Excel file should I convert to JSON?",
        choices: getFiles("./")
      },
      {
        when: function(response){
            return (response.taskType == 'retrieve');
        },
        type: "input",
        name: 'serviceurl',
        message: 'Enter the location of the ODATA service url you want to download?'
      },
      {
        when: function(response){
            return (response.taskType == 'generate');
        },
        type: "list",
        name: 'filename',
        message: 'Which Excel file should I convert and generate metadata for?',
        choices: getFiles("./")
    }
    ];
    inquirer.prompt(choices).then( (answers )=> {
        switch(answers.taskType){
            case "convert":
                var filename = answers.filename;
                var basename = path.basename(answers.filename).split(".")[0];
                var destfilename = ["./", [basename, 'json'].join(".")].join("/");
                excelToJson(filename, destfilename, (response) => {
                    console.log("\n\tExported %s to %s successfully\n", filename, destfilename);
                });
            break;
            case "retrieve":
                var dest = ["./",path.basename(answers.serviceurl)].join("");
                downloadDataFromODataServiceUrl(answers.serviceurl, dest);
            break;
            case "generate":
                var filename = answers.filename;
                var basename = path.basename(filename).split(".")[0];
                var dest = ["./", [basename+"-metadata", 'xml'].join(".")].join("");
                generateMetadata(filename, dest, function(){
                    console.log("\n\Generated data and metadata file Succesfully! \n\tDatafile= %s  \n\tMetadata file= %s\n", filename, dest);
                });
            break;
        }
    }
);
}
exports.wizard = wizard;
exports.generateMetadata = generateMetadata;
exports.excelToJson = excelToJson;
exports.downloadDataFromODataServiceUrl = downloadDataFromODataServiceUrl;