import psycopg2

conn = psycopg2.connect('dbname=quiz_pocket user=abdasis host=/var/run/postgresql')
cur = conn.cursor()

# 1. Update Artikel Tata Surya: Rumus Hukum Kepler bersih tanpa raw LaTeX
cur.execute("SELECT content FROM articles WHERE slug = 'tata-surya-dan-gravitasi-planet'")
content_solar = cur.fetchone()[0]

# Ganti rumus LaTeX dengan format formula balok bersih Unicode
kepler_formula_raw = "$$\\frac{T_1^2}{a_1^3} = \\frac{T_2^2}{a_2^3} = \\text{Konstanta}$$"
kepler_formula_clean = """```text
          (T₁)²       (T₂)²
        ───────── = ───────── = Konstanta
          (a₁)³       (a₂)³
```
*(Keterangan: T = periode orbit revolusi planet, a = jarak sumbu semi-mayor dari Matahari)*"""

content_solar = content_solar.replace(
    "$$\\frac{T_1^2}{a_1^3} = \\frac{T_2^2}{a_2^3} = \\text{Konstanta}$$",
    kepler_formula_clean
).replace(
    "$$\x0crac{T_1^2}{a_1^3} = \x0crac{T_2^2}{a_2^3} = \text{Konstanta}$$",
    kepler_formula_clean
)

# Bersihkan juga jika ada sisa escaped LaTeX
import re
content_solar = re.sub(r'\$\$.*?rac.*?Konstanta.*?\$\$', kepler_formula_clean, content_solar, flags=re.DOTALL)

cur.execute("""
UPDATE articles 
SET content = %s,
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'tata-surya-dan-gravitasi-planet';
""", (content_solar,))

# 2. Update Artikel Finansial: Rumus Future Value bersih
cur.execute("SELECT content FROM articles WHERE slug = 'manajemen-keuangan-dan-diversifikasi-investasi'")
content_finance = cur.fetchone()[0]

finance_formula_clean = """```text
         FV = PV × (1 + r)ⁿ
```
*(di mana FV = nilai masa depan, PV = nilai modal saat ini, r = tingkat imbal hasil per periode, dan n = jumlah periode waktu)*"""

content_finance = re.sub(r'\$\$FV = PV.*?\$\$', finance_finance_clean := """```text
         FV = PV × (1 + r)ⁿ
```""", content_finance, flags=re.DOTALL)

cur.execute("""
UPDATE articles 
SET content = %s,
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'manajemen-keuangan-dan-diversifikasi-investasi';
""", (content_finance,))

# 3. Bersihkan gas kimia di artikel lain menjadi Unicode murni (CO₂, O₂, O₃)
for slug in ['sistem-peredaran-darah-dan-organ-vital-manusia', 'struktur-bumi-dan-fenomena-geologi']:
    cur.execute("SELECT content FROM articles WHERE slug = %s", (slug,))
    row = cur.fetchone()
    if row:
        c = row[0]
        c = c.replace("($CO_2$)", "(CO₂)").replace("($O_2$)", "(O₂)").replace("($O_3$)", "(O₃)")
        cur.execute("UPDATE articles SET content = %s, updated_at = CURRENT_TIMESTAMP WHERE slug = %s", (c, slug))

conn.commit()
print("All LaTeX formulas successfully converted to clean Unicode & responsive ASCII blocks!")
