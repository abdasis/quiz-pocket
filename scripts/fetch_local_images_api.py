import urllib.request
import urllib.parse
import json
import os
import time

output_dir = "/home/abdasis/Projects/quiz-pocket/apps/web/public/article-images"
os.makedirs(output_dir, exist_ok=True)

headers = {
    'User-Agent': 'QuizPocket/1.0 (https://quiz.abdasis.my.id; id.abdasis@gmail.com)'
}

files_to_fetch = {
    "photosynthesis_schema.svg": "File:Photosynthesis_id.svg",
    "chloroplast_structure.svg": "File:Chloroplast_diagram-id.svg",
    "calvin_cycle.png": "File:Reaksi_gelapedit_copy.png",
    "global_biosphere.jpg": "File:Seawifs_global_biosphere.jpg",
    "solar_system_scale.jpg": "File:Planets2008-id.jpg",
    "inner_solar_system.svg": "File:Solarsys.svg",
    "kuiper_oort.svg": "File:Kuiper_belt_-_Oort_cloud-en.svg",
    "digestive_system.svg": "File:Digestive_system_diagram_id.svg",
    "stomach_diagram.svg": "File:Stomach_diagram-id.svg",
    "circulatory_system.svg": "File:Circulatory_System_en.svg",
    "heart_anatomy.svg": "File:Diagram_of_the_human_heart_(cropped).svg",
    "plate_tectonics.svg": "File:Plates_tect2_id.svg",
    "earth_atmosphere.svg": "File:Atmospheric_layers-id.svg",
}

titles_query = "|".join(files_to_fetch.values())
api_url = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(titles_query)}&prop=imageinfo&iiprop=url&format=json"

req = urllib.request.Request(api_url, headers=headers)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))

url_map = {}
for pid, pdata in data['query']['pages'].items():
    title = pdata.get('title')
    info = pdata.get('imageinfo', [{}])[0]
    raw_url = info.get('url')
    if raw_url:
        url_map[title.replace(' ', '_')] = raw_url
        url_map[title] = raw_url

print(f"Obtained {len(url_map)} image URLs from Wikimedia API.")

for fname, wiki_title in files_to_fetch.items():
    fpath = os.path.join(output_dir, fname)
    download_url = url_map.get(wiki_title) or url_map.get(wiki_title.replace('_', ' '))
    if not download_url:
        print(f"Could not find URL for {wiki_title}")
        continue
    
    print(f"Downloading {fname} from {download_url}...")
    try:
        req = urllib.request.Request(download_url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as resp:
            content = resp.read()
            with open(fpath, "wb") as f:
                f.write(content)
            print(f"  ✓ Successfully saved {fname} ({len(content)} bytes)")
    except Exception as e:
        print(f"  ✗ Failed {fname}: {e}")
    time.sleep(0.5)

print("\nAll local image assets processed!")
