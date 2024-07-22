import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Vpc, SubnetType } from "aws-cdk-lib/aws-ec2";
import * as dotenv from 'dotenv';
import path from "path";
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export class VpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Creating a VPC with 1 AZ and 1 Public Subnet
    new Vpc(this, "vpc", {
      vpcName: process.env.VPC_NAME,
      maxAzs: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "public-subnet",
          subnetType: SubnetType.PUBLIC,
        },
      ],
    });
  }
}
