import psycopg2

conn = psycopg2.connect('dbname=quiz_pocket user=abdasis host=/var/run/postgresql')
cur = conn.cursor()

title = "Optika & Cahaya: Pemantulan, Pembiasan Hukum Snellius, Lensa dan Penglihatan Mata"
slug = "optika-cahaya-pembiasan-lensa-dan-mata"
category = "Fisika SMP"
level = "SMP"
icon = "Eye"
read_time = 9
summary = "Materi fisika optika esensial SMP mengenai sifat gelombang elektromagnetik cahaya, hukum pemantulan, pembiasan Snellius, pembentukan bayangan lensa cembung/cekung, serta mekanisme akomodasi mata manusia."

content = """Cahaya merupakan bentuk radiasi gelombang elektromagnetik transversal kasat mata yang memungkinkan manusia dan organisme lain melihat keindahan alam semesta. Tanpa cahaya, proses fotosintesis tumbuhan akan terhenti, siklus rantai makanan musnah, dan bumi akan menjadi dunia yang gelap gulita serta beku.

![Diagram Pembiasan Berkas Sinar Berdasarkan Hukum Snellius](/article-images/snell_law.png)

Cabang ilmu fisika yang mempelajari sifat-sifat perambatan cahaya, interaksinya dengan materi, serta perancangan alat-alat optik pembantu penglihatan disebut **Optika**.

---

## 1. Sifat-Sifat Fundamental Gelombang Cahaya

Cahaya merambat dengan kecepatan tertinggi di alam semesta (*c ≈ 300.000 km/detik* di ruang hampa) dan memiliki karakteristik fisika khas:

1. **Merambat Lurus:** Cahaya selalu merambat dalam garis lurus pada medium yang homogen, menghasilkan bayangan gelap (*umbra*) di balik benda tak tembus cahaya.
2. **Dapat Dipantulkan (*Refleksi*):** Memantul ketika mengenai permukaan pembatas dua medium.
3. **Dapat Dibiaskan (*Refraksi*):** Mengalami pembelokan arah rambat saat menembus perbatasan dua medium yang berbeda kerapatan optiknya.
4. **Dapat Diuraikan (*Dispersi*):** Cahaya polikromatik putih (seperti sinar matahari) dapat diuraikan oleh prisma kaca menjadi spektrum warna monokromatik pelangi (Merah, Jingga, Kuning, Hijau, Biru, Nila, Ungu).

---

## 2. Hukum Pemantulan dan Pembiasan (Hukum Snellius)

### A. Hukum Pemantulan Cahaya (Hukum Snellius Pemantulan)
- Sinar datang, garis normal, dan sinar pantul terletak pada satu bidang datar yang sama.
- **Sudut Datang (*i*) sama besar dengan Sudut Pantul (*r*):**  
  > **i = r**

### B. Hukum Pembiasan Cahaya (Hukum Snellius Pembiasan)
Pembiasan terjadi karena kecepatan cahaya berubah ketika berpindah medium:

- **Mendekati Garis Normal:** Jika sinar merambat dari medium renggang optik ke medium lebih rapat (misal: dari **Udara ke Air**), laju cahaya melambat sehingga berkas sinar dibelokkan *mendekati* garis normal (*i > r*).
- **Menjauhi Garis Normal:** Jika sinar merambat dari medium rapat ke medium lebih renggang (misal: dari **Kaca ke Udara**), laju cahaya meningkat sehingga berkas sinar dibelokkan *menjauhi* garis normal (*i < r*).

> **Persamaan Indeks Bias Snellius:**  
> **n₁ × sin(i) = n₂ × sin(r)**  
> *(Keterangan: n₁ = indeks bias medium asal, n₂ = indeks bias medium tujuan, i = sudut datang, r = sudut bias)*

---

## 3. Pembentukan Bayangan pada Lensa Cembung dan Cekung

Lensa adalah benda bening transparan dengan permukaan lengkung yang mampu mengumpulkan atau menyebarkan berkas sinar cahaya:

![Diagram Pembentukan Titik Fokus F pada Lensa Cembung Konvergen](/article-images/convex_lens_focus.png)

### A. Lensa Cembung (Konvergen / Positif)
- Bagian tengah lensa lebih tebal daripada bagian tepinya.
- Bersifat **mengumpulkan berkas sinar cahaya** (*konvergen*) ke satu titik fokus nyata (*F bernilai positif*).
- Digunakan pada kaca pembesar (lup), proyektor, lensa kamera, mikroskop, dan kacamata penderita rabun dekat (hipermetropi).

### B. Lensa Cekung (Divergen / Negatif)
- Bagian tengah lensa lebih tipis daripada bagian tepinya.
- Bersifat **menyebarkan berkas sinar cahaya** (*divergen*) dari titik fokus maya (*F bernilai negatif*).
- Bayangan yang dibentuk selalu bersifat: **Maya, Tegak, dan Diperkecil**. Digunakan pada lensa kacamata penderita rabun jauh (miopi).

> **Rumus Utama Hubungan Jarak Lensa:**  
> **1/f = 1/s + 1/s'**  
> *(Keterangan: f = jarak titik fokus, s = jarak benda ke lensa, s' = jarak bayangan ke lensa)*

---

## 4. Mekanisme Optik Mata Manusia dan Cacat Penglihatan

Mata manusia bekerja persis seperti kamera optik tercanggih:

![Anatomi Optik Mata Manusia: Kornea, Pupil, Lensa Kristalin dan Retina](/article-images/eye_anatomy_optics.png)

1. **Kornea & Humor Aqueous:** Lapisan terluar transparan yang melakukan pembiasan awal cahaya.
2. **Pupil & Iris:** Iris mengatur diameter pupil untuk mengontrol intensitas cahaya yang masuk (membesar di tempat gelap, mengecil di tempat terang).
3. **Lensa Kristalin Mata:** Lensa cembung fleksibel yang dapat mencembung atau memipih (*daya akomodasi mata*) berkat tarikan otot siliaris agar bayangan jatuh tepat di **Retina**.
4. **Retina:** Layar penerima bayangan yang tersusun atas jutaan sel fotoreseptor (*sel batang/rod* untuk penglihatan remang dan *sel kerucut/cone* untuk penglihatan warna). Sifat bayangan yang jatuh di retina adalah **Nyata, Terbalik, dan Diperkecil**, yang kemudian diterjemahkan tegak oleh otak.

### Kelainan Refraksi Mata:
- **Miopi (Rabun Jauh):** Bola mata terlalu lonjong atau lensa terlalu cembung sehingga bayangan jatuh di *depan retina*. Ditolong dengan **kacamata lensa cekung (negatif)**.
- **Hipermetropi (Rabun Dekat):** Bola mata terlalu pipih sehingga bayangan jatuh di *belakang retina*. Ditolong dengan **kacamata lensa cembung (positif)**.
- **Presbiopi (Mata Tua):** Berkurangnya elastisitas daya akomodasi lensa mata akibat penuaan, ditolong kacamata lensa rangkap (bifokal).

---

## Rangkuman Konsep Optika SMP

| Alat / Komponen | Sifat Berkas Sinar | Karakteristik Bayangan | Fungsi Penggunaan |
| :--- | :--- | :--- | :--- |
| **Lensa Cembung** | Mengumpulkan (*Konvergen*) | Nyata/Maya (Tergantung jarak)| Lup, Kamera, Mikroskop |
| **Lensa Cekung** | Menyebarkan (*Divergen*) | Maya, Tegak, Diperkecil | Kacamata Rabun Jauh (Miopi) |
| **Lensa Mata** | Akomodasi Fleksibel | Nyata, Terbalik, Diperkecil | Memfokuskan objek ke Retina |
| **Retina Mata** | Fotoreseptor Batang & Kerucut | Menangkap bayangan objek | Mengirim sinyal ke saraf optik |

---

## Referensi & Sumber Belajar Terverifikasi

1. [Gramedia Literasi - Pembiasan Cahaya: Pengertian, Sifat, Hukum Snellius](https://www.gramedia.com/literasi/pembiasan-cahaya/)
2. [Gramedia Literasi - 14 Sifat Cahaya Beserta Penjelasan dan Contoh Lengkap](https://www.gramedia.com/literasi/sifat-cahaya/)
3. [Wikipedia Bahasa Indonesia - Pembiasan Cahaya dan Refraksi Medium](https://id.wikipedia.org/wiki/Pembiasan)
4. [Wikipedia Bahasa Indonesia - Anatomi dan Fisiologi Optik Mata Manusia](https://id.wikipedia.org/wiki/Mata)
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
print("Inserted SMP Optics & Light chapter successfully!")
