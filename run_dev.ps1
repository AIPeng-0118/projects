$nodePath = "D:\AI\honghongmoniqi\project_20260423_154941\projects\node-v20.11.1-win-x64"
$binPath = "D:\AI\honghongmoniqi\project_20260423_154941\projects\node_modules\.bin"

$env:PATH = "$env:PATH;$nodePath;$binPath"

Write-Host "Starting server on port 5000..."

& "$binPath\tsx" watch src/server.ts