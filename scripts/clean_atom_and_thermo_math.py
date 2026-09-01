import psycopg2

conn = psycopg2.connect('dbname=quiz_pocket user=abdasis host=/var/run/postgresql')
cur = conn.cursor()

# 1. Update Bab Struktur Atom
atom_content = """Semua materi yang ada di alam semesta—mulai dari udara yang dihirup, air mineral, hingga tubuh manusia—tersusun atas unit-unit penyusun terkecil yang disebut **Atom**. Kata atom berasal dari bahasa Yunani *atomos* yang berarti "tidak dapat dibagi lagi", sebuah konsep filsafat yang disempurnakan menjadi sains modern yang presisi.

![Model Struktur Kulit Atom Bohr: Proton, Neutron di Inti dan Elektron di Orbit](/article-images/bohr_atom_model.png)

Pemahaman mengenai struktur atom dan hukum periodisitas unsur menjadi gerbang pembuka untuk memahami bagaimana senyawa kimia terbentuk dan bereaksi dalam kehidupan sehari-hari.

---

## 1. Tiga Partikel Dasar Penyusun Atom (Subatomik)

Di dalam satu atom terdapat tiga jenis partikel subatomik dengan sifat kelistrikan yang unik:

1. **Proton (p⁺):** Partikel bermuatan listrik **positif (+1)** bermassa 1,673 × 10⁻²⁷ kg yang berada rapat di pusat atom (**Nukleus / Inti Atom**). Ditemukan oleh Eugen Goldstein.
2. **Neutron (n⁰):** Partikel netral **tanpa muatan listrik (0)** dengan massa mirip proton, bertindak sebagai perekat inti atom dari gaya tolak-menolak antar-proton. Ditemukan oleh James Chadwick.
3. **Elektron (e⁻):** Partikel bermuatan listrik **negatif (-1)** dengan massa sangat ringan (~1/1836 massa proton) yang bergerak mengelilingi inti atom dalam lintasan kulit tertentu. Ditemukan oleh J.J. Thomson.

---

## 2. Notasi Atom: Nomor Atom dan Nomor Massa

Suatu unsur kimia dituliskan dengan lambang standar:

> **Notasi Simbol Unsur:**  
> **ᴬ_Z X**  
> *(Keterangan: X = Lambang Unsur, Z = Nomor Atom, A = Nomor Massa)*

- **Nomor Atom (Z):** Menunjukkan jumlah **proton** di dalam inti atom. Pada atom netral, jumlah proton sama dengan jumlah elektron (**Z = Proton = Elektron**).
- **Nomor Massa (A):** Menunjukkan total massa inti atom, yaitu penjumlahan jumlah **proton dan neutron** (**A = Proton + Neutron**).
- **Jumlah Neutron:** Dihitung dari selisih nomor massa dengan nomor atom (**Neutron = A - Z**).

---

## 3. Konfigurasi Elektron Model Kulit Bohr (2n²)

Niels Bohr (1913) menyempurnakan model atom Rutherford dengan menyatakan bahwa elektron mengorbit inti pada tingkat energi atau **kulit atom** tertentu tanpa memancarkan radiasi.

Kapasitas maksimum elektron yang dapat ditampung pada tiap kulit ke-*n* mengikuti rumus:

> **Kapasitas Maksimum Kulit:**  
> **Jumlah Elektron Maksimal = 2 × n²**

- **Kulit K (n = 1):** Maksimal menampung 2 × 1² = **2 elektron**
- **Kulit L (n = 2):** Maksimal menampung 2 × 2² = **8 elektron**
- **Kulit M (n = 3):** Maksimal menampung 2 × 3² = **18 elektron**
- **Kulit N (n = 4):** Maksimal menampung 2 × 4² = **32 elektron**

**Elektron Valensi:** Jumlah elektron yang menempati kulit terluar atom. Elektron valensi inilah yang menentukan sifat kimiawi dan kemampuan atom untuk berikatan dengan atom lain guna mencapai kestabilan konfigurasi gas mulia (aturan duplet 2 atau oktet 8).

---

## 4. Struktur Tabel Periodik Unsur Modern

Dmitri Mendeleev dan Henry Moseley menyusun unsur-unsur kimia ke dalam **Tabel Periodik Modern** berdasarkan kenaikan nomor atom dan kemiripan sifat kimianya:

![Tabel Periodik Unsur Kimia Modern Berdasarkan Golongan dan Periode](/article-images/periodic_table_overview.png)

- **Golongan (Kolom Vertikal):** Unsur-unsur dalam satu golongan memiliki jumlah **elektron valensi yang sama**, sehingga menunjukkan perilaku kimia yang sangat mirip (misal: Golongan IA Logam Alkali, Golongan VIIA Halogen, Golongan VIIIA Gas Mulia).
- **Periode (Baris Horizontal):** Unsur-unsur dalam satu periode memiliki jumlah **kulit elektron yang sama**. Dari kiri ke kanan dalam satu periode, jari-jari atom mengecil dan sifat keelektronegatifan meningkat.

---

## Rangkuman Konsep Atom SMP

| Istilah Kunci | Definisi / Rumus | Posisi / Lokasi | Peran Fungsional |
| :--- | :--- | :--- | :--- |
| **Proton** | Partikel muatan +1 | Inti Atom (Nukleus) | Penentu identitas nomor atom (Z) |
| **Neutron** | Partikel netral (0) | Inti Atom (Nukleus) | Penjaga stabilitas mekanika inti |
| **Elektron** | Partikel muatan -1 | Kulit Mengorbit Inti | Pembentuk ikatan dan reaksi kimia |
| **Nomor Massa** | A = Proton + Neutron | Penjumlahan Inti | Berat relatif isotop unsur |
| **Elektron Valensi**| Elektron di kulit terluar | Kulit Terluar Atom | Penentu golongan & reaktivitas |

---

## Referensi & Sumber Belajar Terverifikasi

1. [Gramedia Literasi - Pengertian Teori Atom Dalton, Thomson, Rutherford, dan Bohr](https://www.gramedia.com/literasi/teori-atom/)
2. [Wikipedia Bahasa Indonesia - Struktur Atom dan Partikel Subatomik](https://id.wikipedia.org/wiki/Atom)
3. [Wikipedia Bahasa Indonesia - Tabel Periodik Unsur dan Sistem Periodisitas](https://id.wikipedia.org/wiki/Tabel_periodik)
4. [Wikipedia Bahasa Indonesia - Konfigurasi Elektron dan Tingkat Energi Kulit](https://id.wikipedia.org/wiki/Konfigurasi_elektron)
"""

