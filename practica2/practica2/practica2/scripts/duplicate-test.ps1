# Duplicate reservation test using same idempotency key
# Usage: Open PowerShell and run: .\duplicate-test.ps1 -Url 'http://localhost:3000/gateway/reservations' -Iterations 2
param(
  [string]$Url = 'http://localhost:3000/gateway/reservations',
  [int]$Iterations = 2
)

$uuid = [guid]::NewGuid().ToString()
Write-Host "Using idempotency key: $uuid"
$body = @{ espacioId = '1'; fecha = '2025-10-20' } | ConvertTo-Json

for ($i = 1; $i -le $Iterations; $i++) {
  Write-Host "Request #$i"
  try {
    $resp = Invoke-RestMethod -Method Post -Uri $Url -Body $body -ContentType 'application/json' -Headers @{ 'x-idempotency-key' = $uuid }
    Write-Host "Response: " ($resp | ConvertTo-Json -Depth 3)
  } catch {
    Write-Host "Error: $_"
  }
}

Write-Host "Done. Check spaces-service logs to confirm only one application."