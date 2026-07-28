# SFCC DNS propagation checker
$ProgressPreference = 'SilentlyContinue'

Write-Host "=== SFCC DNS propagation check ===" -ForegroundColor Cyan
Write-Host ""

# 1. Local DNS resolver
$dns = Resolve-DnsName "test-salesforcecommerce.cloud" -Type A -ErrorAction SilentlyContinue
$dnsIPs = $dns | Where-Object { $_.IPAddress -match "^\d" } | Select-Object -ExpandProperty IPAddress -Unique
if ($dnsIPs) {
    foreach ($ip in $dnsIPs) {
        if ($ip -eq "2.57.91.91") {
            Write-Host "  [OK]   DNS local apunta a tu VPS: $ip" -ForegroundColor Green
        } else {
            Write-Host "  [WAIT] DNS local apunta a: $ip (todavia no propaga)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  [ERR]  DNS local sin respuesta" -ForegroundColor Red
}

# 2. NS records
$ns = Resolve-DnsName "test-salesforcecommerce.cloud" -Type NS -ErrorAction SilentlyContinue
if ($ns) {
    Write-Host ""
    Write-Host "  Nameservers:"
    $ns | ForEach-Object {
        if ($_.NameHost -match "hostinger") {
            Write-Host "    [OK]   $($_.NameHost)" -ForegroundColor Green
        } else {
            Write-Host "    [WAIT] $($_.NameHost) (todavia parking?)" -ForegroundColor Yellow
        }
    }
}

# 3. DNS Google
Write-Host ""
try {
    $g = Invoke-RestMethod -Uri "https://dns.google/resolve?name=test-salesforcecommerce.cloud&type=A" -TimeoutSec 8
    if ($g.Answer) {
        foreach ($ans in $g.Answer) {
            if ($ans.data -eq "2.57.91.91") {
                Write-Host "  [OK]   Google DNS: $($ans.data)" -ForegroundColor Green
            } else {
                Write-Host "  [WAIT] Google DNS: $($ans.data)" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "  [ERR]  Google DNS sin respuesta" -ForegroundColor Red
    }
} catch {
    Write-Host "  [ERR]  Google DNS error: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. DNS Cloudflare
Write-Host ""
try {
    $cf = Invoke-RestMethod -Uri "https://cloudflare-dns.com/dns-query?name=test-salesforcecommerce.cloud&type=A" -Headers @{"Accept"="application/dns-json"} -TimeoutSec 8
    if ($cf.Answer) {
        foreach ($ans in $cf.Answer) {
            if ($ans.data -eq "2.57.91.91") {
                Write-Host "  [OK]   Cloudflare DNS: $($ans.data)" -ForegroundColor Green
            } else {
                Write-Host "  [WAIT] Cloudflare DNS: $($ans.data)" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "  [ERR]  Cloudflare DNS sin respuesta" -ForegroundColor Red
    }
} catch {
    Write-Host "  [ERR]  Cloudflare DNS error: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. HTTP connectivity
Write-Host ""
try {
    $r = Invoke-WebRequest -Uri "http://test-salesforcecommerce.cloud/" -Method Head -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  [OK]   HTTP: $($r.StatusCode) - Server: $($r.Headers['Server'])" -ForegroundColor Green
} catch {
    Write-Host "  [WAIT] HTTP: aun no responde (timeout/error)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Cuando veas [OK] en todas las lineas, la propagacion esta completa." -ForegroundColor Cyan
