# Sheikha Cloud — Terraform Root Module
# Infrastructure as Code for Sovereign Multi-Cloud deployment

terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }
    vault = {
      source  = "hashicorp/vault"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    # Stored in Sheikha sovereign object storage (MinIO-compatible)
    bucket = "sheikha-tfstate"
    key    = "cloud/terraform.tfstate"
    region = "me-south-1"
    # Encryption enforced at rest via Vault KMS
    encrypt = true
  }
}

# ── Variables ─────────────────────────────────────────────────────────────────
variable "environment" {
  description = "Deployment environment (production | staging | development)"
  type        = string
  default     = "production"
  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be production, staging, or development."
  }
}

variable "primary_region" {
  description = "Primary sovereign region identifier"
  type        = string
  default     = "ruh-riyadh"
}

variable "enabled_regions" {
  description = "List of sovereign region IDs to provision"
  type        = list(string)
  default     = ["ruh-riyadh", "ist-istanbul", "cai-cairo", "kul-kualalumpur"]
}

variable "vault_address" {
  description = "HashiCorp Vault cluster address"
  type        = string
  sensitive   = true
}

variable "sovereign_domains" {
  description = "Base domain for Sheikha Cloud services"
  type        = string
  default     = "sheikha.cloud"
}

# ── Locals ────────────────────────────────────────────────────────────────────
locals {
  common_tags = {
    Project     = "sheikha-cloud"
    Environment = var.environment
    ManagedBy   = "terraform"
    Owner       = "sheikha-consortium"
    Compliance  = "SCSF-1.0"
  }
}

# ── Vault Provider (secrets management) ───────────────────────────────────────
provider "vault" {
  address = var.vault_address
  # Auth via Kubernetes service-account token (OIDC)
}

# ── Data: read secrets from Vault ─────────────────────────────────────────────
data "vault_generic_secret" "aws_credentials" {
  path = "secret/sheikha-cloud/aws"
}

data "vault_generic_secret" "azure_credentials" {
  path = "secret/sheikha-cloud/azure"
}

# ── AWS Provider (GovCloud / Middle East) ─────────────────────────────────────
provider "aws" {
  region     = "me-south-1"
  access_key = data.vault_generic_secret.aws_credentials.data["access_key"]
  secret_key = data.vault_generic_secret.aws_credentials.data["secret_key"]
}

# ── Azure Provider ─────────────────────────────────────────────────────────────
provider "azurerm" {
  features {}
  subscription_id = data.vault_generic_secret.azure_credentials.data["subscription_id"]
  client_id       = data.vault_generic_secret.azure_credentials.data["client_id"]
  client_secret   = data.vault_generic_secret.azure_credentials.data["client_secret"]
  tenant_id       = data.vault_generic_secret.azure_credentials.data["tenant_id"]
}

# ── Modules ────────────────────────────────────────────────────────────────────

module "vpc_riyadh" {
  source          = "./modules/vpc"
  region_id       = "ruh-riyadh"
  cidr_block      = "10.0.0.0/16"
  az_count        = 3
  environment     = var.environment
  common_tags     = local.common_tags
}

module "kubernetes_riyadh" {
  source          = "./modules/kubernetes"
  region_id       = "ruh-riyadh"
  vpc_id          = module.vpc_riyadh.vpc_id
  subnet_ids      = module.vpc_riyadh.private_subnet_ids
  node_groups     = {
    system = { min = 3, max = 10, instance_type = "m6i.2xlarge" }
    ai     = { min = 2, max = 20, instance_type = "g5.4xlarge" }
    data   = { min = 3, max = 15, instance_type = "r6i.4xlarge" }
  }
  environment     = var.environment
  common_tags     = local.common_tags
}

module "object_storage" {
  source          = "./modules/storage"
  region_id       = var.primary_region
  encryption_key  = "sheikha-kms-sovereign"
  versioning      = true
  replication     = var.enabled_regions
  common_tags     = local.common_tags
}

module "database_cockroachdb" {
  source              = "./modules/database"
  engine              = "cockroachdb"
  version             = "23.2"
  regions             = var.enabled_regions
  node_count_per_az   = 3
  instance_type       = "db.r6i.4xlarge"
  encryption_at_rest  = true
  common_tags         = local.common_tags
}

module "vault_cluster" {
  source          = "./modules/vault"
  region_id       = var.primary_region
  cluster_size    = 5
  hsm_integration = true
  audit_backend   = "file+syslog"
  common_tags     = local.common_tags
}

# ── Outputs ────────────────────────────────────────────────────────────────────
output "kubernetes_endpoints" {
  description = "Kubernetes API server endpoints per region"
  value       = {
    riyadh = module.kubernetes_riyadh.api_endpoint
  }
  sensitive = true
}

output "vault_endpoint" {
  description = "Vault cluster address"
  value       = module.vault_cluster.endpoint
  sensitive   = true
}
