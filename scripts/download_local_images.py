import urllib.request
import time
import os
import re
import psycopg2

output_dir = "/home/abdasis/Projects/quiz-pocket/apps/web/public/article-images"
os.makedirs(output_dir, exist_ok=True)

# URL mapping gambar dengan Wikimedia API/User-Agent sesuai guideline Wikimedia
headers = {
    'User-Agent': 'QuizPocketBot/1.0 (https://quiz.abdasis.my.id; id.abdasis@gmail.com) Python-urllib'
}

# Image targets with clear local file names
images_to_download = {
    "photosynthesis_schema.png": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Photosynthesis_id.svg/640px-Photosynthesis_id.svg.png",
    "chloroplast_structure.png": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Chloroplast_diagram-id.svg/640px-Chloroplast_diagram-id.svg.png",
    "calvin_cycle.png": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Reaksi_gelapedit_copy.png/640px-Reaksi_gelapedit_copy.png",
    "global_biosphere.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Seawifs_global_biosphere.jpg/640px-Seawifs_global_biosphere.jpg",
    "solar_system_scale.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Planets2008-id.jpg/640px-Planets2008-id.jpg",
    "inner_solar_system.png": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Solarsys.svg/640px-Solarsys.svg.png",
    "kuiper_oort.png": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Kuiper_belt_-_Oort_cloud-en.svg/640px-Kuiper_belt_-_Oort_cloud-en.svg.png",
    "digestive_system.png": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Digestive_system_diagram_id.svg/640px-Digestive_system_diagram_id.svg.png",
    "stomach_diagram.png": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Stomach_diagram-id.svg/640px-Stomach_diagram-id.svg.png",
    "circulatory_system.png": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Circulatory_System_en.svg/640px-Circulatory_System_en.svg.png",
    "heart_anatomy.png": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Diagram_of_the_human_heart_%28cropped%29.svg/640px-Diagram_of_the_human_heart_%28cropped%29.svg.png",
    "plate_tectonics.png": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Plates_tect2_id.svg/640px-Plates_tect2_id.svg.png",
    "earth_atmosphere.png": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Atmospheric_layers-id.svg/640px-Atmospheric_layers-id.svg.png",
}

for fname, url in images_to_download.items():
    fpath = os.path.join(output_dir, fname)
    if not os.path.exists(fpath) or os.path.getsize(fpath) < 1000:
        print(f"Downloading {fname} from {url}...")
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = resp.read()
                with open(fpath, "wb") as f:
                    f.write(data)
                print(f"  ✓ Saved {fname} ({len(data)} bytes)")
        except Exception as e:
            print(f"  ✗ Failed {fname}: {e}")
        time.sleep(1) # respectful rate limit
    else:
        print(f"Already exists: {fname} ({os.path.getsize(fpath)} bytes)")
