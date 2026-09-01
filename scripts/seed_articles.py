import psycopg2
import json

conn = psycopg2.connect('dbname=quiz_pocket user=abdasis host=/var/run/postgresql')
cur = conn.cursor()

articles_data = [
    {
        "slug": "mengenal-fotosintesis-dan-klorofil",
        "title": "Fotosintesis: Dapur Hijau Tumbuhan Penghasil Oksigen Bumi",
        "summary": "Bagaimana daun hijau mengubah cahaya matahari, air, dan karbon dioksida menjadi energi serta oksigen bagi seluruh kehidupan di bumi.",
        "category": "Sains & Biologi",
        "level": "SD",
        "read_time_minutes": 3,
        "icon": "Leaf",
        "content": """Fotosintesis adalah proses biokimia fundamental di mana tumbuhan hijau, alga, dan beberapa jenis bakteri mengubah energi cahaya matahari menjadi energi kimia dalam bentuk glukosa (gula).

### 1. Komponen Utama Fotosintesis
Untuk melangsungkan fotosintesis, tumbuhan membutuhkan tiga bahan baku utama:
- **Klorofil:** Pigmen hijau pada kloroplas daun yang bertugas menyerap radiasi gelombang cahaya matahari.
- **Karbon Dioksida ($CO_2$):** Gas yang diserap dari udara bebas melalui pori-pori mikroskopis pada permukaan daun yang disebut **stomata**.
- **Air ($H_2O$):** Diserap dari tanah oleh akar dan dialirkan menuju daun melalui jaringan pembuluh kayu (**xilem**).

### 2. Persamaan Reaksi
Secara kimiawi, fotosintesis dirumuskan sebagai:
$$6CO_2 + 6H_2O + \\text{Cahaya Matahari} \\rightarrow C_6H_{12}O_6 + 6O_2$$

Hasil dari reaksi ini adalah glukosa sebagai sumber makanan tumbuhan untuk bertumbuh, serta oksigen ($O_2$) yang dilepaskan ke atmosfer melalui stomata untuk pernapasan manusia dan hewan.

### 3. Mengapa Daun Berwarna Hijau?
Klorofil menyerap spektrum cahaya biru dan merah dengan sangat efisien, namun memantulkan spektrum gelombang cahaya hijau. Pantulan cahaya hijau inilah yang ditangkap oleh mata manusia sehingga sebagian besar daun tampak berwarna hijau segar.""",
        "keywords": ["klorofil", "fotosintesis", "stomata", "daun", "tumbuhan", "oksigen"]
    },
    {
        "slug": "tata-surya-dan-gravitasi-planet",
        "title": "Arsitektur Tata Surya: Orbit Planet dan Gravitasi Matahari",
        "summary": "Menjelajahi susunan delapan planet dalam tata surya kita, karakteristik planet terestrial vs raksasa gas, dan hukum gravitasi kosmis.",
        "category": "Astronomi & Fisika",
        "level": "SMP",
        "read_time_minutes": 4,
        "icon": "Globe",
        "content": """Tata surya kita adalah sistem terikat gravitasi yang terdiri dari Matahari sebagai pusat bintang induk dan seluruh objek luar angkasa yang mengitarinya.

### 1. Dua Kelompok Planet
Delapan planet dalam tata surya terbagi menjadi dua kategori besar:
- **Planet Terestrial (Kebumian):** Merkurius, Venus, Bumi, dan Mars. Planet-planet ini berukuran relatif lebih kecil dengan permukaan padat berbatu, kaya akan mineral dan logam silikat.
- **Planet Raksasa (Gas & Es):** Jupiter dan Saturnus (raksasa gas hidrogen-helium), serta Uranus dan Neptunus (raksasa es metana-amonia).

### 2. Planet Terbesar dan Planet Terpanas
- **Jupiter** merupakan planet terbesar di tata surya dengan massa 2,5 kali total gabungan seluruh planet lainnya. Jupiter memiliki badai raksasa legendaris bernama *Great Red Spot*.
- Meskipun Merkurius adalah planet terdekat dari Matahari, **Venus** justru menjadi planet paling panas (mencapai ~465°C) akibat efek rumah kaca ekstrem dari atmosfernya yang sangat tebal berisi 96% karbon dioksida.

### 3. Sabuk Asteroid & Gravitasi
Di antara orbit Mars dan Jupiter terdapat **Sabuk Asteroid**, kumpulan jutaan pecahan batuan sisa pembentukan tata surya awal yang tertahan oleh tarikan gravitasi masif Jupiter.""",
        "keywords": ["planet", "jupiter", "venus", "mars", "tata surya", "merkurius", "saturnus"]
    },
    {
        "slug": "manajemen-keuangan-dan-diversifikasi-investasi",
        "title": "Literasi Finansial: Seni Diversifikasi Portofolio dan Manajemen Risiko",
        "summary": "Memahami prinsip dasar investasi modern, pengelolaan likuiditas, inflasi, dan strategi alokasi aset untuk mitigasi risiko keuangan.",
        "category": "Finansial & Ekonomi",
        "level": "SMA",
        "read_time_minutes": 4,
        "icon": "TrendingUp",
        "content": """Literasi keuangan bukan sekadar tentang cara menghasilkan uang, melainkan seni mengalokasikan dan melindungi nilai aset dari gerusan inflasi jangka panjang.

### 1. Prinsip Emas: Jangan Menaruh Semua Telur dalam Satu Keranjang
Dalam teori portofolio modern, **diversifikasi** adalah teknik manajemen risiko yang membagi alokasi modal ke berbagai instrumen investasi yang memiliki korelasi rendah atau berbeda karakter:
- **Pasar Uang & Deposito:** Likuiditas tinggi, risiko sangat rendah, cocok untuk dana darurat.
- **Surat Berharga Negara (SBN / Obligasi):** Imbal hasil tetap dengan jaminan keamanan negara.
- **Saham & Reksadana Indeks:** Potensi pertumbuhan modal tinggi (*capital gain*) dalam jangka panjang namun memiliki volatilitas jangka pendek.

### 2. Mengapa Diversifikasi Penting?
Jika salah satu sektor industri atau instrumen mengalami penurunan drastis, instrumen lainnya yang stabil atau berkinerja positif dapat meredam kerugian total portofolio Anda.

### 3. Memahami Pajak dan Biaya Transaksi
Dalam transaksi barang dan jasa sehari-hari di Indonesia, kita mengenal **PPN (Pajak Pertambahan Nilai)** sebagai pajak konsumsi tidak langsung, serta pajak penghasilan final atas dividen atau bunga instrumen keuangan tertentu.""",
        "keywords": ["investasi", "diversifikasi", "portofolio", "pajak", "finansial", "inflasi", "ppn"]
    },
    {
        "slug": "sistem-peredaran-darah-dan-organ-vital-manusia",
        "title": "Fisiologi Tubuh: Jantung, Pembuluh Darah, dan Pengaturan Glukosa",
        "summary": "Eksplorasi mendalam bagaimana organ vital manusia bekerja secara simultan memompa oksigen, menyaring racun, dan mengontrol gula darah.",
        "category": "Biologi & Kedokteran",
        "level": "SMP",
        "read_time_minutes": 4,
        "icon": "Heart",
        "content": """Tubuh manusia tersusun dari miliaran sel yang membutuhkan pasokan nutrisi, oksigen, dan sistem komunikasi hormonal yang presisi setiap detik.

### 1. Sistem Sirkulasi Darah
Jantung manusia memiliki empat ruang (dua serambi / atrium dan dua bilik / ventrikel):
- **Bilik Kiri (Ventrikel Kiri):** Bagian jantung dengan dinding otot paling tebal karena bertugas memompa darah kaya oksigen ke seluruh tubuh melalui pembuluh nadi utama (**Aorta**).
- **Pembuluh Vena (Balik):** Membawa darah kaya karbon dioksida kembali menuju jantung.

### 2. Pankreas dan Pengaturan Gula Darah
Pankreas memegang peran ganda sebagai kelenjar eksokrin (pencernaan) dan endokrin:
- Menghasilkan hormon **Insulin** yang bertugas memasukkan glukosa dari aliran darah ke dalam sel untuk diubah menjadi energi.
- Menghasilkan hormon **Glukagon** saat kadar gula darah turun untuk memicu pelepasan cadangan glikogen dari hati.

### 3. Ginjal sebagai Penyaring Alami
Sepasang ginjal manusia menyaring sekitar 120-150 liter darah per hari menggunakan jutaan unit penyaring mikroskopis bernama **nefron**, membuang limbah urea dan racun melalui urine.""",
        "keywords": ["jantung", "pankreas", "insulin", "darah", "organ", "ginjal", "aorta"]
    },
    {
        "slug": "sejarah-dan-wawasan-kebangsaan-indonesia",
        "title": "Tonggak Kebangsaan: Dari Sumpah Pemuda hingga Proklamasi Kemerdekaan",
        "summary": "Perjalanan historis lahirnya persatuan bangsa Indonesia, semboyan Bhinneka Tunggal Ika, dan nilai-nilai konstitusi Pancasila.",
        "category": "Sejarah & Kewarganegaraan",
        "level": "SD",
        "read_time_minutes": 3,
        "icon": "Landmark",
        "content": """Kemerdekaan dan persatuan Indonesia merupakan buah dari perjuangan panjang yang melewati berbagai momentum bersejarah penentu nasib bangsa.

### 1. Sumpah Pemuda 28 Oktober 1928
Kongres Pemuda II di Batavia melahirkan ikrar sakral **Sumpah Pemuda** yang menyatukan pemuda dari berbagai suku dan kedaerahan di Nusantara di bawah satu tanah air, satu bangsa, dan menjunjung bahasa persatuan: **Bahasa Indonesia**.

### 2. Semboyan Bhinneka Tunggal Ika
Frasa *Bhinneka Tunggal Ika* diambil dari kitab kakawin Jawa Kuno **Sutasoma** karangan **Mpu Tantular** pada masa kejayaan Kerajaan Majapahit (abad ke-14). Secara harfiah bermakna "Berbeda-beda tetapi tetap satu jua", mencerminkan toleransi dan keberagaman bangsa Indonesia.

### 3. Hak dan Kewajiban Warga Negara
Konstitusi UUD 1945 menggariskan bahwa kepatuhan terhadap hukum, seperti mematuhi peraturan dan rambu lalu lintas serta menjaga ketertiban umum, adalah **kewajiban mutlak** setiap warga negara untuk mewujudkan masyarakat yang adil dan beradab.""",
        "keywords": ["sumpah pemuda", "bhinneka", "sutasoma", "majapahit", "kewajiban", "rambu", "pancasila"]
    },
    {
        "slug": "struktur-bumi-dan-fenomena-geologi",
        "title": "Dinamika Litosfer: Lempeng Tektonik, Gunung Api, dan Lapisan Atmosfer",
        "summary": "Membedah struktur lapisan bumi dari kerak hingga inti bumi, penyebab gempa tektonik di Ring of Fire, dan fungsi lapisan atmosfer.",
        "category": "Geografi & Kebumian",
        "level": "SMA",
        "read_time_minutes": 4,
        "icon": "Mountain",
        "content": """Bumi kita adalah planet dinamis yang terus bergerak dan melepaskan energi panas dari dalam perutnya.

### 1. Lapisan Internal Bumi
- **Kerak Bumi (Crust):** Lapisan terluar tempat kehidupan berlangsung, terbagi atas lempeng benua dan samudera.
- **Mantel Bumi (Mantle):** Lapisan batuan silikat semi-cair kental (astenosfer) yang menggerakkan lempeng tektonik melalui arus konveksi panas.
- **Inti Bumi (Core):** Inti luar berwujud cairan besi-nikel yang berputar menghasilkan medan magnet bumi (magnetosfer), dan inti dalam yang padat bersuhu sangat tinggi (~5000°C).

### 2. Cincin Api Pasifik (Ring of Fire)
Indonesia berada tepat di pertemuan tiga lempeng tektonik utama dunia: **Lempeng Indo-Australia, Eurasia, dan Pasifik**. Posisi ini menjadikan kawasan Nusantara kaya akan gunung api aktif yang menyuburkan tanah, namun sekaligus memiliki kerentanan gempa bumi tektonik dan vulkanik yang tinggi.

### 3. Lapisan Atmosfer Pelindung
Atmosfer bumi terdiri dari 5 lapisan utama: Troposfer (tempat cuaca), Stratosfer (lapisan ozon penangkal UV), Mesosfer (pembakar meteor), Termosfer / Ionosfer (pemantul sinyal radio dan aurora), dan Eksosfer (perbatasan luar angkasa).""",
        "keywords": ["lempeng", "bumi", "atmosfer", "stratosfer", "gunung", "gempa", "troposfer"]
    }
]

