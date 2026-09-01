import psycopg2

conn = psycopg2.connect('dbname=quiz_pocket user=abdasis host=/var/run/postgresql')
cur = conn.cursor()

cur.execute("""
UPDATE articles 
SET content = REPLACE(REPLACE(content, '/article-images/digestive_system.svg', '/article-images/digestive_system.png'), '/article-images/stomach_structure.svg', '/article-images/stomach_structure.png'),
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'sistem-pencernaan-dan-enzim-manusia';
""")

conn.commit()
print("Updated digestive system image paths to high-res PNG!")
