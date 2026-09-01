import psycopg2

conn = psycopg2.connect('dbname=quiz_pocket user=abdasis host=/var/run/postgresql')
cur = conn.cursor()

title = "Kemagnetan & Induksi Elektromagnetik: Medan Magnet, Gaya Lorentz dan Prinsip Transformator"
slug = "kemagnetan-medan-magnet-dan-induksi-elektromagnetik"
category = "Fisika SMP"
level = "SMP"
icon = "Compass"
read_time = 9
summary = "Materi fisika SMP komprehensif mengenai sifat kutub magnet, garis gaya medan magnet, interaksi gaya Lorentz pada kawat berarus, kaidah tangan kanan, induksi elektromagnetik Faraday, generator, dan perhitungan transformator."

content = """Kemagnetan adalah salah satu fenomena fisika paling menakjubkan yang menopang seluruh peradaban teknologi modern. Dari kompas navigasi kuno para pelaut hingga motor listrik kendaraan canggih, generator pembangkit listrik skala gigawatt, kereta cepat Maglev, hingga pemindai medis MRI (*Magnetic Resonance Imaging*), semuanya berakar pada interaksi antara gejala kelistrikan dan kemagnetan (**Elektromagnetisme**).

![Pola Garis-Garis Gaya Medan Magnet Mengalir dari Kutub Utara ke Kutub Selatan](/article-images/magnetic_field_bar.png)

Hans Christian Oersted (1820) dan Michael Faraday (1831) membuktikan bahwa listrik dan magnet merupakan dua sisi dari mata uang yang sama: arus listrik dapat menghasilkan medan magnet, dan sebaliknya perubahan medan magnet dapat menghasilkan arus listrik.

---

## 1. Sifat-Sifat Magnet dan Medan Magnet Bumi

Setiap magnet memiliki dua kutub yang tidak terpisahkan, yaitu **Kutub Utara (U)** dan **Kutub Selatan (S)**:

- **Hukum Interaksi Kutub:** Kutub yang senama akan saling tolak-menolak (U-U atau S-S), sedangkan kutub yang berlainan nama akan saling tarik-menarik (U-S).
- **Garis-Garis Gaya Magnet:** Ruang di sekitar magnet yang masih dipengaruhi gaya magnet disebut **Medan Magnet**. Arah garis gaya magnet disepakati selalu **keluar dari kutub Utara dan masuk menuju kutub Selatan**.
- **Medan Magnet Bumi:** Planet bumi bertindak sebagai magnet raksasa. Kutub utara jarum kompas tertarik ke arah utara geografis bumi karena di dekat kutub utara geografis bumi sesungguhnya terdapat **Kutub Selatan Magnetik Bumi**.

---

## 2. Gaya Lorentz dan Kaidah Tangan Kanan

Ketika seutas kawat penghantar yang dialiri arus listrik ditempatkan di dalam medan magnet eksternal, kawat tersebut akan mengalami gaya dorong mekanik yang disebut **Gaya Lorentz**:

![Kaidah Tangan Kanan Penentuan Arah Gaya Lorentz, Arus Listrik dan Medan Magnet](/article-images/right_hand_rule_lorentz.png)

Besarnya Gaya Lorentz dirumuskan:

> **Persamaan Gaya Lorentz:**  
> **F = B × I × L × sin(θ)**  
> *(Keterangan: F = Gaya Lorentz dalam Newton, B = Kuat medan magnet dalam Tesla, I = Kuat arus listrik dalam Ampere, L = Panjang kawat dalam meter, θ = Sudut antara arah arus dan medan magnet)*

### Kaidah Tangan Kanan Gaya Lorentz:
- **Ibu Jari:** Menunjukkan arah **Arus Listrik (I)**
- **Empat Jari Merapat / Telunjuk:** Menunjukkan arah **Medan Magnet (B)**
- **Telapak Tangan / Jari Tengah:** Menunjukkan arah **Gaya Lorentz (F)**

Prinsip Gaya Lorentz inilah yang digunakan untuk mengubah energi listrik menjadi energi kinetik putar pada **Motor Listrik** (kipas angin, blender, pompa air, dan mobil listrik).

---

## 3. Induksi Elektromagnetik Michael Faraday

Michael Faraday menemukan bahwa jika magnet batang digerakkan keluar-masuk kumparan kawat, maka jarum galvanometer akan menyimpang. Fenomena timbulnya beda potensial atau arus listrik pada ujung-ujung kumparan akibat **perubahan jumlah garis gaya magnet (fluks magnetik)** disebut **Induksi Elektromagnetik**:

- Beda potensial yang dihasilkan disebut **Gaya Gerak Listrik (GGL) Induksi**.
- Faktor yang memperbesar nilai GGL Induksi:
  1. Kecepatan gerak magnet / laju perubahan fluks magnetik.
  2. Jumlah lilitan kawat pada kumparan (*semakin banyak lilitan, GGL semakin besar*).
  3. Kekuatan medan magnet yang digunakan.
  4. Penyisipan inti besi lunak di dalam kumparan.

Prinsip induksi elektromagnetik menjadi dasar kerja **Generator Listrik / Dinamo** (mengubah energi gerak mekanik menjadi energi listrik) pada PLTA, PLTU, dan turbin angin.

---

## 4. Prinsip Kerja dan Perhitungan Transformator (Trafo)

**Transformator (Trafo)** adalah alat listrik statis yang berfungsi menaikkan atau menurunkan tegangan arus bolak-balik (AC) berdasarkan prinsip induksi timbal balik antar-dua kumparan yang dililitkan pada satu inti besi:

![Struktur Transformator: Kumparan Primer, Kumparan Sekunder dan Inti Besi Laminasi](/article-images/transformer_core.png)

### Rumus Hubungan Matematis Transformator Ideal:
> **Persamaan Transformator:**  
> **Vp / Vs = Np / Ns = Is / Ip**  
> *(Keterangan: Vp = Tegangan primer, Vs = Tegangan sekunder, Np = Lilitan primer, Ns = Lilitan sekunder, Ip = Arus primer, Is = Arus sekunder)*

### Jenis-Jenis Transformator:
1. **Trafo Step-Up (Penaik Tegangan):**
   - $V_s > V_p$ (Tegangan sekunder lebih besar)
   - $N_s > N_p$ (Lilitan sekunder lebih banyak)
   - $I_s < I_p$ (Arus sekunder lebih kecil)
   - Digunakan di gardu induk pembangkit listrik untuk menaikkan tegangan transmisi tinggi (SUTET) guna meminimalkan disipasi rugi daya panas kabel.
2. **Trafo Step-Down (Penurun Tegangan):**
   - $V_s < V_p$ (Tegangan sekunder lebih kecil)
   - $N_s < N_p$ (Lilitan sekunder lebih sedikit)
   - $I_s > I_p$ (Arus sekunder lebih besar)
   - Digunakan pada adaptor charger smartphone, gardu distribusi listrik perumahan (menurunkan tegangan 20 kV menjadi 220V aman).

---

## Rangkuman Konsep Kemagnetan SMP

| Alat / Konsep | Prinsip Fisika | Konversi Energi | Contoh Penerapan |
| :--- | :--- | :--- | :--- |
| **Gaya Lorentz** | $F = B \cdot I \cdot L$ | Energi Listrik -> Energi Gerak | Motor listrik, Kipas angin |
| **Induksi Faraday** | Perubahan Fluks Magnet | Energi Gerak -> Energi Listrik | Generator PLTA, Dinamo sepeda |
| **Trafo Step-Up** | $N_s > N_p, V_s > V_p$ | Penaik Tegangan AC | Transmisi jarak jauh SUTET |
| **Trafo Step-Down** | $N_s < N_p, V_s < V_p$ | Penurun Tegangan AC | Charger HP, Elektronik rumah |

---

## Referensi & Sumber Belajar Terverifikasi

1. [Gramedia Literasi - Medan Magnet: Pengertian, Sifat, dan Penerapannya](https://www.gramedia.com/literasi/medan-magnet/)
2. [Gramedia Literasi - Gaya Lorentz: Pengertian, Rumus, dan Kaidah Tangan Kanan](https://www.gramedia.com/literasi/gaya-lorentz/)
3. [Wikipedia Bahasa Indonesia - Induksi Elektromagnetik dan Hukum Faraday](https://id.wikipedia.org/wiki/Induksi_elektromagnetik)
4. [Wikipedia Bahasa Indonesia - Transformator: Komponen dan Efisiensi Daya Listrik](https://id.wikipedia.org/wiki/Transformator)
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
print("Inserted SMP Magnetism & Transformer chapter successfully!")
