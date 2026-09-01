import psycopg2

conn = psycopg2.connect('dbname=quiz_pocket user=abdasis host=/var/run/postgresql')
cur = conn.cursor()

title = "Fisika Modern: Teori Relativitas Khusus Einstein dan Dualisme Gelombang-Partikel"
slug = "fisika-modern-relativitas-dan-kuantum"
category = "Fisika SMA"
level = "SMA"
icon = "Atom"
read_time = 10
summary = "Materi fisika SMA tingkat lanjut mengenai postulat relativitas khusus Einstein, dilatasi waktu, kesetaraan massa-energi E=mc², efek fotolistrik, serta dualitas cahaya de Broglie."

content = """Memasuki awal abad ke-20, fisika klasik Newton dan elektrodinamika Maxwell menghadapi krisis konseptual ketika gagal menjelaskan fenomena radiasi benda hitam, kestabilan orbit elektron, dan kecepatan cahaya yang selalu konstan. Kebuntuan ini melahirkan revolusi **Fisika Modern** yang dipelopori oleh Max Planck dan Albert Einstein, merombak pemahaman manusia tentang hakikat ruang, waktu, materi, dan radiasi cahaya.

![Ilustrasi Eksperimen Efek Fotolistrik dan Emisi Elektron](/article-images/photoelectric_effect.png)

Fisika modern menjadi fondasi dasar bagi penciptaan seluruh teknologi mutakhir abad ke-21: mulai dari sensor kamera digital, panel surya fotovoltaik, tomografi medis PET-scan, navigasi satelit GPS, hingga laser dan superkomputer kuantum.

---

## 1. Dua Postulat Teori Relativitas Khusus Einstein (1905)

Albert Einstein meruntuhkan konsep ruang dan waktu mutlak Newton melalui **Teori Relativitas Khusus** yang bertumpu pada dua postulat fundamental:

1. **Postulat I (Prinsip Relativitas):** Hukum-hukum fisika memiliki bentuk yang identik dalam semua kerangka acuan inersial (kerangka yang diam atau bergerak dengan kecepatan konstan).
2. **Postulat II (Invariansi Kecepatan Cahaya):** Kecepatan cahaya di ruang hampa (*c ≈ 3 × 10⁸ m/s*) adalah konstan mutlak bagi semua pengamat, tidak bergantung pada gerak sumber cahaya maupun gerak pengamat.

---

## 2. Konsekuensi Relativitas: Dilatasi Waktu dan Kontraksi Panjang

Ketika suatu benda atau pengamat bergerak dengan kecepatan relativistik mendekati kecepatan cahaya (*v → c*), faktor koreksi Lorentz (**γ**) mulai mendominasi:

> **Faktor Relativistik Lorentz (γ):**  
> **γ = 1 / √(1 - v² / c²)**  
> *(Ketika v << c maka γ ≈ 1; ketika v mendekati c maka γ melonjak tak hingga)*

![Diagram Dilatasi Waktu pada Kerangka Relativistik Bergerak](/article-images/time_dilation.png)

### Fenomena Relativistik Utama:
- **Dilatasi Waktu (Time Dilation):** Selang waktu yang diukur oleh pengamat yang bergerak (*Δt*) akan teramati berjalan lebih lambat dibandingkan selang waktu pengamat diam (*Δt₀*):
  > **Δt = γ × Δt₀ = Δt₀ / √(1 - v²/c²)**  
  *(Contoh Nyata: Jam atom di satelit GPS bergerak melintasi orbit dengan kecepatan tinggi sehingga mengalami pergeseran waktu mikrodetik harian yang wajib dikoreksi oleh algoritma relativitas agar koordinat peta bumi tetap presisi).*
- **Kontraksi Panjang (Lorentz Contraction):** Panjang benda yang bergerak sejajar arah geraknya akan teramati lebih pendek oleh pengamat diam:
  > **L = L₀ / γ = L₀ × √(1 - v²/c²)**
- **Kesetaraan Massa dan Energi (*E = mc²*):** Einstein membuktikan bahwa massa adalah wujud materi dari energi yang terkonsentrasi sangat padat:
  > **E_total = m_relativistik × c² = γ × m₀ × c² = E₀ + Ek**  
  > **E₀ = m₀ × c²** *(Energi Diam)*  
  *(Prinsip ini menjadi dasar pelepasan energi mahadahsyat pada reaksi fusi nuklir bintang matahari dan pembangkit listrik tenaga nuklir / PLTN).*

---

## 3. Efek Fotolistrik dan Paket Energi Kuantum Foton

Pada tahun 1900, Max Planck mengusulkan hipotesis radikal bahwa radiasi elektromagnetik tidak dipancarkan secara kontinu, melainkan dalam bentuk paket-paket energi diskret yang disebut **kuanta**.

Albert Einstein (1905) memperluas teori ini untuk memecahkan teka-teki **Efek Fotolistrik** (peristiwa terlepasnya elektron dari permukaan logam ketika disinari cahaya):

- Cahaya dipandang sebagai arus partikel foton berenergi:
  > **E_foton = h × f = h × (c / λ)**  
  *(Keterangan: h = Konstanta Planck ≈ 6,63 × 10⁻³⁴ J·s, f = Frekuensi gelombang cahaya dalam Hz, λ = Panjang gelombang)*
- **Fungsi Kerja Logam (*W₀ / Φ*):** Energi minimum yang dibutuhkan untuk melepaskan satu elektron dari ikatan atom logam (*W₀ = h × f₀*).
- **Persamaan Kekekalan Energi Fotolistrik Einstein:**
  > **Ek_maks = E_foton - W₀ = h(f - f₀)**  
  *(Elektron hanya dapat terlepas jika frekuensi cahaya melebihi frekuensi ambang: f > f₀, berapapun lemahnya intensitas cahaya tersebut).*

Karya perintis efek fotolistrik inilah yang mengantarkan Albert Einstein meraih Hadiah Nobel Fisika pada tahun 1921 dan melahirkan teknologi sensor optoelektronik modern.

---

## 4. Dualisme Gelombang-Partikel Louis de Broglie

Fisikawan Prancis Louis de Broglie (1924) mengajukan ide simetris alam yang revolusioner: jika cahaya yang selama ini dikenal sebagai gelombang dapat berperilaku seperti partikel (memiliki momentum), maka partikel materi (seperti elektron) juga harus memiliki sifat gelombang:

> **Panjang Gelombang de Broglie:**  
> **λ = h / p = h / (m × v)**  
> *(Keterangan: λ = Panjang gelombang materi, h = Konstanta Planck, p = Momentum linier partikel = m · v)*

Sifat gelombang dari elektron dibuktikan secara eksperimental oleh Davisson dan Germer melalui difraksi berkas elektron pada kristal nikel. Penemuan ini mendasari terciptanya **Mikroskop Elektron (TEM/SEM)** yang memiliki daya pisah dan perbesaran hingga jutaan kali lipat melampaui batas difraksi mikroskop optik biasa.

---

## Rangkuman Konsep Fisika Modern SMA

| Teori / Fenomena | Tokoh Penemu | Persamaan Kunci | Signifikansi Teknologi |
| :--- | :--- | :--- | :--- |
| **Relativitas Khusus** | Albert Einstein (1905) | Δt = γ · Δt₀ | Kalibrasi satelit navigasi GPS |
| **Kesetaraan Massa-Energi**| Albert Einstein | E = m · c² | Fusi bintang, energi reaktor nuklir |
| **Kuantisasi Energi** | Max Planck (1900) | E = n · h · f | Spektroskopi dan termodinamika kuantum |
| **Efek Fotolistrik** | Albert Einstein (1905) | Ek = h·f - W₀ | Sel surya, sensor kamera CMOS |
| **Dualitas Gelombang Materi**| Louis de Broglie (1924)| λ = h / (m·v) | Mikroskop elektron, semikonduktor chip |

---

## Referensi & Sumber Belajar Terverifikasi

1. [Sampoerna Academy - Pengertian Fisika Kuantum, Teori Gelombang dan Partikel](https://www.sampoernaacademy.sch.id/id/fisika-kuantum/)
2. [Gramedia Literasi - Perkembangan Teori Atom dan Model Kuantum](https://www.gramedia.com/literasi/teori-atom/)
3. [Wikipedia Bahasa Indonesia - Teori Relativitas Khusus Einstein dan Dilatasi Waktu](https://id.wikipedia.org/wiki/Relativitas_khusus)
4. [Wikipedia Bahasa Indonesia - Efek Fotolistrik dan Kuantisasi Cahaya](https://id.wikipedia.org/wiki/Efek_fotolistrik)
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
print("Inserted SMA Modern Physics chapter successfully!")
