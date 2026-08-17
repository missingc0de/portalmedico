import os
import sys
import json
import subprocess
import urllib.request
import urllib.parse
import urllib.error

def get_git_token():
    env_token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if env_token:
        return env_token
    try:
        proc = subprocess.run(["git", "credential", "fill"], input=b"protocol=https\nhost=github.com\n", capture_output=True)
        out = proc.stdout.decode('utf-8')
        for line in out.splitlines():
            if line.startswith("password="):
                return line.split("=", 1)[1].strip()
    except Exception as e:
        print("Could not retrieve git credential:", e)
    return ""

TOKEN = get_git_token()
REPO = "missingc0de/portalmedico"
TAG = "v1.2.3"
VERSION = "1.2.3"
SHA512_HASH = "WkJriUY0VFnWl2VZwupnzNlLw3UHVBA0UqLRsU11IUHZjX4xMqd+IZI3bhjNT+yNIhntoGrjEZiYpL3bIb3khA=="

def create_or_get_release():
    url = f"https://api.github.com/repos/{REPO}/releases"
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Python-Publisher"
    }
    
    payload = {
        "tag_name": TAG,
        "target_commitish": "main",
        "name": f"Portal Medico {VERSION}",
        "body": f"Release {VERSION} - Direct Login on Launch & Embedded Logo Icon",
        "draft": False,
        "prerelease": False,
        "make_latest": "true"
    }

    print(f"\n--- Creating/Updating GitHub Release for {TAG} ---")
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
    
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"SUCCESS: Created Release ID {data['id']} for {TAG}")
            return data['id'], data['upload_url']
    except urllib.error.HTTPError as e:
        if e.code == 422: # Already exists
            print(f"Release {TAG} already exists, fetching details...")
            url_tag = f"https://api.github.com/repos/{REPO}/releases/tags/{TAG}"
            req_tag = urllib.request.Request(url_tag, headers=headers, method='GET')
            with urllib.request.urlopen(req_tag) as tag_resp:
                data = json.loads(tag_resp.read().decode('utf-8'))
                return data['id'], data['upload_url']
        else:
            print(f"HTTPError {e.code}: {e.read().decode('utf-8')}")
            sys.exit(1)

def delete_existing_asset(release_id, asset_name):
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Python-Publisher"
    }
    url = f"https://api.github.com/repos/{REPO}/releases/{release_id}/assets"
    req = urllib.request.Request(url, headers=headers, method='GET')
    with urllib.request.urlopen(req) as resp:
        assets = json.loads(resp.read().decode('utf-8'))

    for asset in assets:
        if asset['name'] == asset_name:
            del_url = f"https://api.github.com/repos/{REPO}/releases/assets/{asset['id']}"
            print(f"Deleting old asset {asset_name} (ID {asset['id']})...")
            del_req = urllib.request.Request(del_url, headers=headers, method='DELETE')
            with urllib.request.urlopen(del_req) as del_resp:
                print(f"  Deleted {asset_name}")

def upload_asset(upload_url_template, file_name, file_bytes, content_type="application/octet-stream"):
    upload_url = upload_url_template.split('{')[0] + f"?name={urllib.parse.quote(file_name)}"
    print(f"Uploading asset: {file_name} ({len(file_bytes)} bytes)...")
    
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": content_type,
        "User-Agent": "Python-Publisher"
    }

    req = urllib.request.Request(upload_url, data=file_bytes, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            res_data = json.loads(resp.read().decode('utf-8'))
            print(f"  SUCCESS: Uploaded {file_name} -> {res_data['browser_download_url']}")
    except urllib.error.HTTPError as e:
        print(f"  FAILED to upload {file_name}: {e.code} - {e.read().decode('utf-8')}")

def main():
    if not TOKEN:
        print("Error: Could not retrieve GitHub token!")
        sys.exit(1)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    dist_dir = os.path.join(base_dir, 'dist')
    dist_exe = os.path.join(dist_dir, 'PortalMedico.exe')
    
    if not os.path.exists(dist_exe):
        print(f"Error: {dist_exe} not found!")
        return

    with open(dist_exe, 'rb') as f:
        exe_bytes = f.read()

    yml_content = f"""version: {VERSION}
files:
  - url: Portal-Medico-Setup-1.2.3.exe
    sha512: {SHA512_HASH}
    size: {len(exe_bytes)}
  - url: portal-medico-setup-1.2.3.exe
    sha512: {SHA512_HASH}
    size: {len(exe_bytes)}
  - url: PORTAL MÉDICO.exe
    sha512: {SHA512_HASH}
    size: {len(exe_bytes)}
path: Portal-Medico-Setup-1.2.3.exe
sha512: {SHA512_HASH}
releaseDate: '2026-08-16T23:44:00.000Z'
""".encode('utf-8')

    release_id, upload_url = create_or_get_release()

    exe_names_to_upload = [
        "Portal-Medico-Setup-1.2.3.exe",
        "portal-medico-setup-1.2.3.exe",
        "PortalMedico.exe",
        "PORTAL MÉDICO.exe",
        "PORTAL MÉDICO Setup 1.2.3.exe"
    ]

    for exe_name in exe_names_to_upload:
        delete_existing_asset(release_id, exe_name)
        upload_asset(upload_url, exe_name, exe_bytes, "application/octet-stream")

    delete_existing_asset(release_id, "latest.yml")
    upload_asset(upload_url, "latest.yml", yml_content, "text/yaml")

    print("\nRELEASE V1.2.3 DIRECT LOGIN ON LAUNCH SUCCESSFULLY PUBLISHED!")

if __name__ == '__main__':
    main()
