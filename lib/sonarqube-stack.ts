import * as cdk from "aws-cdk-lib";
import {
  Instance,
  InstanceType,
  MachineImage,
  SubnetType,
  SecurityGroup,
  Peer,
  Port,
  Vpc,
  BlockDeviceVolume,
  EbsDeviceVolumeType,
  CfnEIP,
  CfnEIPAssociation,
} from "aws-cdk-lib/aws-ec2";
import { Role, ServicePrincipal, ManagedPolicy } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import path from "path";
import * as fs from "fs";
import { KeyPair } from "cdk-ec2-key-pair";

export class SonarqubeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lookup the existing VPC from VPC stack
    const vpc = Vpc.fromLookup(this, "vpc", {
      vpcName: process.env.VPC_NAME,
    });

    // Create a Security Group for SonarQube
    const securityGroup = new SecurityGroup(this, "sonarqubesg", {
      securityGroupName: `sonarqube-sg`,
      vpc,
      description: "Allow ssh and http access to EC2 instance",
      allowAllOutbound: true,
    });

    // Allow inbound traffic on SSH Port 22 and SonarQube Port 9000
    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(22),
      "Allow SSH access from anywhere"
    );
    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(9000),
      "Allow SonarQube access from anywhere"
    );

    // Create an IAM role for the EC2 instance
    const role = new Role(this, "sonarqubeinstancerole", {
      assumedBy: new ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonEC2ContainerRegistryReadOnly"
        ),
        ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2ReadOnlyAccess"),
      ],
    });

    // Create a new key pair and store it into Secrets Manager
    const key = new KeyPair(this, "mykeypair", {
      keyPairName: `aws-sonarqube-keypair`, 
      storePublicKey: true,
    });
    key.grantReadOnPublicKey(role); // Grant read access to the instance role

    // Define the EC2 instance
    // Root volume is encrypted and Delete on termination flag is disabled
    const instance = new Instance(this, "sonarqubeinstance", {
      vpc,
      instanceType: new InstanceType("t3.medium"),
      machineImage: MachineImage.latestAmazonLinux2023(),
      vpcSubnets: { subnetType: SubnetType.PUBLIC },
      securityGroup,
      role,
      keyName: key.keyPairName,
      blockDevices: [
        {
          deviceName: "/dev/xvda", // Root volume
          volume: BlockDeviceVolume.ebs(30, {
            encrypted: true,
            deleteOnTermination: false,
            volumeType: EbsDeviceVolumeType.GP3,
          }),
        },
      ],
    });

    // Create a Elastic IP
    const eip = new CfnEIP(this, "eip");

    // Output the Elastic IP address
    new cdk.CfnOutput(this, "ElasticIPAddress", { value: eip.ref, description: "Elastic IP Address of SonarQube Server" });

    // Associate the Elastic IP with the EC2 instance
    new CfnEIPAssociation(this, "eipassociation", {
      eip: eip.ref,
      instanceId: instance.instanceId,
    });

    // Path to the docker-compose file
    const dockerComposePath = path.resolve(__dirname, "docker-compose.yml");

    // Read the docker-compose file content and encode it in Base64
    const dockerComposeContent = fs.readFileSync(dockerComposePath, "utf8");
    const dockerComposeBase64 =
      Buffer.from(dockerComposeContent).toString("base64");

    // Add User Data to install Docker, Docker Compose, and run Docker Compose
    instance.addUserData(
      `#!/bin/bash
      dnf update -y
      dnf install -y docker
      systemctl start docker
      systemctl enable docker
      usermod -aG docker ec2-user

      # Install Docker Compose
      curl -L "https://github.com/docker/compose/releases/download/v2.17.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
      chmod +x /usr/local/bin/docker-compose

      echo "vm.max_map_count=262144" >> /etc/sysctl.conf
      echo "fs.file-max=65536" >> /etc/sysctl.conf
      sudo sysctl -p
      sudo usermod -aG docker $USER

      # Decode the Base64 encoded docker-compose.yml content and write it to a file
      echo "${dockerComposeBase64}" | base64 --decode > /home/ec2-user/docker-compose.yml
      chown ec2-user:ec2-user /home/ec2-user/docker-compose.yml

      # Run Docker Compose
      cd /home/ec2-user
      docker-compose up -d
      `
    );
  }
}
