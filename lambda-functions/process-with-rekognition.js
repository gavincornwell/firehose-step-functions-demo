'use strict';

const AWS = require('aws-sdk');

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const rekognition = new AWS.Rekognition();

exports.handler = (event, context, callback) => {
    
    console.log("Recieved event: " + JSON.stringify(event, null, 2));
    
    // call the rekognition API to get suggested labels using bytes of image
    var params = {
        Image: {
            S3Object: {
                Bucket: event.s3Bucket,
                Name: event.s3Key
            }
        },
        MaxLabels: 10,
        MinConfidence: 75
    };

    console.log("Analysing image...");
    rekognition.detectLabels(params, function(error, data) {
        if (error) 
        {
            console.log("Failed to detect labels: " + error.message);
            callback(error);
        } 
        else 
        {
            console.log("Successfully analysed image: " + JSON.stringify(data, null, 2));
            
            // iterate through labels to identify
            var imageType = "Unknown";
            var imageTypeDetected, label;
            var labels = data.Labels;
            for (var idx = 0; idx < labels.length; idx++) {
                imageTypeDetected = false;
                label = labels[idx];

                switch (label.Name) {
                    case "Car":
                        imageType = "Car";
                        imageTypeDetected = true;
                        break;
                    case "Motorcycle":
                        imageType = "Motorcycle";
                        imageTypeDetected = true;
                        break;
                    case "Boat":
                        imageType = "Boat";
                        imageTypeDetected = true;
                        break;
                    case "Electronics":
                        imageType = "Electronics";
                        imageTypeDetected = true;
                        break;
                    case "Jewelry":
                        imageType = "Jewelry";
                        imageTypeDetected = true;
                        break;
                    case "Wristwatch":
                        imageType = "Wristwatch";
                        imageTypeDetected = true;
                        break;
                    case "Clock":
                        imageType = "Clock";
                        imageTypeDetected = true;
                        break;
                    case "Bicycle":
                        imageType = "Bicycle";
                        imageTypeDetected = true;
                        break;
                    case "Sport":
                        imageType = "Sport";
                        imageTypeDetected = true;
                        break;
                    case "Furniture":
                        imageType = "Furniture";
                        imageTypeDetected = true;
                        break;
                    default:
                        imageType = "Unknown";
                }

                // break if the image has been identified
                if (imageTypeDetected) {
                    break;
                }
            }

            // update body appropriately
            var updateBody = {
                nodeType: "acme:insuranceClaimImage",
                properties: {
                    "acme:imageId": Date.now(),
                    "acme:claimType": imageType
                }
            };

            var result = {
                alfrescoEvent: event.alfrescoEvent,
                s3Bucket: event.s3Bucket,
                s3Key: event.s3Key,
                metadata: updateBody
            }

            console.log("Returning result: " + JSON.stringify(result, null, 2));
            callback(null, result);
        }
    });
};