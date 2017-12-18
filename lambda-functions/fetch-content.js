'use strict';

const AWS = require('aws-sdk');
AWS.config.update({
    region: process.env.AWS_REGION
});

const http = require('http');

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

exports.handler = (event, context, callback) => {
    
    console.log("Recieved event: " + JSON.stringify(event, null, 2));
    
    var s3Bucket = process.env.CONTENT_BUCKET;
    
    // grab the node id
    var nodeId = event.nodeId
    console.log("nodeId: " + nodeId);

    // grab the REPO_HOST, PASSWORD and CONTENT_BUCKET
    var repoHost = process.env.REPO_HOST;
    var repoPwd = process.env.REPO_PASSWORD;
    var bucket = process.env.CONTENT_BUCKET;

    // get the content using REPO_URL
    var nodePath = "/alfresco/api/-default-/public/alfresco/versions/1/nodes/" + nodeId + "/content";
    console.log("Retrieving content from: " + repoHost + nodePath);

    var options = {
        hostname: repoHost,
        path: nodePath,
        auth: "admin:" + repoPwd
    };

    const request = http.request(options, function (response) {
        var bytes = [];
        response.on('data', function (chunk) {
            bytes.push(chunk);
        });

        response.on('end', function () {
            console.log('Retrieved content with status: ' + response.statusCode);

            var params = {
                Body: Buffer.concat(bytes), 
                Bucket: bucket, 
                Key: nodeId
            };

            console.log("Putting object into bucket: " + params.Bucket + "...");

            s3.putObject(params, function(error, data) {
                if (error) 
                {
                    const message = `Error putting object into bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
                    console.log(message);
                    callback(message);
                }
                else
                {
                    console.log("Successfully stored content");

                    // determine content type
                    var isImage = true;
                    if (event.name.endsWith(".txt"))
                    {
                        isImage = false;
                    }

                    var result = {
                        alfrescoEvent: event,
                        s3Bucket: bucket,
                        s3Key: nodeId,
                        isImage: isImage
                    }

                    console.log("Returning result: " + JSON.stringify(result, null, 2));
                    callback(null, result);
                }
            });
        });
    });

    // content request error handler
    request.on('error', function (err) {
        callback(err);
    });

    // make the remote call to get the content
    request.end();
};