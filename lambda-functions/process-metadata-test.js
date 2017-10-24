'use strict';

let processMetadata = require('./process-metadata.js');

// TODO: Add a recent event object here (needs to refer to nodes present in the repository)
var event = {};

// run the tests
console.log("Running test...");

// TODO: Add the public IP/host name and password of the repository
process.env.REPO_HOST = "";
process.env.REPO_PASSWORD = "";

// execute the handler
processMetadata.handler(event, {}, function(error, result) {
    if (error) {
        console.log("FAILED");
    } else {
        console.log("SUCCESS");
    }
});