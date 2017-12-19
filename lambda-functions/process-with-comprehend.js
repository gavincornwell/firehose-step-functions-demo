'use strict';

const AWS = require('aws-sdk');
AWS.config.update({
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const comprehend = new AWS.Comprehend();

exports.handler = (event, context, callback) => {
    
    console.log("Received event: " + JSON.stringify(event, null, 2));

    // get text content from S3
    const s3Params = {
        Bucket: event.s3Bucket,
        Key: event.s3Key,
    };
    s3.getObject(s3Params, (error, data) => {
        if (error) 
        {
            console.log("Failed to retrieve content from S3: " + error.message);
            callback(error);
        } 
        else 
        {
            console.log("Successfully retrieved content from: s3://" + event.s3Bucket + "/" + event.s3Key);

            // call the comprehend API to get suggested categories
            var comprehendParams = {
                Text: "" + data.Body,
                LanguageCode: "en"
            };

            console.log("Analyzing text for entities...");
            comprehend.detectEntities(comprehendParams, function(error, data) {
                if (error) 
                {
                    console.log("Failed to detect entities: " + error.message);
                    callback(error);
                } 
                else 
                {
                    console.log("Successfully analysed entities: " + JSON.stringify(data, null, 2));
                    
                    // look for people, dates and locations
                    var location, insured, visitDate = null;
                    var entities = data.Entities;
                    for (var idx = 0; idx < entities.length; idx++) {
                        var entity = entities[idx];
                        if (entity.Type === "LOCATION" && entity.Score > 0.75)
                        {
                            location = entity.Text;
                        }
                        else if (entity.Type === "DATE" && entity.Score > 0.75)
                        {
                            var dateString = entity.Text;
                            var timestamp = Date.parse(dateString);
                            if (typeof timestamp === "number")
                            {
                                visitDate = new Date(timestamp).toISOString();
                            }
                        }
                        else if (entity.Type === "PERSON" && entity.Score > 0.75)
                        {
                            insured = entity.Text
                        }
                    }

                    // update body appropriately
                    var updateBody = {
                        nodeType: "acme:insuranceClaimReport",
                        properties: {
                            "acme:reportId": Date.now()
                        }
                    };

                    // add any entities found
                    if (insured)
                    {
                        updateBody.properties["acme:claimAdjuster"] = insured;
                    }
                    if (location)
                    {
                        updateBody.properties["acme:visitLocation"] = location;
                    }
                    if (visitDate)
                    {
                        updateBody.properties["acme:visitDate"] = visitDate;
                    }

                    console.log("Analyzing text for sentiment...");
                    comprehend.detectSentiment(comprehendParams, function(error, data) {
                        if (error) 
                        {
                            console.log("Failed to detect sentiment: " + error.message);
                            callback(error);
                        } 
                        else 
                        {
                            console.log("Successfully analysed sentiment: " + JSON.stringify(data, null, 2));

                            // set the needsInvestigation flag according to sentiment
                            var needsInvestigation = false;
                            if (data.SentimentScore.Negative > data.SentimentScore.Positive)
                            {
                                needsInvestigation = true;
                            }
                            updateBody.properties["acme:visitFollowUp"] = needsInvestigation;

                            var result = {
                                alfrescoEvent: event.alfrescoEvent,
                                s3Bucket: event.s3Bucket,
                                s3Key: event.s3Key,
                                isImage: event.isImage,
                                metadata: updateBody
                            }

                            console.log("Returning result: " + JSON.stringify(result, null, 2));
                            callback(null, result);
                        }
                    });
                }
            });
        }
    });
};