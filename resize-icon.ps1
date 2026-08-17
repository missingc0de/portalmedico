Add-Type -AssemblyName System.Drawing

$srcFile = "c:\Users\missi\.gemini\antigravity\scratch\PORTALMEDICO_CLIENTEWEB\electron\portalmedico_icon.png"
$dstFile = "c:\Users\missi\.gemini\antigravity\scratch\PORTALMEDICO_CLIENTEWEB\electron\portalmedico_icon_256.png"

$srcImage = [System.Drawing.Image]::FromFile($srcFile)
$dstImage = New-Object System.Drawing.Bitmap(256, 256)
$graphics = [System.Drawing.Graphics]::FromImage($dstImage)

# High quality resize
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$graphics.DrawImage($srcImage, 0, 0, 256, 256)
$dstImage.Save($dstFile, [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$srcImage.Dispose()
$dstImage.Dispose()
