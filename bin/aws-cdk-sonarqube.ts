#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { SonarqubeStack } from '../lib/sonarqube-stack';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Create an application instance
const app = new cdk.App();

const awsenvironment = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION };

const VPCstack = new VpcStack(app, 'VPC-stack', {
  env: awsenvironment,
  stackName: `vpcstack`,
  description: `VPC Network stack for SonarQube`,
});

const SonarQubeStack = new SonarqubeStack(app, 'Sonarqube-stack', {
  env: awsenvironment,
  stackName: `sonarqubestack`,
  description: `SonarQube stack`,
});

SonarQubeStack.addDependency(VPCstack);