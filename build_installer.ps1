# PowerShell Script to create the official Windows Setup Installer for PORTAL MÉDICO v1.4.6

$WorkspaceDir = "c:\Users\missi\.gemini\antigravity\scratch\PORTALMEDICO_CLIENTEWEB"
Set-Location $WorkspaceDir

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "1. Building Python Executable..." -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File .\build_python_exe.ps1

if (-not (Test-Path "dist-python\run_webview.exe")) {
    Write-Error "Error: dist-python\run_webview.exe missing."
    Exit 1
}

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "2. Creating Windows Setup Installer..." -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

$InstallerDir = "dist-installer"
if (Test-Path $InstallerDir) { Remove-Item -Recurse -Force $InstallerDir }
New-Item -ItemType Directory -Path $InstallerDir | Out-Null

$IconPath = Join-Path $WorkspaceDir "portalmedico.ico"
$HasIcon = Test-Path $IconPath

$CSharpCode = @"
using System;
using System.IO;
using System.Reflection;
using System.Diagnostics;
using System.Windows.Forms;
using System.Drawing;
using System.Runtime.InteropServices;
using Microsoft.Win32;

public class SetupForm : Form
{
    private Label lblTitle;
    private Label lblStatus;
    private ProgressBar progressBar;
    private CheckBox chkDesktopShortcut;
    private CheckBox chkLaunch;
    private Button btnInstall;
    private Button btnCancel;
    private string installPath;

    public SetupForm()
    {
        this.Text = "Instalador de PORTAL MÉDICO v1.4.6";
        this.Size = new Size(540, 350);
        this.StartPosition = FormStartPosition.CenterScreen;
        this.FormBorderStyle = FormBorderStyle.FixedDialog;
        this.MaximizeBox = false;
        this.MinimizeBox = false;
        this.BackColor = Color.FromArgb(248, 250, 252);
        this.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);

        string appData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        installPath = Path.Combine(appData, @"Programs\PortalMedico");

        lblTitle = new Label() {
            Text = "Instalación de PORTAL MÉDICO v1.4.6",
            Font = new Font("Segoe UI", 12f, FontStyle.Bold),
            ForeColor = Color.FromArgb(14, 116, 144),
            Location = new Point(24, 20),
            AutoSize = true
        };

        lblStatus = new Label() {
            Text = "El asistente instalará PORTAL MÉDICO en la siguiente carpeta:\n" + installPath,
            Location = new Point(24, 60),
            Size = new Size(470, 45),
            ForeColor = Color.FromArgb(51, 65, 85)
        };

        progressBar = new ProgressBar() {
            Location = new Point(24, 120),
            Size = new Size(475, 24),
            Style = ProgressBarStyle.Blocks,
            Value = 0
        };

        chkDesktopShortcut = new CheckBox() {
            Text = "Crear acceso directo en el Escritorio",
            Location = new Point(24, 160),
            AutoSize = true,
            Checked = true
        };

        chkLaunch = new CheckBox() {
            Text = "Ejecutar PORTAL MÉDICO al finalizar",
            Location = new Point(24, 190),
            AutoSize = true,
            Checked = true
        };

        btnInstall = new Button() {
            Text = "Instalar",
            Location = new Point(290, 245),
            Size = new Size(100, 36),
            BackColor = Color.FromArgb(14, 116, 144),
            ForeColor = Color.White,
            FlatStyle = FlatStyle.Flat,
            Cursor = Cursors.Hand
        };
        btnInstall.FlatAppearance.BorderSize = 0;
        btnInstall.Click += BtnInstall_Click;

        btnCancel = new Button() {
            Text = "Cancelar",
            Location = new Point(400, 245),
            Size = new Size(98, 36),
            Cursor = Cursors.Hand
        };
        btnCancel.Click += (s, e) => this.Close();

