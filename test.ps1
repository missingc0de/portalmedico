$asm = [System.Reflection.Assembly]::LoadFile('C:\Users\missi\.gemini\antigravity\scratch\PORTALMEDICO_CLIENTEWEB\dist-installer\PortalMedico_Setup_v1.4.11.exe')
$stream = $asm.GetManifestResourceStream('PortalMedico.exe')
$file = [System.IO.File]::Create('C:\Users\missi\.gemini\antigravity\scratch\PORTALMEDICO_CLIENTEWEB\test_extract.exe')
$stream.CopyTo($file)
$file.Close()
$stream.Close()
(Get-FileHash 'C:\Users\missi\.gemini\antigravity\scratch\PORTALMEDICO_CLIENTEWEB\test_extract.exe').Hash
(Get-FileHash 'dist-python\run_webview.exe').Hash