cur.execute("UPDATE articles SET content = %s, updated_at = CURRENT_TIMESTAMP WHERE slug = %s", 
            (atom_content, 'struktur-atom-dan-tabel-periodik-unsur'))

# 2. Update Bab Termokimia
thermo_content = """Setiap reaksi kimia yang berlangsung di alam selalu disertai dengan perubahan energi, baik dalam bentuk pelepasan energi kalor maupun penyerapan panas dari lingkungan. Cabang ilmu kimia yang mempelajari hubungan timbal balik antara reaksi kimia dengan perubahan energi kalor disebut **Termokimia**.

![Diagram Profil Energi Reaksi Eksoterm dan Endoterm Serta Energi Aktivasi](/article-images/energy_profile_reaction.png)

Prinsip termokimia mendasari efisiensi pembakaran bahan bakar kendaraan, teknologi baterai kendaraan listrik, perancangan kompres dingin/hangat medis instan, hingga kalkulasi nilai kalori pangan.

---

## 1. Konsep Dasar: Sistem, Lingkungan, dan Hukum I Termodinamika

Dalam termokimia, batas alam semesta dibagi menjadi dua komponen:
- **Sistem:** Bagian dari alam semesta yang menjadi pusat fokus perhatian atau tempat terjadinya reaksi kimia (misal: campuran larutan HCl dan NaOH di dalam gelas kimia).
- **Lingkungan:** Segala sesuatu di luar sistem yang membatasi dan dapat berinteraksi dengan sistem (misal: dinding gelas kimia, termometer, udara sekitar).

Berdasarkan **Hukum I Termodinamika (Hukum Kekekalan Energi)**, energi tidak dapat diciptakan atau dimusnahkan, melainkan hanya dapat diubah dari satu bentuk ke bentuk energi lainnya:

> **Persamaan Termodinamika Energi Dalam (ΔU):**  
> **ΔU = q + w**  
> *(Keterangan: ΔU = Perubahan energi dalam, q = Kalor yang diserap/dilepas sistem, w = Kerja yang dilakukan/diterima sistem)*

---

## 2. Entalpi (H) dan Perubahan Entalpi Reaksi (ΔH)

**Entalpi (H)** adalah jumlah total energi yang dimiliki oleh suatu sistem pada tekanan konstan. Nilai mutlak entalpi suatu zat tidak dapat diukur secara langsung, namun kita dapat mengukur selisih atau **Perubahan Entalpi (ΔH)** selama reaksi berlangsung:

> **Rumus Perubahan Entalpi:**  
> **ΔH = H_produk - H_reaktan**

---

## 3. Komparasi Reaksi Eksoterm vs Reaksi Endoterm

### A. Reaksi Eksoterm (ΔH Bernilai Negatif / ΔH < 0)
Reaksi kimia yang **melepaskan kalor** dari sistem ke lingkungan. Karena kalor dilepaskan, entalpi produk lebih rendah daripada reaktan (H_produk < H_reaktan).
- **Ciri Fisik:** Suhu lingkungan mengalami kenaikan (wadah terasa hangat/panas).
- **Contoh Nyata:** Pembakaran gas elpiji metana (CH₄ + 2O₂ → CO₂ + 2H₂O + Kalor), reaksi respirasi seluler glukosa, pelarutan kapur tohor (CaO) dalam air.

### B. Reaksi Endoterm (ΔH Bernilai Positif / ΔH > 0)
Reaksi kimia yang **menyerap kalor** dari lingkungan ke dalam sistem. Entalpi produk lebih tinggi daripada reaktan (H_produk > H_reaktan).
- **Ciri Fisik:** Suhu lingkungan mengalami penurunan (wadah terasa dingin).
- **Contoh Nyata:** Fotosintesis tumbuhan hijau, pencairan es batu, reaksi pelarutan urea atau amonium nitrat dalam kompres dingin medis instan (*cold pack*).

---

## 4. Penentuan Perubahan Entalpi: Kalorimetri dan Hukum Hess

### A. Kalorimetri (Eksperimen Kalorimeter Sederhana)
Besarnya kalor yang diserap atau dilepas larutan dihitung menggunakan rumus asas Black:

> **Persamaan Kalor Kalorimeter:**  
> **q = m × c × ΔT**  
> *(Keterangan: m = massa larutan dalam gram, c = kalor jenis air ≈ 4,18 J/g·°C, ΔT = perubahan suhu T_akhir - T_awal)*

### B. Hukum Hess (Hukum Penjumlahan Kalor)
Germain Henri Hess (1840) menyatakan bahwa perubahan entalpi suatu reaksi kimia hanya bergantung pada **keadaan awal (reaktan) dan keadaan akhir (produk)**, serta tidak bergantung pada jalannya tahapan reaksi:

> **Prinsip Penjumlahan Tahapan Reaksi:**  
> **ΔH_total = ΔH₁ + ΔH₂ + ΔH₃ + ...**

Jika reaksi dapat berlangsung melalui beberapa rute tahapan beruntun, maka total perubahan entalpi reaksi keseluruhan adalah penjumlahan aljabar dari perubahan entalpi tiap tahapannya.

---

## Rangkuman Konsep Termokimia SMA

| Parameter | Reaksi Eksoterm | Reaksi Endoterm |
| :--- | :--- | :--- |
| **Aliran Kalor** | Sistem -> Lingkungan (Melepas) | Lingkungan -> Sistem (Menyerap) |
| **Tanda Nilai ΔH**| Negatif (ΔH < 0) | Positif (ΔH > 0) |
| **Suhu Lingkungan** | Mengalami kenaikan (Panas) | Mengalami penurunan (Dingin) |
| **Energi Produk** | H_produk < H_reaktan | H_produk > H_reaktan |
| **Contoh Reaksi** | Pembakaran bahan bakar, respirasi | Fotosintesis, dekomposisi termal |

---

## Referensi & Sumber Belajar Terverifikasi

1. [Gramedia Literasi - Konsep Reaksi Kimia: Ciri, Faktor dan Perubahan](https://www.gramedia.com/literasi/reaksi-kimia/)
2. [Gramedia Literasi - Hukum Termodinamika: Formula Kalor dan Energi Dalam](https://www.gramedia.com/literasi/hukum-termodinamika/)
3. [Wikipedia Bahasa Indonesia - Termokimia dan Perubahan Entalpi Reaksi](https://id.wikipedia.org/wiki/Termokimia)
4. [Wikipedia Bahasa Indonesia - Hukum Hess dan Penjumlahan Kalor Reaksi](https://id.wikipedia.org/wiki/Hukum_Hess)
"""

cur.execute("UPDATE articles SET content = %s, updated_at = CURRENT_TIMESTAMP WHERE slug = %s", 
            (thermo_content, 'termokimia-entalpi-reaksi-dan-hukum-hess'))

conn.commit()
cur.close()
conn.close()
print("Cleaned math typography for atom & thermochemistry successfully!")