        this.Controls.Add(lblTitle);
        this.Controls.Add(lblStatus);
        this.Controls.Add(progressBar);
        this.Controls.Add(chkDesktopShortcut);
        this.Controls.Add(chkLaunch);
        this.Controls.Add(btnInstall);
        this.Controls.Add(btnCancel);
    }

    private void BtnInstall_Click(object sender, EventArgs e)
    {
        btnInstall.Enabled = false;
        btnCancel.Enabled = false;
        lblStatus.Text = "Extrayendo e instalando archivos...";
        progressBar.Value = 20;
        Application.DoEvents();

        try
        {
            Directory.CreateDirectory(installPath);
            string exeTarget = Path.Combine(installPath, "PortalMedico.exe");

            Assembly asm = Assembly.GetExecutingAssembly();
            using (Stream resStream = asm.GetManifestResourceStream("PortalMedico.exe"))
            {
                if (resStream == null)
                {
                    throw new Exception("No se encontró la imagen del ejecutable embebido.");
                }
                using (FileStream fileStream = new FileStream(exeTarget, FileMode.Create, FileAccess.Write))
                {
                    byte[] buffer = new byte[64 * 1024];
                    int bytesRead;
                    long totalRead = 0;
                    long totalSize = resStream.Length;
                    while ((bytesRead = resStream.Read(buffer, 0, buffer.Length)) > 0)
                    {
                        fileStream.Write(buffer, 0, bytesRead);
                        totalRead += bytesRead;
                        progressBar.Value = 20 + (int)(60.0 * totalRead / totalSize);
                        Application.DoEvents();
                    }
                }
            }

            if (chkDesktopShortcut.Checked)
            {
                string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                CreateShortcut(Path.Combine(desktopPath, "PORTAL MÉDICO.lnk"), exeTarget);
            }

            string startMenuPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "PORTAL MÉDICO.lnk");
            CreateShortcut(startMenuPath, exeTarget);

            RegisterUninstall(installPath, exeTarget);

            progressBar.Value = 100;
            lblStatus.Text = "¡Instalación completada con éxito!";
            Application.DoEvents();

            if (chkLaunch.Checked && File.Exists(exeTarget))
            {
                Process.Start(exeTarget);
            }

            MessageBox.Show("PORTAL MÉDICO se ha instalado correctamente en su equipo.", "Instalación Completada", MessageBoxButtons.OK, MessageBoxIcon.Information);
            this.Close();
        }
        catch (Exception ex)
        {
            MessageBox.Show("Error durante la instalación: " + ex.Message, "Error de Instalación", MessageBoxButtons.OK, MessageBoxIcon.Error);
            btnInstall.Enabled = true;
            btnCancel.Enabled = true;
        }
    }

    private void CreateShortcut(string shortcutPath, string targetExe)
    {
        try
        {
            Type shellType = Type.GetTypeFromProgID("WScript.Shell");
            dynamic shell = Activator.CreateInstance(shellType);
            dynamic shortcut = shell.CreateShortcut(shortcutPath);
            shortcut.TargetPath = targetExe;
            shortcut.WorkingDirectory = Path.GetDirectoryName(targetExe);
            shortcut.Description = "PORTAL MÉDICO APS";
            shortcut.Save();
        }
        catch { }
    }

    private void RegisterUninstall(string dir, string exe)
    {
        try
        {
            using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\PortalMedico"))
            {
                key.SetValue("DisplayName", "PORTAL MÉDICO");
                key.SetValue("ApplicationVersion", "1.4.5");
                key.SetValue("Publisher", "PORTAL MÉDICO APS");
                key.SetValue("DisplayIcon", exe);
                key.SetValue("DisplayVersion", "1.4.5");
                key.SetValue("InstallLocation", dir);
                key.SetValue("UninstallString", "cmd.exe /c rmdir /s /q \"" + dir + "\"");
            }
        }
        catch { }
    }

    [DllImport("user32.dll")]
    private static extern bool SetProcessDPIAware();

    [DllImport("shcore.dll")]
    private static extern int SetProcessDpiAwareness(int awareness);

    [STAThread]
    public static void Main()
    {
        try { SetProcessDpiAwareness(2); } catch { try { SetProcessDPIAware(); } catch {} }
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.Run(new SetupForm());
    }
}
"@

$SourceFile = Join-Path $InstallerDir "InstallerSource.cs"
$Utf8EncodingWithBom = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText($SourceFile, $CSharpCode, $Utf8EncodingWithBom)

$PayloadExe = Join-Path $WorkspaceDir "dist-python\run_webview.exe"
$OutInstallerExe = Join-Path $InstallerDir "PortalMedico_Setup_v1.4.6.exe"

$CscPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
$CscArgs = @("/target:winexe", "/codepage:65001", "/out:$OutInstallerExe", "/r:System.dll", "/r:System.Windows.Forms.dll", "/r:System.Drawing.dll", "/r:System.Core.dll", "/resource:$PayloadExe,PortalMedico.exe")

if ($HasIcon) {
    $CscArgs += "/win32icon:$IconPath"
}

$CscArgs += $SourceFile

Write-Host "Compiling setup installer with csc.exe..." -ForegroundColor Cyan
& $CscPath $CscArgs

if (Test-Path $OutInstallerExe) {
    Write-Host "==============================================" -ForegroundColor Green
    Write-Host "¡INSTALADOR CREADO EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "Installer executable generated at: $OutInstallerExe" -ForegroundColor Green
    Write-Host "==============================================" -ForegroundColor Green
} else {
    Write-Error "Failed to generate installer executable."
    Exit 1
}