for art in articles_data:
    cur.execute("""
    INSERT INTO articles (slug, title, summary, content, category, level, read_time_minutes, icon, updated_at)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
    ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        content = EXCLUDED.content,
        category = EXCLUDED.category,
        level = EXCLUDED.level,
        read_time_minutes = EXCLUDED.read_time_minutes,
        icon = EXCLUDED.icon,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id;
    """, (art["slug"], art["title"], art["summary"], art["content"], art["category"], art["level"], art["read_time_minutes"], art["icon"]))
    article_id = cur.fetchone()[0]
    
    # Hubungkan dengan soal-soal relevan di database
    matched_q_ids = set()
    for kw in art["keywords"]:
        cur.execute("SELECT id FROM questions WHERE question ILIKE %s OR explanation ILIKE %s LIMIT 5", (f'%{kw}%', f'%{kw}%'))
        for row in cur.fetchall():
            matched_q_ids.add(row[0])
            
    # Simpan relasi
    for qid in list(matched_q_ids)[:8]:
        cur.execute("""
        INSERT INTO article_questions (article_id, question_id)
        VALUES (%s, %s)
        ON CONFLICT (article_id, question_id) DO NOTHING;
        """, (article_id, qid))

conn.commit()
print("Articles seeded & linked to questions successfully!")
cur.execute("SELECT a.title, count(aq.question_id) FROM articles a LEFT JOIN article_questions aq ON a.id = aq.article_id GROUP BY a.title")
for row in cur.fetchall():
    print(f"Article '{row[0]}': {row[1]} related questions linked.")
