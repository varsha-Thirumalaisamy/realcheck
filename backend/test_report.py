import urllib.request

def check_endpoint(url):
    print("Testing:", url)
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=3) as response:
            status = response.status
            body = response.read().decode('utf-8')
            print("SUCCESS", status, body[:120])
    except urllib.error.HTTPError as e:
        print("HTTP ERROR", e.code, e.read().decode('utf-8')[:120])
    except Exception as e:
        print("EXCEPTION", type(e).__name__, str(e))

if __name__ == "__main__":
    check_endpoint("http://127.0.0.1:8000/api/health")
    check_endpoint("http://127.0.0.1:8000/api/investigations/RC-2026-0042")
    check_endpoint("http://127.0.0.1:8000/api/investigations/reports/RC-2026-0042")
