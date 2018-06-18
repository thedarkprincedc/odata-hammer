var ServiceMetadata = require('odata-v4-service-metadata').ServiceMetadata;
var fs = require('fs');
var format = require('xml-formatter');
var convertExcel = require('excel-as-json').processFile
var mkdirp = require('mkdirp');

function convertFromExcel($excelFilename, $outputFilename){
    $outputFilename = $outputFilename || "tmp/imp.json";
    var options = {
        sheet:'1',
        isColOriented: false,
        omitEmtpyFields: false
    };

    convertExcel($excelFilename,  $outputFilename, options, (err, data) => {
        if(err){
            console.log("JSON conversion failure: #{err}");
        }
        console.log($outputFilename+"--");
    });
}

function generateMetadata(outputFilename){
    outputFilename = outputFilename || "tmp/imp.xml";
    mkdirp("tmp/", function (err) {
        if (err) 
            console.error(err)
        else {

        }
    });
    var s = ServiceMetadata.defineEntities({
        namespace: 'NorthwindModel',
        containerName: 'NorthwindEntities',
        entities: [
            {
                name: 'WebContentStat',
                collectionName: ['webcontent_stat_daily'],
                keys: ['timestamphour', 'aggregationlevel', 'content', 'pcdurl', 'objecttype', 'visits', 'custom','id'],
                computedKey: true,
                properties: {
                    timestamphour: 'Edm.String',
                    aggregationlevel: 'Edm.String',
                    content: 'Edm.String',
                    pcdurl: 'Edm.String',
                    objecttype: 'Edm.String',
                    visits: 'Edm.String',
                    custom: 'Edm.String',
                    id: 'Edm.String',
                }
            },
            {
                name: 'WebContentStat',
                collectionName: ['webcontent_stat_monthly'],
            },
            {
                name: 'WebContentStat',
                collectionName: ['webcontent_stat_weekly'],
            }
        ]
    }, {
        edmx :  "http://schemas.microsoft.com/ado/2007/06/edmx",
        m: "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata",
        xmlHead: ""
    });
    fs.writeFile(outputFilename, format(s.data), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 
}

//exports.displayCommands = displayCommands;
exports.generateMetadata = generateMetadata;
exports.convertFromExcel = convertFromExcel;