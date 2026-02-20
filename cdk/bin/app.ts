#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ZarketplaceStack } from '../lib/zarketplace-stack';

const app = new cdk.App();

new ZarketplaceStack(app, 'ZarketplaceStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-northeast-2',
  },
});
