from flask import Flask, request, jsonify
from dotenv import load_dotenv, dotenv_values 
from datetime import datetime, timezone
import json, os, requests

app = Flask(__name__)
load_dotenv()

# Where to save local copies of forms submissions
DATA_DIR = f"{os.getend("project_location")}-data"
JSONL_PATH = os.path.join(DATA_DIR, "submissions.jsonl")

# Formspree endpoint. set id in .env
FORMSPREE_URL = f"https://formspree.io/f/{os.getenv("formspree_id")}"

def save_jsonl(record):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(JSONL_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")

@app.post("/contact")
def contact():
    # Accept either application/json or form-encoded
    if request.is_json:
        payload = request.get_json(silent=True) or {}
    else:
        payload = request.form.to_dict(flat=True)

    # Attach server-side metadata
    record = {
        "received_at": datetime.now(timezone.utc).isoformat(),
        "remote_addr": request.headers.get("X-Forwarded-For", request.remote_addr),
        "user_agent": request.headers.get("User-Agent"),
        "fields": payload,
    }

    # Always save locally
    try:
        save_jsonl(record)
        local_saved = True
        local_error = None
    except Exception as e:
        local_saved = False
        local_error = str(e)

    # Try forwarding to Formspree
    fs_status = None
    fs_error = None
    try:
        # Send as form-encoded like a normal HTML form
        r = requests.post(FORMSPREE_URL, data=payload, timeout=8)
        fs_status = r.status_code
        # Treat 200/201/202 as success; anything else is a forward error
        if r.status_code not in (200, 201, 202):
            fs_error = f"Formspree responded {r.status_code}: {r.text[:200]}"
    except Exception as e:
        fs_error = str(e)

    # Respond to the browser
    ok = local_saved  # success if at least saved locally
    return jsonify({
        "ok": ok,
        "local_saved": local_saved,
        "local_error": local_error,
        "formspree_status": fs_status,
        "formspree_error": fs_error,
    }), (200 if ok else 500)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
