import psycopg2

conn = psycopg2.connect('dbname=quiz_pocket user=abdasis host=/var/run/postgresql')
cur = conn.cursor()

title = "Teknologi Sel Surya & Transisi Energi: Efek Fotovoltaik, Semikonduktor Silikon dan PLTS Masa Depan"
slug = "teknologi-sel-surya-dan-transisi-energi-terbarukan"
category = "Teknologi SMA"
level = "SMA"
icon = "Sun"
read_time = 10
summary = "Materi sains dan teknologi mutakhir mengenai prinsip fisika semikonduktor efek fotovoltaik, struktur sambungan P-N silikon sel surya, efisiensi modul surya, dan peranan krusial PLTS dalam dekarbonisasi global."

content = """Krisis iklim global dan penipisan cadangan bahan bakar fosil mendorong percepatan transisi energi menuju sumber daya terbarukan yang bersih dan berkelanjutan. Di antara seluruh alternatif energi hijau, **Pembangkit Listrik Tenaga Surya (PLTS)** berbasis teknologi fotovoltaik (*Photovoltaics / PV*) menjadi sektor dengan laju pertumbuhan paling pesat dan paling masif diimplementasikan di seluruh dunia.

![Struktur Lapisan Sambungan P-N Semikonduktor Silikon pada Sel Surya Fotovoltaik](/article-images/solar_cell_silicon.png)

Matahari memancarkan energi foton sebesar ~3,8 × 10²⁶ Watt ke luar angkasa, di mana sebagian kecil yang mencapai atmosfer bumi (~1.000 W/m² di permukaan pada kondisi puncak) sudah lebih dari cukup untuk memenuhi total kebutuhan listrik peradaban manusia jika dikonversi secara efisien.

---

## 1. Efek Fotovoltaik: Prinsip Dasar Konversi Foton Menjadi Listrik

Efek fotovoltaik pertama kali diamati oleh fisikawan Prancis Alexandre-Edmond Becquerel pada tahun 1839 dan disempurnakan oleh penemuan sel surya silikon modern di Bell Labs pada tahun 1954:

- **Eksitasi Elektron oleh Foton:** Ketika foton cahaya matahari dengan energi yang lebih besar daripada celah pita energi (*bandgap*) semikonduktor menumbuk atom silikon, elektron valensi akan menyerap energi foton tersebut dan tereksitasi meloncat ke pita konduksi.
- **Pemisahan Muatan (Pasangan Elektron-Hole):** Eksitasi ini menghasilkan pasangan elektron bebas (bermuatan negatif) dan *hole* (kekosongan elektron bermuatan positif).
- **Aliran Arus Listrik Searah (DC):** Adanya medan listrik internal pada sambungan semikonduktor memaksa elektron mengalir ke elektroda negatif dan *hole* ke elektroda positif, menghasilkan beda potensial listrik searah (DC).

---

## 2. Anatomi Sambungan Semikonduktor P-N Sel Surya

Sel surya komersial sebagian besar dibuat dari material **Silikon (Si)** kristal yang telah didoping dengan atom pengotor tertentu untuk membentuk sambungan P-N (*P-N Junction*):

![Diagram Konstruksi Modul Panel Surya Fotovoltaik dan Sambungan Sel](/article-images/photovoltaic_cell.png)

1. **Lapisan Tipe-N (Lapisan Atas yang Tipis):** Silikon didoping dengan unsur golongan VA seperti **Fosfor (P)** yang memiliki 5 elektron valensi. Kelebihan 1 elektron menghasilkan muatan pembawa mayoritas berupa **elektron bebas**.
2. **Lapisan Tipe-P (Lapisan Bawah yang Lebih Tebal):** Silikon didoping dengan unsur golongan IIIA seperti **Boron (B)** yang memiliki 3 elektron valensi. Kekurangan 1 elektron menghasilkan muatan pembawa mayoritas berupa **hole**.
3. **Zona Deplesi (*Depletion Region*):** Daerah perbatasan tempat bertemunya lapisan P dan N, menciptakan medan listrik statis permanen yang mengarahkan pergerakan muatan fotovoltaik.
4. **Lapisan Anti-Reflektif (*Anti-Reflective Coating*):** Lapisan tipis silikon nitrida berwarna biru tua atau hitam pekat yang berfungsi meminimalkan pantulan sinar matahari agar penyerapan foton mencapai maksimum (>95%).
5. **Kisi Kontak Logam Depan & Belakang:** Strip konduktor tipis dari perak (Ag) atau aluminium (Al) untuk mengumpulkan arus listrik dari seluruh permukaan sel.

---

## 3. Jenis-Jenis Panel Surya dan Tingkat Efisiensi

Perkembangan rekayasa material menghasilkan beberapa generasi panel surya dengan efisiensi dan karakteristik biaya yang bervariasi:

![Struktur dan Komponen Modul Panel Surya Komersial](/article-images/solar_panel_hybrid.jpg)

### A. Monokristalin Silikon (Mono-Si)
- Dibuat dari batangan silikon kristal tunggal berderajat kemurnian tertinggi (*Czochralski process*).
- **Ciri Fisik:** Berwarna hitam pekat seragam dengan sudut sel yang terpotong rapi.
- **Efisiensi:** Tertinggi di kelas komersial, mencapai **19% - 23%**.
- **Kelebihan:** Performa terbaik pada kondisi cuaca panas dan memiliki masa pakai terpanjang (>25 tahun).

### B. Polikristalin Silikon (Poly-Si)
- Dibuat dari peleburan banyak pecahan kristal silikon yang dicetak bersamaan.
- **Ciri Fisik:** Berwarna biru berpola kristal acak (bercak-bercak).
- **Efisiensi:** Berkisar antara **15% - 18%**.
- **Kelebihan:** Biaya manufaktur lebih ekonomis, meskipun membutuhkan luas atap yang lebih besar untuk kapasitas daya yang sama.

### C. Sel Surya Film Tipis (*Thin-Film*) & Perovskit Generasi Baru
- Menggunakan material semikonduktor amorf (*a-Si, CdTe, CIGS*) atau kristal mineral sintetis **Perovskit** yang dilapiskan sangat tipis pada substrat fleksibel seperti kaca, plastik, atau logam.
- **Potensi Masa Depan:** Sel surya Perovskit tandem mampu menembus efisiensi laboratorium di atas **30%** dengan bobot sangat ringan dan dapat diintegrasikan pada kaca jendela gedung (*Building-Integrated Photovoltaics / BIPV*).

---

## 4. Komponen Sistem PLTS dan Integrasi Jaringan

Sistem PLTS modern tersusun atas beberapa komponen terintegrasi:

- **Panel Surya (PV Array):** Rangkaian modul sel surya yang disusun secara seri dan paralel untuk menghasilkan tegangan dan kuat arus total yang diinginkan.
- **Solar Inverter:** Mengonversi arus searah (DC) dari panel surya menjadi arus bolak-balik (AC) bertegangan standar (220V) agar dapat menghidupkan peralatan elektronik rumah tangga dan disinkronkan ke jaringan PLN.
- **Solar Charge Controller (MPPT):** Algoritma pelacak titik daya maksimum (*Maximum Power Point Tracking*) untuk mengoptimalkan pengisian daya baterai secara efisien.
- **Sistem Penyimpan Energi Baterai (BESS):** Baterai Lithium Iron Phosphate (LiFePO4) untuk menyimpan surplus energi surya di siang hari agar dapat digunakan pada malam hari.

---

## Rangkuman Konsep Teknologi Sel Surya SMA

| Aspek Teknologi | Prinsip Kerja / Karakteristik | Manfaat Fungsional |
| :--- | :--- | :--- |
| **Efek Fotovoltaik** | Foton mengeksitasi elektron pita konduksi | Menghasilkan arus listrik DC alami |
| **Sambungan P-N** | Silikon Doping Fosfor (N) + Boron (P) | Memisahkan muatan elektron dan hole |
| **Monokristalin** | Silikon kristal tunggal murni (Efisiensi 20-23%) | Kapasitas daya tinggi pada lahan terbatas |
| **Inverter Listrik** | Konversi daya DC ke AC 220V | Sinkronisasi ke jaringan listrik rumah/PLN |
| **Dekarbonisasi** | Nol emisi gas rumah kaca saat operasional | Mereduksi jejak karbon & krisis iklim |

---

## Referensi & Sumber Belajar Terverifikasi

1. [Badan Riset dan Inovasi Nasional (BRIN) - Riset Pengembangan Panel Surya Fleksibel dan Efisien](https://www.brin.go.id/news/113702/periset-brin-kembangkan-panel-surya-fleksibel-dan-efisien)
2. [Kementerian ESDM (EBTKE) - Potensi Besar dan Akselerasi Pemasangan PLTS Atap Nasional](https://ebtke.esdm.go.id/post/2023/08/25/3549/potensi-besar-surya-pemerintah-akselerasi-pemasangan-plts-atap)
3. [Wikipedia Bahasa Indonesia - Sel Surya: Fisika Semikonduktor dan Rekayasa Fotovoltaik](https://id.wikipedia.org/wiki/Sel_surya)
4. [Wikipedia Bahasa Indonesia - Energi Surya: Radiasi Kosmis dan Pemanfaatan Termal](https://id.wikipedia.org/wiki/Energi_surya)
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
print("Inserted Trending Solar Cell & Clean Energy chapter successfully!")
