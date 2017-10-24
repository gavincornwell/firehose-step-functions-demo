'use strict';

const AWS = require('aws-sdk');

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const stepFunctions = new AWS.StepFunctions();

exports.handler = (event, context, callback) => {
    
    console.log('Received S3 event:', JSON.stringify(event, null, 2));

    // Get the object from the event and show its content type
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key,
    };
    s3.getObject(params, (err, data) => {
        if (err) {
            const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
            console.log(message);
            callback(message);
        } else {
                
            var s3FileContent = data.Body.toString('utf8');
            console.log("S3 file content: " + s3FileContent);
        
            // the last element is empty due to trailing line feed so remove
            var allEvents = s3FileContent.split("\n");
            var alfrescoEvents = allEvents.slice(0, allEvents.length-1);
            console.log("alfrescoEvents: " + alfrescoEvents);
            console.log("Number of events: " + alfrescoEvents.length);
            var eventIndex = 0, successfulEvents = 0, failedEvents = 0;

            var processCallback = function(error, result) {
                // adjust counters
                if (error) {
                    failedEvents++;
                    console.log("Error: " + error);
                } else {
                    successfulEvents++;
                }
                
                eventIndex++;
                
                if (eventIndex < alfrescoEvents.length) {
                    // process the next event
                    processAlfrescoEvent(alfrescoEvents[eventIndex], processCallback);
                } else {
                    // output processing results and call main callback
                    const message = `Processed ${alfrescoEvents.length} events, ${successfulEvents} succeeded, ${failedEvents} failed.`;
                    console.log(message);
                    callback(null, message);
                }
            };
            
            // process the first event string
            processAlfrescoEvent(alfrescoEvents[eventIndex], processCallback);
        }
    });
};

var processAlfrescoEvent = function(alfEventString, callback) {

    var stateMachine = process.env.STEP_FUNCTION;
    console.log("Starting execution of state machine: " + stateMachine);

    var stateExecutionId = Date.now() + "-" + Math.floor((Math.random() * 1000) + 1);

    var params = {
      stateMachineArn: stateMachine,
      input: alfEventString,
      name: stateExecutionId
    };
    
    stepFunctions.startExecution(params, function (err, data) {
        if (err)
        {
            console.log("Failed to start state machine execution: " + err.message);
            callback(err);
        }
        else
        {
            const message = `Successfully started state machine execution for ${data.executionArn}`;
            console.log(message);
            callback(null, message);
        }
    });
};