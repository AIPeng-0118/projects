$nodePath = "D:\AI\honghongmoniqi\project_20260423_154941\projects\node-v20.11.1-win-x64"
$env:PATH = "$env:PATH;$nodePath"

# Run npm install using the local node
& "$nodePath\node.exe" "$nodePath\node_modules\npm\bin\npm-cli.js" install