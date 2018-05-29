// ./lib/index.js
const fs = require('fs');
var http = require('http');
var xml2js = require('xml2js');
var flatten = require('flat');
var mkdirp = require('mkdirp');
var usage = require(__dirname +'/../docs/usage.json');
var packageJson = require(__dirname + '/../package.json');

function download(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb);
        });
    });
}
function displayCommands(){
    var commandName = Object.keys(packageJson.bin)[0];
    //console.log(commandName);
    console.log(usage.instructions + usage.command + "\n");
}
function parseArguments(callback){
    var arguments = process.argv.slice(2);
    var obj = {
        serviceUrl: arguments[0],
        outputFilename: arguments[1]
    };
    callback(obj);
}
function getEntitesFromMetadataFile(fileName, callback){
    fs.readFile(fileName, function(err, data) {
        var parser = new xml2js.Parser();
        parser.parseString(data, function (err, result) {
            var flattenedMetadata = flatten(result);
            var entities = Object.keys(flattenedMetadata).filter(function(element){
                return element.match(/(EntitySet)/ig) && element.match(/(Name)/ig);
            }).map(function(value){  
                return flattenedMetadata[value];
            });
            callback(entities);
        });
    });
}

function downloadDataFromODataServiceUrl(serviceUrl, destinationDir){
    var serviceMetadataUrl = [serviceUrl, "$metadata"].join("");
    //var destinationDir = "odataServiceDump";
    destinationDir = destinationDir || "odataservice-dump"
    var tokens = serviceUrl.split("/");
    var subDirectory = tokens[tokens.length - 2];
    var dPath = [".", destinationDir, subDirectory].join("/");
    console.log(dPath);
    mkdirp(dPath, function (err) {
        if (err) 
            console.error(err)
        else {
            var metadataUri = [dPath, "metadata.xml"].join("/");
            download(serviceMetadataUrl, metadataUri, function(){
                console.log("downloading " + metadataUri);
                getEntitesFromMetadataFile(metadataUri, function(entities){
                    entities.forEach(function(value){
                        var endpointUrl = [serviceUrl, value].join("");
                        var dest = [dPath,value].join("/")+".json";
                        download(endpointUrl, dest, function(){
                            console.log("downloading /" + dest);
                        });
                    });
                });
            });
        }
    });   
}

exports.downloadDataFromODataServiceUrl = downloadDataFromODataServiceUrl;
exports.displayCommands = displayCommands;
exports.parseArguments = parseArguments;