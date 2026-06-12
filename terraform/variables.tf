variable "aws_region" {
  description = "La region de AWS donde se creara la infraestructura"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "El entorno de despliegue (ej. dev, prod)"
  type        = string
  default     = "dev"
}
