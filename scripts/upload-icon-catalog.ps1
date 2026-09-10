# Bulk-registers local icon files into the concept-scoped icon catalog by calling the
# upload-asset edge function per file (uploads to Storage AND inserts the icon_catalog row
# atomically - avoids hand-editing Storage and the table separately and having them drift).
#
# Usage: .\scripts\upload-icon-catalog.ps1 -ConceptKey 214 -FolderPath C:\path\to\icons

param(
    [Parameter(Mandatory = $true)][string]$ConceptKey,
    [Parameter(Mandatory = $true)][string]$FolderPath
)

$ErrorActionPreference = "Stop"
$anonKey = "sb_publishable_gR2mvuUSV4MPbWtOVn0CYA_Sf3vuupE"
$url = "https://ckknygarkwlfexwsawbb.supabase.co/functions/v1/upload-asset"
$mimeTypes = @{ ".png" = "image/png"; ".jpg" = "image/jpeg"; ".jpeg" = "image/jpeg"; ".webp" = "image/webp"; ".svg" = "image/svg+xml" }

Add-Type -AssemblyName System.Net.Http
$client = New-Object System.Net.Http.HttpClient
$client.DefaultRequestHeaders.Add("apikey", $anonKey)
$client.DefaultRequestHeaders.Add("Authorization", "Bearer $anonKey")

Get-ChildItem $FolderPath -File | Where-Object { $mimeTypes.ContainsKey($_.Extension.ToLower()) } | ForEach-Object {
    $label = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
    $mime = $mimeTypes[$_.Extension.ToLower()]

    $content = New-Object System.Net.Http.MultipartFormDataContent
    $content.Add((New-Object System.Net.Http.StringContent("icon-catalog")), "purpose")
    $content.Add((New-Object System.Net.Http.StringContent($ConceptKey)), "conceptKey")
    $content.Add((New-Object System.Net.Http.StringContent($label)), "label")

    $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
    $fileContent = New-Object System.Net.Http.ByteArrayContent(, $bytes)
    $fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse($mime)
    $content.Add($fileContent, "file", $_.Name)

    $response = $client.PostAsync($url, $content).GetAwaiter().GetResult()
    $body = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    if ($response.IsSuccessStatusCode) {
        Write-Host "$($_.Name) -> OK: $body"
    } else {
        Write-Warning "$($_.Name) -> FAILED ($($response.StatusCode)): $body"
    }
}

$client.Dispose()
