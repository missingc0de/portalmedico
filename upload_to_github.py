import subprocess
import json
import urllib.request
import os
import sys

def get_token():
    proc = subprocess.Popen(['git', 'credential', 'fill'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    out, _ = proc.communicate(input='protocol=https\nhost=github.com\n\n')
    for line in out.splitlines():
        if line.startswith('password='):
            return line.split('=', 1)[1]
    return ""

def main():
    token = get_token()
    if not token:
        print("Error: No GitHub token found.")
        sys.exit(1)

    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'PortalMedico-Uploader'
    }

    repo = 'missingc0de/portalmedico'
    tag = 'v1.4.13'
    
    # Check if release v1.4.13 exists
    release_id = None
    upload_url_base = None
    
    try:
        req = urllib.request.Request(f'https://api.github.com/repos/{repo}/releases/tags/{tag}', headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            release_id = data.get('id')
            upload_url_base = data.get('upload_url', '').split('{')[0]
            print(f"Found existing Release v1.4.13 (ID: {release_id})")
    except Exception as e:
        print("Release tag not found by URL, attempting creation or lookup...")
        create_payload = {
            'tag_name': tag,
            'target_commitish': 'main',
            'name': 'Portal Médico v1.4.13',
            'body': '### Novedades v1.4.13:\n- **Ficha de Fondo de Ojo:** Reestructuración de resumen en bloques independientes de Anamnesis, Exploración y Actuación con botones independientes de copiado. Scroll independiente en formulario y maquetación responsiva sin recortes.\n- **Sector Punta Mira:** Incorporación del sector "Punta Mira" como opción seleccionable en toda la aplicación (Perfil de usuario, Registro, Ficha de Visita Domiciliaria).\n- **GES:** Incorporación del problema de salud GES N° 91 ("Ayudas técnicas para movilidad y preservación de tejidos para personas de 15 a 64 años").\n- **Edición de Perfil:** Corrección de persistencia completa de datos de perfil de usuario en Firestore y sincronización.\n- **Actualización de Versión:** Sincronización oficial a la versión 1.4.13 en toda la aplicación e instaladores.',
            'draft': False,
            'prerelease': False
        }
        req = urllib.request.Request(f'https://api.github.com/repos/{repo}/releases', data=json.dumps(create_payload).encode('utf-8'), headers=headers, method='POST')
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                release_id = data.get('id')
                upload_url_base = data.get('upload_url', '').split('{')[0]
                print(f"Created Release v1.4.13 (ID: {release_id})")
        except Exception as create_err:
            print("Notice on creation (might already exist):", create_err)
            # Fetch all releases to find v1.4.13
            all_req = urllib.request.Request(f'https://api.github.com/repos/{repo}/releases', headers=headers)
            with urllib.request.urlopen(all_req) as all_resp:
                all_releases = json.loads(all_resp.read().decode('utf-8'))
                for r in all_releases:
                    if r.get('tag_name') == tag or r.get('name') == 'Portal Médico v1.4.13':
                        release_id = r.get('id')
                        upload_url_base = r.get('upload_url', '').split('{')[0]
                        print(f"Found Release v1.4.13 via list search (ID: {release_id})")
                        break

    # List of assets to upload
    assets = [
        ('dist-installer/PortalMedico_Setup_v1.4.13.exe', 'PortalMedico_Setup_v1.4.13.exe'),
        ('dist-python/run_webview.exe', 'PortalMedico_v1.4.13.exe')
    ]

    # Delete any existing assets with matching names
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
        
        # Use curl for reliable binary uploads
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
