import psycopg2

conn = psycopg2.connect('dbname=quiz_pocket user=abdasis host=/var/run/postgresql')
cur = conn.cursor()

title = "Bioteknologi Pangan & Lingkungan: Fermentasi Mikroorganisme, Tempe, dan Rekayasa Modern"
slug = "bioteknologi-pangan-dan-lingkungan-kurikulum-merdeka"
category = "Biologi SMP"
level = "SMP"
icon = "FlaskConical"
read_time = 9
summary = "Materi esensial IPA SMP Kurikulum Merdeka mengenai pemanfaatan mikroorganisme dalam bioteknologi konvensional pangan lokal (tempe, tapai, yogurt), peran ragi Saccharomyces, serta pengenalan bioteknologi modern."

content = """Dalam Capaian Pembelajaran IPA SMP **Kurikulum Merdeka**, materi **Bioteknologi** menempati posisi sentral karena memadukan konsep biologi sel, proses biokimia mikroorganisme, kearifan pangan lokal Nusantara, serta rekayasa sains modern untuk memecahkan krisis ketahanan pangan dan lingkungan.

![Hifa Jamur Rhizopus oligosporus Menyelimuti Biji Kedelai Menjadi Tempe](/article-images/tempeh_rhizopus.jpg)

Bioteknologi secara harfiah adalah cabang ilmu biologi terapan yang memanfaatkan makhluk hidup—khususnya mikroorganisme seperti bakteri, ragi, dan kapang—atau produk turunannya untuk menghasilkan barang dan jasa yang bermanfaat bagi kesejahteraan manusia.

---

## 1. Komparasi Bioteknologi Konvensional vs Modern

Berdasarkan tingkat kompleksitas teknologi dan manipulasi genetik yang digunakan, bioteknologi terbagi menjadi dua cabang utama:

### A. Bioteknologi Konvensional (Tradisional)
- Menggunakan mikroorganisme hidup secara utuh secara langsung tanpa mengubah struktur DNA/genetiknya.
- Mengandalkan prinsip **fermentasi** alami dengan peralatan dan teknologi yang sederhana.
- Telah dipraktikkan secara turun-temurun oleh nenek moyang bangsa Indonesia (misal: pembuatan tempe, oncom, kecap, tapai, nata de coco).

### B. Bioteknologi Modern
- Melibatkan manipulasi tingkat molekuler pada struktur materi genetik (**Rekayasa Genetika / Rekombinasi DNA**).
- Membutuhkan peralatan canggih, kondisi laboratorium steril, dan biaya riset yang tinggi.
- Contoh Produk: Produksi hormon insulin manusia oleh bakteri *Escherichia coli*, tanaman transgenik tahan hama, kloning hewan, dan kultur jaringan tanaman.

---

## 2. Prinsip Fermentasi dan Mikroorganisme Pangan Khas Indonesia

Fermentasi adalah proses biokimia penguraian senyawa organik kompleks (seperti karbohidrat dan protein) oleh enzim mikroorganisme dalam kondisi anaerob (tanpa oksigen bebas):

![Mikrograf Sel Ragi Saccharomyces cerevisiae (Khamir Fermentasi)](/article-images/yeast_saccharomyces.jpg)

### Mikroorganisme Penting dalam Pangan Nusantara:
1. **Tempe (*Rhizopus oligosporus & Rhizopus oryzae*):**  
   Miselium/hifa jamur kapang menembus dan merajut biji kedelai rebus menjadi satu kesatuan padat putih. Enzim protease jamur mendegradasi protein kompleks kedelai menjadi asam amino bebas yang jauh lebih mudah dicerna dan diserap oleh usus manusia.
2. **Tapai Singkong & Ketan (*Saccharomyces cerevisiae*):**  
   Ragi mengubah pati/amilum singkong menjadi glukosa, lalu memfermentasikannya lebih lanjut menjadi alkohol (etanol) dan gas karbon dioksida (CO₂), memberikan rasa manis, legit, dan aroma khas.
3. **Yogurt (*Lactobacillus bulgaricus & Streptococcus thermophilus*):**  
   Bakteri asam laktat memfermentasi gula laktosa susu menjadi asam laktat. Peningkatan keasaman menyebabkan koagulasi protein kasein susu, menghasilkan tekstur kental dan rasa asam segar yang menyehatkan mikrobioma pencernaan.
4. **Nata de Coco (*Acetobacter xylinum*):**  
   Bakteri asam cuka ini mengubah gula dalam air kelapa menjadi anyaman serat selulosa murni berwarna putih kenyal yang kaya serat pangan alami.
5. **Kecap Kedelai (*Aspergillus wentii & Aspergillus oryzae*):**  
   Kapang merombak protein kedelai hitam dalam proses fermentasi moromi berkadar garam tinggi untuk menghasilkan cairan asam amino bercita rasa gurih umami alami.

---

## 3. Bioteknologi untuk Pelestarian Lingkungan

Bioteknologi tidak hanya diaplikasikan pada sektor pangan, melainkan juga memainkan peran vital dalam remediasi polusi lingkungan:

- **Bioremediasi:** Pemanfaatan bakteri khusus (seperti *Pseudomonas putida*) untuk membersihkan tumpahan minyak mentah di laut dengan cara mendegradasi senyawa hidrokarbon beracun menjadi karbon dioksida dan air yang aman bagi ekosistem.
- **Bioplastik (Plastik Biodegradable):** Pembuatan polimer ramah lingkungan berbasis pati singkong atau sintesis *Polyhydroxyalkanoates* (PHA) oleh bakteri yang dapat terurai alami oleh tanah dalam hitungan minggu.
- **Biogas:** Pengolahan limbah kotoran ternak oleh bakteri metanogen (*Methanobacterium*) di dalam biodigester tertutup menghasilkan gas metana (CH₄) sebagai sumber energi memasak alternatif pengganti LPG.

---

## Rangkuman Konsep Bioteknologi SMP Kurikulum Merdeka

| Bahan Baku | Mikroorganisme Agen | Tipe Organisme | Produk Jadi |
| :--- | :--- | :--- | :--- |
| **Kedelai Rebus** | *Rhizopus oligosporus* | Kapang / Jamur | Tempe |
| **Singkong / Ketan**| *Saccharomyces cerevisiae* | Ragi / Khamir | Tapai |
| **Susu Sapi Cair** | *Lactobacillus bulgaricus* | Bakteri Asam Laktat | Yogurt |
| **Air Kelapa** | *Acetobacter xylinum* | Bakteri Selulosa | Nata de Coco |
| **Kedelai Hitam** | *Aspergillus wentii* | Jamur Kapang | Kecap |
| **Tumpahan Minyak** | *Pseudomonas putida* | Bakteri Pengurai | Bioremediasi Laut |

---

## Referensi & Sumber Belajar Terverifikasi

1. [Gramedia Literasi - Bioteknologi Konvensional dan Bioteknologi Modern](https://www.gramedia.com/literasi/bioteknologi/)
2. [Badan Riset dan Inovasi Nasional (BRIN) - Inovasi Fermentasi Pangan dan Penguatan Pangan Lokal](https://www.brin.go.id/news/111818/brin-kembangkan-inovasi-fermentasi-pangan-berkelanjutan)
3. [Wikipedia Bahasa Indonesia - Bioteknologi: Sejarah dan Cabang Penerapan](https://id.wikipedia.org/wiki/Bioteknologi)
4. [Wikipedia Bahasa Indonesia - Rhizopus oligosporus dan Fermentasi Tempe](https://id.wikipedia.org/wiki/Rhizopus_oligosporus)
"""

cur.execute("""
INSERT INTO articles (title, slug, category, level, icon, read_time_minutes, summary, content, created_at, updated_at)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (slug) DO UPDATE 
SET title = EXCLUDED.title,
    category = EXCLUDED.category,
    level = EXCLUDED.level,
    icon = EXCLUDED.icon,
    read_time_minutes = EXCLUDED.read_time_minutes,
    summary = EXCLUDED.summary,
    content = EXCLUDED.content,
    updated_at = CURRENT_TIMESTAMP;
""", (title, slug, category, level, icon, read_time, summary, content))

conn.commit()
cur.close()
conn.close()
print("Inserted SMP Biotechnology Kurikulum Merdeka chapter successfully!")
