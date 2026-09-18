import os
import json
import requests

OUTPUT_DIR = "data/raw/floods"
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "reliefweb_floods.json")

API_URL = "https://api.reliefweb.int/v2/disasters"
APP_NAME = "himalaya-risk-atlas"  

COUNTRIES = ["Nepal", "India"]

def fetch_floods_for_country(country):
    params = {
        "appname": APP_NAME,
        "filter[field]": "country",
        "filter[value]": country,
        "filter[operator]": "AND",
        "limit": 1000,
    }

    query = {
        "appname": APP_NAME,
        "filter": {
            "conditions": [
                {"field": "country", "value": [country]},
                {"field": "type", "value": ["Flood"]},
            ],
            "operator": "AND",
        },
        "limit": 1000,
        "fields": {"include": ["name", "date", "country", "type", "status", "glide"]},
    }
    resp = requests.post(API_URL, params={"appname": APP_NAME}, json=query, timeout=30)
    if resp.status_code != 200:
        print("API error response:", resp.text)
    resp.raise_for_status()
    return resp.json()

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    all_results = {}

    for country in COUNTRIES:
        print(f"Fetching flood events for {country}...")
        data = fetch_floods_for_country(country)
        events = data.get("data", [])
        all_results[country] = events
        print(f"  {len(events)} flood events found")

    with open(OUTPUT_PATH, "w") as f:
        json.dump(all_results, f, indent=2)

    total = sum(len(v) for v in all_results.values())
    print(f"\nDone. Wrote {total} total flood events to {OUTPUT_PATH}")

if __name__ == "__main__":
    main()