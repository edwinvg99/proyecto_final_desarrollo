output "queue_name" {
  description = "Nombre de la Cloudflare Queue (usar como CF_QUEUE_NAME en el .env del server)"
  value       = cloudflare_queue.certificate_notifications.name
}

output "consumer_worker_name" {
  description = "Nombre del Worker consumer desplegado"
  value       = cloudflare_workers_script.certificate_notifier.name
}

output "instruccion_env" {
  description = "Línea lista para pegar en server/.env"
  value       = "CF_QUEUE_NAME=${cloudflare_queue.certificate_notifications.name}"
}
