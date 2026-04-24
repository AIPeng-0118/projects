$env:PATH = [Environment]::GetEnvironmentVariable("PATH", "Machine") + ";D:\AI\honghongmoniqi\project_20260423_154941\projects\node-v20.11.1-win-x64;D:\AI\honghongmoniqi\project_20260423_154941\projects\node_modules\.bin"
$env:PORT = "5000"

Write-Host "Starting Next.js development server on port 5000..."
Write-Host "Environment PATH updated"

& "D:\AI\honghongmoniqi\project_20260423_154941\projects\node_modules\.bin\next" dev -p 5000