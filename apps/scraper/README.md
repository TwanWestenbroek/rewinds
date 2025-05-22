# Scraper Lambda

A serverless AWS Lambda application written in TypeScript using the Serverless Framework.

## Prerequisites

- Node.js (v18 or later)
- pnpm (v8 or later)
- AWS CLI configured with appropriate credentials
- Terraform CLI

## Installation

1. Install dependencies:

```bash
pnpm install
```

2. Build the TypeScript code:

```bash
pnpm build
```

## Local Development

To run the application locally using serverless-offline:

```bash
pnpm start
```

The function will be available at `http://localhost:4000/scrape`.

## Deployment

### Using Serverless Framework

1. Deploy to a specific region:

```bash
# Deploy to EU (Amsterdam)
pnpm deploy --region eu-central-1

# Deploy to US East
pnpm deploy --region us-east-1
```

### Using Terraform

1. Navigate to the infrastructure directory:

```bash
cd infrastructure
```

2. Initialize Terraform:

```bash
terraform init
```

3. Review the planned changes for a specific region:

```bash
# For EU (Amsterdam)
terraform plan -var="aws_region=eu-central-1"

# For US East
terraform plan -var="aws_region=us-east-1"
```

4. Apply the infrastructure for a specific region:

```bash
# For EU (Amsterdam)
terraform apply -var="aws_region=eu-central-1"

# For US East
terraform apply -var="aws_region=us-east-1"
```

## Multi-Region Deployment

The infrastructure is designed to support multi-region deployment. The primary region is set to `eu-central-1` (Frankfurt, closest to Amsterdam) by default, but you can deploy to any AWS region by specifying the `aws_region` variable.

To deploy to multiple regions, run the Terraform commands for each region separately:

```bash
# Deploy to EU (Amsterdam)
terraform apply -var="aws_region=eu-central-1"

# Deploy to US East
terraform apply -var="aws_region=us-east-1"
```

## Project Structure

```
.
├── src/
│   └── handler.ts         # Lambda function handler
├── infrastructure/
│   ├── main.tf           # Main Terraform configuration
│   ├── provider.tf       # AWS provider configuration
│   ├── variables.tf      # Terraform variables
│   └── outputs.tf        # Terraform outputs
├── package.json          # Project dependencies and scripts
├── serverless.yml        # Serverless Framework configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Available Scripts

- `pnpm start`: Run the application locally using serverless-offline
- `pnpm build`: Compile TypeScript code
- `pnpm deploy`: Deploy the application using Serverless Framework
