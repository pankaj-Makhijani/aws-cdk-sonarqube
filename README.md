# AWS CDK SonarQube Setup

This repository provides a streamlined approach to deploying SonarQube on AWS using AWS Cloud Development Kit (CDK) and Docker. SonarQube is an open-source tool for continuous inspection of code quality and security, making it a vital part of any CI/CD pipeline.

## Features

- **Automated Deployment**: Simplifies the setup of SonarQube on an AWS EC2 instance using AWS CDK.
- **Docker Integration**: Utilizes Docker and Docker Compose for managing SonarQube and PostgreSQL containers.
- **Secure Infrastructure**: Sets up a secure VPC, public subnet, security groups, and an IAM role.
- **Elastic IP**: Provides a static IP for consistent access to the SonarQube server.
- **Persistent Storage**: Ensures data persistence across container restarts using Docker volumes.
- **Easy Configuration**: Allows customization through environment variables and straightforward CDK code.

## Prerequisites

Before deploying the stack, ensure you have the following:

- An active AWS account.
- AWS CLI installed and configured.
- Node.js installed.
- AWS CDK installed globally (`npm install -g aws-cdk`).

## Quick Start

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/aws-cdk-sonarqube.git
   cd aws-cdk-sonarqube

   ```

2. **Install the necessary libraries:**

```bash
npm install
```

3. **Configure environment variables**
   <br>Update the CDK environment variables in .env file with your AWS account details:

```bash
CDK_DEFAULT_ACCOUNT=your_account_id
CDK_DEFAULT_REGION=your_region
VPC_NAME=sonarqube-vpc
```

4. **Deploy the stack**
   <br>Bootstrap the CDK environment:

```bash
cdk bootstrap
```

<br>Deploy the VPC stack:

```bash
cdk synth VPC-stack
cdk deploy VPC-stack
```

<br>Deploy the SonarQube stack:

```bash
cdk synth Sonarqube-stack
cdk deploy Sonarqube-stack
```

5. **Access SonarQube:**
<br>Copy the Elastic IP address from the output of the Sonarqube-stack deployment and navigate to http://<ELASTIC_IP>:9000. Use the default credentials (username: admin, password: admin) to log in.

## Explaination
Please refer [this](https://itzzpankaj004.medium.com/how-to-set-up-sonarqube-on-aws-cloud-in-minutes-with-aws-cdk-0d3e849d8dfa) Blog for more detailed information about the CDK script

## Contribution
Contributions are welcome! Please fork this repository and submit a pull request for any enhancements or bug fixes.
