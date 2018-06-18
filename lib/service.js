// ./lib/index.js
var mkdirp = require('mkdirp');
var ServiceMetadata = require('odata-v4-service-metadata').ServiceMetadata;
var fs = require('fs');
var format = require('xml-formatter');
var convertExcel = require('excel-as-json').processFile
var utility = require("./utility.js");
const path = require('path');

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
            //console.log("The file was saved!");
        }); 

        console.log(dataKeys);
    });
    // convertExcel($excelFilename,  $outputFilename, options, (err, data) => {
    //     if(err){
    //         console.log("JSON conversion failure: #{err}");
    //         return;
    //     }

    //     var dataKeys = Object.keys(data[0]);
    //     var endPointName = "Default";
    //     var collectionName = path.basename($excelFilename).split(".")[0];
    //     var properties = {};
    //     var dkeys = [];
    //     dataKeys.forEach(function(value, index){
    //         var currType = typeof(data[0][value]);
    //         var odataType = (dataTypeMap[currType])?dataTypeMap[currType]:dataTypeMap.default;
    //         properties[value] = odataType;
    //         dkeys[index] = value;
    //     });
    //     var s = ServiceMetadata.defineEntities({
    //             namespace: 'NorthwindModel',
    //             containerName: 'NorthwindEntities',
    //             entities: [
    //                 {
    //                     name: endPointName,
    //                     collectionName: [collectionName],
    //                     keys: dkeys,
    //                     computedKey: true,
    //                     properties: properties
    //                 },
    //             ]
    //         }, {
    //         edmx :  "http://schemas.microsoft.com/ado/2007/06/edmx",
    //         m: "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata",
    //         xmlHead: ""
    //     });
    //     fs.writeFile("meta.xml", format(s.data), function(err) {
    //         if(err) {
    //             return console.log(err);
    //         }
    //         onCompleteCallback();
    //         //console.log("The file was saved!");
    //     }); 
    //     //console.log(typeof(data[0][dataKeys[2]]));
    //     // onCompleteCallback({
    //     //     input: $excelFilename,
    //     //     output: $outputFilename
    //     // })
    // });
    // outputFilename = outputFilename || "tmp/imp.xml";
 
  
}
exports.generateMetadata = generateMetadata;
exports.excelToJson = excelToJson;
exports.downloadDataFromODataServiceUrl = downloadDataFromODataServiceUrl;