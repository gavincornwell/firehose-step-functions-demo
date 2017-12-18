'use strict';

// set the region
process.env.AWS_REGION = 'us-west-2';

let fetchContent = require('./fetch-content.js');

// TODO: Add a recent alfresco event object here (needs to refer to nodes present in the repository)
var alfrescoEvent = {};

// run the tests
console.log("Running test...");

// TODO: Add the public IP/host name and password of the repository and bucket name
process.env.REPO_HOST = "";
process.env.REPO_PASSWORD = "";
process.env.CONTENT_BUCKET = "";

// execute the handler
fetchContent.handler(alfrescoEvent, {}, function(error, result) {
    if (error) {
        console.log("FAILED");
    } else {
        console.log("SUCCESS");
    }
});