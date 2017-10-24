# Welcome

This demo builds upon the [Firehose Rekognition demo](https://github.com/gavincornwell/firehose-rekognition-demo) where events emitted from Alfresco are sent to AWS Kinesis Firehose. 

Rather than using one large Lambda function to process uploaded images this demo orchestrates several smaller Lambda functions using Step Functions.