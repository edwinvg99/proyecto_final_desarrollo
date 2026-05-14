terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# ── 1. Cloudflare Queue ────────────────────────────────────────
resource "cloudflare_queue" "certificate_notifications" {
  account_id = var.cloudflare_account_id
  name       = var.queue_name
}

# ── 2. Worker Consumer: certificate-notifier ───────────────────
resource "cloudflare_workers_script" "certificate_notifier" {
  account_id = var.cloudflare_account_id
  name       = "certificate-notifier"
  content    = file("${path.module}/../workers/certificate-notifier.js")
  module     = true

  # Secret: API key de Resend
  secret_text_binding {
    name = "RESEND_API_KEY"
    text = var.resend_api_key
  }

  depends_on = [cloudflare_queue.certificate_notifications]
}

# ── 3. Registrar el Worker como Consumer de la Queue ──────────
# cloudflare_queue_consumer no existe en provider v4 — se usa
# null_resource + PowerShell para llamar la API REST de Cloudflare.
resource "null_resource" "register_queue_consumer" {
  triggers = {
    queue_name  = cloudflare_queue.certificate_notifications.name
    script_name = cloudflare_workers_script.certificate_notifier.name
  }

  provisioner "local-exec" {
    interpreter = ["PowerShell", "-Command"]
    command     = <<-EOT
      $headers = @{
        "Authorization" = "Bearer ${var.cloudflare_api_token}"
        "Content-Type"  = "application/json"
      }
      $body = '{"script_name":"${cloudflare_workers_script.certificate_notifier.name}","environment":"production","settings":{"batch_size":10,"max_retries":3,"max_wait_time_ms":5000}}'
      $response = Invoke-RestMethod `
        -Uri "https://api.cloudflare.com/client/v4/accounts/${var.cloudflare_account_id}/queues/${cloudflare_queue.certificate_notifications.name}/consumers" `
        -Method POST `
        -Headers $headers `
        -Body $body
      Write-Host "Consumer registrado: $($response | ConvertTo-Json)"
    EOT
  }

  depends_on = [
    cloudflare_queue.certificate_notifications,
    cloudflare_workers_script.certificate_notifier,
  ]
}
