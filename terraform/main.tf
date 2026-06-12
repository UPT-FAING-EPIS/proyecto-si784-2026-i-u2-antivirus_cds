terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Un bucket S3 simple como ejemplo de infraestructura para alojar instaladores, reportes o logs de RustGuard
resource "aws_s3_bucket" "rustguard_artifacts" {
  bucket = "rustguard-release-artifacts-${var.environment}"

  tags = {
    Name        = "RustGuard Artifacts"
    Environment = var.environment
    Project     = "Antivirus SI784"
  }
}
