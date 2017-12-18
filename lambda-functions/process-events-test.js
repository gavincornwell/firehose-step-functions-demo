'use strict';

// set the region
process.env.AWS_REGION = 'us-west-2';

let processEvents = require('./process-events.js');

// TODO: Add a recent S3 event object here (needs to refer to nodes present in the repository)
var s3Event = {};

// run the tests
console.log("Running test...");

// TODO: Add the step function ARN
process.env.STEP_FUNCTION = "";

// execute the handler
processEvents.handler(s3Event, {}, function(error, result) {
    if (error) {
        console.log("FAILED: " + error);
    } else {
        console.log("SUCCESS: " + result);
    }
});