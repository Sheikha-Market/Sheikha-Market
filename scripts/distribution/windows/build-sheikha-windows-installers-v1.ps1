param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("x64", "arm64")]
  [string]$Architecture,

  [Parameter(Mandatory = $true)]
  [ValidateSet("user-installer", "system-installer", "zip", "cli")]
  [string]$Product,

  [string]$OutputDirectory = ""
)

$ErrorActionPreference = "Stop"

if ($env:OS -ne "Windows_NT") {
  Write-Error "NATIVE_PLATFORM_MISMATCH=true"
  exit 21
}

$Root = (& git rev-parse --show-toplevel).Trim()

if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
  $OutputDirectory = Join-Path $Root "dist\native-build\windows\$Product-$Architecture"
}

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

$PackageJsonPath = Join-Path $Root "package.json"
$PackageJson = Get-Content $PackageJsonPath -Raw | ConvertFrom-Json
$Scripts = $PackageJson.scripts

$Candidates = @(
  "sheikha:dist:windows:$Product:$Architecture",
  "dist:windows:$Product:$Architecture",
  "build:windows:$Product:$Architecture",
  "package:windows:$Product:$Architecture",
  "sheikha:dist:windows:$Architecture",
  "dist:windows:$Architecture",
  "build:windows:$Architecture",
  "package:windows:$Architecture",
  "sheikha:dist:windows",
  "dist:windows",
  "build:windows",
  "package:windows"
)

$SelectedScript = $null

foreach ($Candidate in $Candidates) {
  if ($Scripts.PSObject.Properties.Name -contains $Candidate) {
    $SelectedScript = $Candidate
    break
  }
}

if ($null -eq $SelectedScript) {
  Write-Error "BUILD_SCRIPT_NOT_CONFIGURED=true Product=$Product Architecture=$Architecture"
  exit 42
}

$SourceCommit = (& git -C $Root rev-parse HEAD).Trim()
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$LogFile = Join-Path $OutputDirectory "build-$Stamp.log"
$ResultFile = Join-Path $OutputDirectory "build-result-$Stamp.json"

@(
  "SYSTEM_ID=SHEIKHA_WINDOWS_NATIVE_INSTALLER_BUILD_RUNNER_V1",
  "PRODUCT=$Product",
  "ARCHITECTURE=$Architecture",
  "SOURCE_COMMIT=$SourceCommit",
  "SELECTED_SCRIPT=$SelectedScript",
  "OUTPUT_DIRECTORY=$OutputDirectory",
  "PACKAGE_INSTALLATION_PERFORMED=false",
  "BUILD_STARTED_AT=$((Get-Date).ToString('o'))"
) | Tee-Object -FilePath $LogFile

Push-Location $Root
try {
  $env:SHEIKHA_TARGET_PLATFORM = "windows"
  $env:SHEIKHA_TARGET_ARCH = $Architecture
  $env:SHEIKHA_TARGET_PRODUCT = $Product
  $env:SHEIKHA_OUTPUT_DIR = $OutputDirectory

  & npm run $SelectedScript 2>&1 |
    Tee-Object -FilePath $LogFile -Append

  $BuildExitCode = $LASTEXITCODE
}
finally {
  Pop-Location
}

$Result = @{
  system = "SHEIKHA_WINDOWS_NATIVE_INSTALLER_BUILD_RESULT_V1"
  product = $Product
  architecture = $Architecture
  sourceCommit = $SourceCommit
  selectedScript = $SelectedScript
  outputDirectory = $OutputDirectory
  logFile = $LogFile
  buildExitCode = $BuildExitCode
  buildCompleted = ($BuildExitCode -eq 0)
  artifactEvidenceCollected = $false
  installTestExecuted = $false
  smokeTestExecuted = $false
  uninstallTestExecuted = $false
  productionPromotionAuthorized = $false
}

$Result |
  ConvertTo-Json -Depth 10 |
  Set-Content -Encoding UTF8 $ResultFile

Write-Output "BUILD_EXIT_CODE=$BuildExitCode"
Write-Output "BUILD_RESULT=$ResultFile"
Write-Output "ARTIFACT_EVIDENCE_COLLECTION_REQUIRED=true"

exit $BuildExitCode
