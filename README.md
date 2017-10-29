# Welcome

This demo builds upon the [Firehose Rekognition demo](https://github.com/gavincornwell/firehose-rekognition-demo) where events emitted from [Alfresco](https://www.alfresco.com) are sent to AWS [Kinesis Firehose](https://aws.amazon.com/kinesis/firehose). 

Rather than using one large Lambda function to process uploaded images this demo orchestrates several smaller Lambda functions using Step Functions.

# Use Case

The demo uses a fictional use case around an insurance company. As images are uploaded into the system they are sent to Rekognition for analysis, the content type of the image is changed to a [custom type](https://github.com/gavincornwell/firehose-extension/blob/master/firehose-extension-platform-jar/src/main/resources/alfresco/module/firehose-extension-platform-jar/model/content-model.xml), <code>acme:insuranceClaimImage</code>, a unique ID is generated and the <code>acme:claimType</code> property set appropriately. The system recognises Cars, Motorcycles, Boats, Electronics, Jewelry, Wristwatches, Clocks, Bicycles, Sport Equipment and Furniture, anything not recognised has it's <code>acme:claimType</code> property set to "Unknown".

The architecture for this is shown in the diagram below:

![Overview](./diagrams/architecture.png)

# Pre-requisites

To run this demo some familiarality with Alfresco and AWS is presumed.

The [AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) needs to be present, configured with a valid access ID/key and configured to use either the North Virginia (us-east-1), Oregon (us-west-2) or Ireland (eu-west-1) region.

An S3 bucket and an EC2 KeyPair created in the same region in which the demo will be run.

Access to the AWS console.

# Package & Deploy

Run the <code>deploy</code> script passing the name of an S3 bucket to upload the code to, the name of the stack to create and the name of the key pair to use, for example:

```bash
deploy demo-code-deployments my-stack-name my-key-pair
```

After a short while you'll see the stack appear in the AWS [CloudFormation Console](https://console.aws.amazon.com/cloudformation/home), you can track progress of the stack creation there.

Once the stack is complete select the "Outputs" tab (shown in the screenshot below) to see all the information you'll need for accessing the system.

![Outputs](./diagrams/cfn-output.png)

NOTE: It will take about 10 minutes for the Alfresco Repository to be ready for use.

# Demo

Click on the link for the "ShareUrl" key shown in the CloudFormation "Outputs" tab. Login using the values of the "RepoUserName" and "RepoPassword" outputs.

Create a new Site and upload a few pictures, in the example shown below I've chosen an image that contains a car, one that contains a bicycle and the Alfresco logo.

![Uploaded Images](./diagrams/uploaded-files.png)

It will take a couple of minutes for the events to make their way through the Kinesis Firehose stream (it [buffers data](http://docs.aws.amazon.com/firehose/latest/dev/create-configure.html), the minimum interval is 1 minute), get processed by the state machine and prompt the update of the images metadata.

Visit the [Step Functions](https://console.aws.amazon.com/states/home) console and click on the state machine, you should see a list of successful executions. Clicking on an exceution result should show something similiar to the screenshot below:

![State Machine Result](./diagrams/step-function-result.png)

The "Execution Details" on the right side of the console shows information on the execution including the input and output (shown below), this can be really useful for monitoring debugging when things go wrong.

![State Machine Output](./diagrams/step-function-output.png)

The bottom half of the console shows the steps the state machine took and links to the logs of the Lambda functions called during the execution, clicking the link of the <code>ProcessImage</code> function shows an output similar to the one shown below:

![Rekognition Output](./diagrams/rekognition-output.png)

The last step in the state machine is to update the metadata by calling the Alfresco REST API.

Go back to Share, navigate to the folder where you uploaded the images and click on the image containing the car. Examine the properties of the image and you'll see it's type has been changed to <code>acme:insuranceClaimImage</code> as the custom properties are present as shown in the screenshot below:

![Car Properties](./diagrams/properties-car.png)

A unique ID has been generated for the <code>acme:imageId</code> property and the <code>acme:claimType</code> property has been set appropriately.

A similar thing has happened to the image of the bicycle and the logo, the <code>acme:claimType</code> property will be set to "Bicycle" and "Unknown", respectively.

# Troubleshooting

The [AMI used](https://aws.amazon.com/marketplace/pp/B06XHK6MNR?qid=1505364260789&sr=0-2&ref_=srh_res_product_title) by the CloudFormation stack is a 5.2 Enterprise Server, as such a trial license will be generated. Once your stack is over 30 days old the repository will go into read-only mode. If this happens either apply a valid license or re-create the stack.

If you need to SSH to the EC2 instance use <code>centos@&lt;public-ip&gt;</code>. You can get the public-ip from any of the URLs output by the CloudFormation template. Also, remember to use the SSH key selected when creating the stack!

The log files for the Repository and Share are located in <code>/var/log/tomcat-alfresco</code> and <code>/var/log/tomcat-share</code>, respectively. 

To see the events being processed on the repository add the following debug statements to <code>/usr/share/tomcat/shared/classes/alfresco/log4j.properties</code>:

    log4j.logger.org.alfresco.messaging.camel.routes.KinesisFirehoseRouteBuilder=debug
    log4j.logger.org.apache.camel.component.aws=debug
    log4j.logger.com.amazonaws.request=debug

Further configuration (including the name of the target Firehose stream) can be made in <code>/usr/share/tomcat/shared/classes/alfresco-global.properties</code>.

If you make any configuration changes you'll need to restart the Repository or Share Tomcat service, using <code>service tomcat-alfresco restart</code> or <code>service tomcat-share restart</code>, respectively. Note: you'll need to <code>sudo su</code> first.

To check that events are being emitted you can also examine the ActiveMQ admin console using the <code>ActiveMQUrl</code> output by the CloudFormation template. You should see the number highlighted in the screenshot below increasing after activity in Share.

![Events](./diagrams/events.png)

If you're still having problems feel free to raise an [issue](https://github.com/gavincornwell/firehose-step-functions-demo/issues).

# Cleanup

When you're finished with the stack (you will be charged a small amount for the resources it uses) navigate to the CloudFormation console, select the stack you created and choose "Delete Stack" from the "Actions" menu.