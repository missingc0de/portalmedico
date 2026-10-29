import subprocess
import json
import urllib.request
import os
import sys

def get_git_token():
    env_token = os.environ.get('GH_TOKEN') or os.environ.get('GITHUB_TOKEN')
    if env_token:
        return env_token
    try:
        proc = subprocess.run(["git", "credential", "fill"], input=b"protocol=https\nhost=github.com\n", capture_output=True)
        out = proc.stdout.decode('utf-8', errors='ignore')
        for line in out.splitlines():
            if line.startswith("password="):
                return line.split("=", 1)[1].strip()
    except Exception as e:
        print("Could not retrieve git credential:", e)
    return ""

def main():
    token = sys.argv[1] if len(sys.argv) > 1 else get_git_token()
    if not token:
        print("Error: No GitHub token provided.")
        sys.exit(1)

    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'PortalMedico-Uploader'
    }

    repo = 'missingc0de/portalmedico'
    tag = 'v1.4.29'
    version = '1.4.29'
    
    release_id = None
    upload_url_base = None
    
    try:
        req = urllib.request.Request(f'https://api.github.com/repos/{repo}/releases/tags/{tag}', headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            release_id = data.get('id')
            upload_url_base = data.get('upload_url', '').split('{')[0]
            print(f"Found existing Release {tag} (ID: {release_id})")
    except Exception as e:
        print(f"Release tag {tag} not found by direct tag URL, attempting creation or lookup...")
        create_payload = {
            'tag_name': tag,
            'target_commitish': 'main',
            'name': f'Portal Médico {tag}',
            'body': (
                f"### Novedades {tag}:\n"
                "- **Corrección del Nombre de la App:** Nombre oficial PORTAL MÉDICO normalizado con soporte UTF-8 sin caracteres corruptos en el instalador, accesos directos, registro de Windows y en la interfaz de la aplicación.\n"
                "- **Nueva Ficha Control PADDS:** Integración completa de objetivos y planes consensuados PADDS, citación inteligente de equipo de cabecera con médico al inicio, cálculo de estratificación y modal de pacientes.\n"
                "- **Ficha Ingreso PADDS:** Optimización de antecedentes, evaluación de escala Zarit, ayudas técnicas y precompletados clínicos.\n"
                "- **Equipo de Cabecera:** Actualización y renombrado de ficha Visita Domiciliaria a Equipo de Cabecera en todas las vistas y reportes.\n"
                "- **Webview Bundling:** Ejecutable e instalador oficial v1.4.29 optimizado con WebView2 para Windows."
            ),
            'draft': False,
            'prerelease': False,
            'make_latest': 'true'
        }
        req = urllib.request.Request(f'https://api.github.com/repos/{repo}/releases', data=json.dumps(create_payload).encode('utf-8'), headers=headers, method='POST')
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                release_id = data.get('id')
                upload_url_base = data.get('upload_url', '').split('{')[0]
                print(f"Created Release {tag} (ID: {release_id})")
        except Exception as create_err:
            print("Notice on creation (might already exist):", create_err)
            all_req = urllib.request.Request(f'https://api.github.com/repos/{repo}/releases', headers=headers)
            with urllib.request.urlopen(all_req) as all_resp:
                all_releases = json.loads(all_resp.read().decode('utf-8'))
                for r in all_releases:
                    if r.get('tag_name') == tag or r.get('name') == f'Portal Médico {tag}':
                        release_id = r.get('id')
                        upload_url_base = r.get('upload_url', '').split('{')[0]
                        print(f"Found Release {tag} via list search (ID: {release_id})")
                        break

    if not release_id or not upload_url_base:
        print("Error: Could not obtain release_id or upload_url_base.")
        sys.exit(1)

    assets = [
        (f'dist-installer/PortalMedico_Setup_{tag}.exe', f'PortalMedico_Setup_{tag}.exe'),
        ('dist-python/run_webview.exe', f'PortalMedico_{tag}.exe')
    ]

    try:
        assets_req = urllib.request.Request(f'https://api.github.com/repos/{repo}/releases/{release_id}/assets', headers=headers)
        with urllib.request.urlopen(assets_req) as resp:
            existing_assets = json.loads(resp.read().decode('utf-8'))
            for existing in existing_assets:
                for _, asset_name in assets:
                    if existing.get('name') == asset_name:
                        del_url = f"https://api.github.com/repos/{repo}/releases/assets/{existing['id']}"
                        print(f"Deleting old asset {asset_name} (ID {existing['id']})...")
                        del_req = urllib.request.Request(del_url, headers=headers, method='DELETE')
                        try:
                            with urllib.request.urlopen(del_req) as del_resp:
                                print(f"  Deleted old asset {asset_name}")
                        except Exception as del_err:
                            print(f"  Notice during deletion of {asset_name}: {del_err}")
    except Exception as e:
        print("Notice during fetching assets:", e)

    for local_path, asset_name in assets:
        abs_path = os.path.abspath(local_path)
        if not os.path.exists(abs_path):
            print(f"Warning: File '{abs_path}' does not exist, skipping.")
            continue

        size_mb = os.path.getsize(abs_path) / (1024 * 1024)
        print(f"\nUploading {asset_name} ({size_mb:.2f} MB) using curl.exe...")

        upload_url = f"{upload_url_base}?name={asset_name}"
        
        cmd = [
            'curl.exe',
            '-X', 'POST',
            '-H', f'Authorization: Bearer {token}',
            '-H', 'Content-Type: application/octet-stream',
            '--data-binary', f'@{abs_path}',
            upload_url
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0 and ('browser_download_url' in result.stdout or '"id":' in result.stdout):
            print(f"SUCCESS: Uploaded {asset_name} successfully!")
        else:
            print(f"Curl upload output: {result.stdout}")
            print(f"Curl upload error: {result.stderr}")

if __name__ == '__main__':
    main()
