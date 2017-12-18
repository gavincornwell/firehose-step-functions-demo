'use strict';

const AWS = require('aws-sdk');
AWS.config.update({
    region: process.env.AWS_REGION
});

const http = require('http');

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

exports.handler = (event, context, callback) => {
    
    console.log("Recieved event: " + JSON.stringify(event, null, 2));
    
    // grab the node id
    var nodeId = event.alfrescoEvent.nodeId;
    console.log("nodeId: " + nodeId);

    // grab the REPO_HOST, PASSWORD and CONTENT_BUCKET
    var repoHost = process.env.REPO_HOST;
    var repoPwd = process.env.REPO_PASSWORD;

    // call the REST API to set metadata appropriately
    var nodeInfoPath = "/alfresco/api/-default-/public/alfresco/versions/1/nodes/" + nodeId;
    var options = {
        hostname: repoHost,
        path: nodeInfoPath,
        method: "PUT",
        auth: "admin:" + repoPwd,
        headers: {
            "Content-Type": "application/json"
        }
    };
    
    // define the update request
    const updateRequest = http.request(options, function (updateResponse) {
        var bytes = [];
        updateResponse.on('data', function (chunk) {
            bytes.push(chunk);
        });

        updateResponse.on('end', function () {
            console.log("Successfully updated image with status: " + updateResponse.statusCode);
            var result = {
                alfrescoEvent: event.alfrescoEvent,
                s3Bucket: event.s3Bucket,
                s3Key: event.s3Key,
                isImage: event.isImage,
                metadata: event.metadata
            }

            console.log("Returning result: " + JSON.stringify(result, null, 2));
            callback(null, result);
        });
    });
    
    // update request error handler
    updateRequest.on('error', function (err) {
        console.log("Failed to update image: " + err);
        callback(err);
    });

    // execute the update request
    var updateBodyString = JSON.stringify(event.metadata);
    console.log("Updating node '" + nodeId + "' with: " + updateBodyString);
    updateRequest.write(updateBodyString);
    updateRequest.end();
};