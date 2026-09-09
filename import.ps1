$json = Get-Content -Raw -Path "C:\Rashidi traders kuwait\import_data_2.json"

$loginBody = @{
    username = 'evolixstudio@gmail.com'
    password = 'Qusai5253'
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"

$token = $loginRes.access_token
Write-Host "Got token, now importing data..."

$headers = @{
    "Authorization" = "Bearer $token"
}

$restoreRes = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/backup/restore-json" -Method Post -Headers $headers -Body $json -ContentType "application/json"

Write-Host "Restore response:"
$restoreRes | ConvertTo-Json -Depth 10
