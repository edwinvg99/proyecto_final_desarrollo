variable "cloudflare_api_token" {
  description = "Token de API de Cloudflare con permisos Workers Scripts + Queue"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "ID de la cuenta de Cloudflare"
  type        = string
}

variable "resend_api_key" {
  description = "API Key de Resend.com para envío de emails desde el Worker"
  type        = string
  sensitive   = true
}

variable "queue_name" {
  description = "Nombre de la Cloudflare Queue"
  type        = string
  default     = "certificate-notifications"
}
