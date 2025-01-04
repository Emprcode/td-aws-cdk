import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";

import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class ServerlessFullstackAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    // Create an S3 bucket to host the React app
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      websiteIndexDocument: "index.html", // Entry point for the React app
      websiteErrorDocument: "index.html", // Handle routing by pointing all errors to index.html
      publicReadAccess: true, // Make the bucket publicly accessible
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS, // Allow bucket-level public access
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Automatically clean up the bucket on stack deletion
      autoDeleteObjects: true, // Delete all objects in the bucket when the stack is deleted
    });

    // Deploy the React app's build folder to the S3 bucket
    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset("./my-app/build")], // Path to the React app's build folder
      destinationBucket: websiteBucket,
    });

    new cdk.CfnOutput(this, "BucketWebsiteURL", {
      value: websiteBucket.bucketWebsiteUrl, // Output the S3 website URL
      description: "URL of the static website hosted on S3",
    });

    // Create DynamoDB table for to-do items
    const todoTable = new dynamodb.Table(this, "TodoTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
