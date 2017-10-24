'use strict';

let processImage = require('./process-with-rekognition.js');

// TODO: Add a recent event object here (needs to refer to nodes present in the repository)
var event = {};

// run the tests
console.log("Running test...");

// TODO: instantiate client in image-processor function using:
// const rekognition = new aws.Rekognition({region: 'eu-west-1'});

// execute the handler
processImage.handler(event, {}, function(error, result) {
    if (error) {
        console.log("FAILED");
    } else {
        console.log("SUCCESS");
    }
});