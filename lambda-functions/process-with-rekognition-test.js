'use strict';

// set the region
process.env.AWS_REGION = 'us-west-2';

let processImage = require('./process-with-rekognition.js');

// TODO: Add a recent event object here (needs to refer to nodes present in the repository)
var event = {};

// run the tests
console.log("Running test...");

// execute the handler
processImage.handler(event, {}, function(error, result) {
    if (error) {
        console.log("FAILED");
    } else {
        console.log("SUCCESS");
    }
});