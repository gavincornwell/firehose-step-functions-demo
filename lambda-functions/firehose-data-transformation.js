'use strict';

exports.handler = (event, context, callback) => {
    
    console.log("event: " + JSON.stringify(event, null, 2));
    
    var output = [];
    
    event.records.forEach(function(record) {

        var decodedData = Buffer.from(record.data, 'base64');
        var decodedDataObj = JSON.parse(decodedData);
        var result = "Dropped";
        var encodedData = record.data;

        console.log("record: " + JSON.stringify(decodedDataObj, null, 2));

        if (decodedDataObj.type == "NODEADDED" &&
            decodedDataObj.nodeType == "cm:content" &&
            (decodedDataObj.name.endsWith(".jpg")||decodedDataObj.name.endsWith(".jpeg")||decodedDataObj.name.endsWith(".png"))) {
            result = "Ok";
            
            // add carriage return to data and re-encode
            encodedData = new Buffer(JSON.stringify(decodedDataObj) + "\n").toString('base64');
            
            console.log("Accepted record " + record.recordId);
        } else {
            console.log("Dropped record " + record.recordId);
        }

        output.push({
            recordId: record.recordId,
            result: result,
            data: encodedData
        });
    });

    console.log(`Successfully processed ${output.length} records.`);

    callback(null, { records: output });
};