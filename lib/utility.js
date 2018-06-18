const fs = require('fs');
const http = require('http');
const xml2js = require('xml2js');
const flatten = require('flat');

function download(url, dest, cb){
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb);
        });
    });
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
exports.download = download;
exports.getEntitesFromMetadataFile = getEntitesFromMetadataFile;