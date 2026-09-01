import psycopg2
import re

conn = psycopg2.connect('dbname=quiz_pocket user=abdasis host=/var/run/postgresql')
cur = conn.cursor()

# Ganti semua hotlink gambar eksternal yang terkena limit Wikimedia menjadi URL lokal statis berkecepatan tinggi
replacements = {
    # Fotosintesis
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Photosynthesis_id.svg/500px-Photosynthesis_id.svg.png": "/article-images/photosynthesis_schema.svg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Chloroplast.svg/500px-Chloroplast.svg.png": "/article-images/chloroplast_structure.svg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Reaksi_gelapedit_copy.png/500px-Reaksi_gelapedit_copy.png": "/article-images/calvin_cycle.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Seawifs_global_biosphere.jpg/500px-Seawifs_global_biosphere.jpg": "/article-images/global_biosphere.jpg",
    
    # Tata Surya
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Planets2008-id.jpg/500px-Planets2008-id.jpg": "/article-images/solar_system_scale.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Solarsys.svg/500px-Solarsys.svg.png": "/article-images/inner_solar_system.svg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Kuiper_belt_-_Oort_cloud-en.svg/500px-Kuiper_belt_-_Oort_cloud-en.svg.png": "/article-images/kuiper_oort.svg",
    
    # Pencernaan SMP
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Digestive_system_diagram_id.svg/500px-Digestive_system_diagram_id.svg.png": "/article-images/digestive_system.svg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Stomach_diagram-id.svg/500px-Stomach_diagram-id.svg.png": "/article-images/stomach_structure.svg",
}

cur.execute("SELECT id, slug, content FROM articles")
rows = cur.fetchall()

for aid, slug, content in rows:
    new_content = content
    # Hapus gambar finansial 404
    new_content = re.sub(r'!\[.*?\]\(https://upload\.wikimedia\.org/.*?Compound_interest.*?\)\n*', '', new_content)
    new_content = re.sub(r'!\[.*?\]\(https://upload\.wikimedia\.org/.*?Personal_finance.*?\)\n*', '', new_content)
    
    for old_url, new_url in replacements.items():
        new_content = new_content.replace(old_url, new_url)
    
    if new_content != content:
        cur.execute("UPDATE articles SET content = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s", (new_content, aid))
        print(f"Updated article {aid} ({slug}) with local static image assets!")

conn.commit()
print("All database image links updated to reliable local static assets!")
