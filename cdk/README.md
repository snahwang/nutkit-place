# Zarketplace CDK (app account)

This folder provisions minimal AWS infrastructure for Zarketplace (early-stage, low-cost):

- VPC (public-only)
- Internet-facing ALB (HTTP :80)
- EC2 instance (t3.micro) with SSM enabled
- DynamoDB table `zigbang-ai-tools` (PAY_PER_REQUEST) + `GSI1`

HTTPS (443) is intentionally **not** created in CDK because ACM attachment will be done manually.

## Prereqs

- AWS CLI configured for the **app account**
- Node.js

## Install

```bash
cd cdk
npm ci
npm run build
```

## Bootstrap (once per account/region)

```bash
npx cdk bootstrap aws://<ACCOUNT_ID>/ap-northeast-2
```

## Deploy

```bash
npx cdk deploy
```

After deploy, note these outputs:

- `AlbDnsName`
- `AlbArn`
- `TargetGroupArn`
- `InstanceId`
- `TableName`

## Manual steps after CDK

### 1) Route53 (domain account)

Create an Alias record to the ALB DNS name.

### 2) HTTPS (ACM)

In the AWS Console:

- EC2 → Load Balancers → select `zarketplace-alb`
- Add listener: **HTTPS :443**
- Attach your existing **ACM certificate**
- Forward to target group `zarketplace-tg` (or use `TargetGroupArn`)

Security Group already allows inbound 443 from `0.0.0.0/0`.

### 3) Deploy the app to EC2

This CDK stack only provisions the instance. You can deploy the app manually using Docker Compose.

High-level steps (example):

1. Connect via SSM Session Manager (no SSH required)
2. Install git (if needed)
3. Pull your repo or copy artifacts
4. Create a `.env` (do **not** commit)
5. Run:

```bash
# Example; adjust to your deployment approach
sg docker -c 'docker compose up -d --build'
```

The ALB expects the app to listen on port **3000** and respond `200` on `/health`.
