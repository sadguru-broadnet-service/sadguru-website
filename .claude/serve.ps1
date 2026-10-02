param([int]$Port = 8080, [string]$Root = "J:\Claude Code\Sadguru-Networks")
$mime = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='application/javascript; charset=utf-8';
  '.png'='image/png'; '.jpg'='image/jpeg'; '.svg'='image/svg+xml'; '.webmanifest'='application/manifest+json';
  '.xml'='application/xml'; '.txt'='text/plain'; '.ico'='image/x-icon'; '.woff2'='font/woff2' }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Host "Serving $Root on http://localhost:$Port/"
while ($l.IsListening) {
  $ctx = $l.GetContext(); $req = $ctx.Request; $res = $ctx.Response
  try {
    $path = [Uri]::UnescapeDataString($req.Url.AbsolutePath)
    if ($req.HttpMethod -eq 'POST') { $res.StatusCode = 200; $b=[Text.Encoding]::UTF8.GetBytes('ok'); $res.OutputStream.Write($b,0,$b.Length); Write-Host "POST $path"; $res.Close(); continue }
    if ($path.EndsWith('/')) { $path += 'index.html' }
    $file = Join-Path $Root ($path.TrimStart('/') -replace '/', '\')
    if (Test-Path $file -PathType Leaf) {
      $ext = [IO.Path]::GetExtension($file).ToLower()
      $res.ContentType = if ($mime[$ext]) { $mime[$ext] } else { 'application/octet-stream' }
      $res.Headers.Add('Cache-Control','no-store')
      $bytes = [IO.File]::ReadAllBytes($file)
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Host "200 $path"
    } else { $res.StatusCode = 404; Write-Host "404 $path" }
  } catch { Write-Host "ERR $_" } finally { $res.Close() }
}
