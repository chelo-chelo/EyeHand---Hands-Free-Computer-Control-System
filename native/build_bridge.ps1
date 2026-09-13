# Build EyeHand Native System Control Bridge
$cscPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $cscPath)) {
    $cscPath = "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
}

if (-not (Test-Path $cscPath)) {
    Write-Error "Microsoft .NET C# Compiler (csc.exe) not found!"
    exit 1
}

$source = Join-Path $PSScriptRoot "EyeHandBridge.cs"
$output = Join-Path $PSScriptRoot "EyeHandBridge.exe"

Write-Host "Compiling EyeHandBridge.exe..." -ForegroundColor Cyan
& $cscPath /target:exe /out:$output /optimize+ $source

if (Test-Path $output) {
    Write-Host "Build Successful: $output" -ForegroundColor Green
} else {
    Write-Error "Build failed!"
    exit 1
}
