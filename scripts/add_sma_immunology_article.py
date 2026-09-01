import psycopg2

conn = psycopg2.connect('dbname=quiz_pocket user=abdasis host=/var/run/postgresql')
cur = conn.cursor()

title = "Sistem Imunitas & Pertahanan Tubuh: Seluler, Humoral, dan Memori Imunologis"
slug = "sistem-imunitas-dan-pertahanan-tubuh"
category = "Biologi SMA"
level = "SMA"
icon = "ShieldCheck"
read_time = 9
summary = "Kajian biologi SMA mendalam mengenai lapis pertahanan tubuh non-spesifik bawaan, imunitas adaptif spesifik sel Limfosit T dan B, struktur antibodi immunoglobulin, serta prinsip memori vaksinasi."

content = """Tubuh manusia secara konstan terpapar oleh miliaran mikroorganisme di lingkungan sekitarnya, mulai dari bakteri patogen, virus parasit obligat, jamur mikroskopis, hingga racun biologis. Untuk bertahan hidup, organisme tingkat tinggi mengembangkan **Sistem Imun** (*immune system*): sebuah jaringan pertahanan seluler, humoral, dan jaringan limfoid yang sangat terkoordinasi dan mampu membedakan antara sel diri sendiri (*self*) dan zat asing berbahaya (*non-self*).

![Struktur Molekuler Antibodi Immunoglobulin (Bentuk Huruf Y)](/article-images/antibody_structure.png)

Pemahaman mengenai mekanisme pertahanan imun menjadi landasan ilmiah bagi pengembangan vaksin modern, terapi serum hiperimun, transplantasi organ, hingga pengobatan penyakit autoimun dan kanker.

---

## 1. Tiga Lapis Garis Pertahanan Tubuh Manusia

Sistem kekebalan tubuh manusia bekerja melalui tiga barisan pertahanan bertingkat:

### A. Garis Pertahanan Pertama: Barier Fisik dan Kimiawi (Non-Spesifik)
Mencegah patogen menembus masuk ke dalam jaringan internal tubuh:
- **Barier Fisik (Kulit & Mukosa):** Lapisan keratin kulit yang rapat, kering, dan terus terkelupas secara mekanis menghambat penetrasi kuman. Membran mukosa di saluran pernapasan menangkap debu dan kuman dengan bantuan silia penyapu.
- **Barier Kimiawi:** Asam klorida (HCl) di lambung dengan pH ~2 membunuh mayoritas bakteri pada makanan. Enzim **lisozim** pada air mata, ludah, dan keringat mampu melisiskan dinding sel bakteri gram-positif.

### B. Garis Pertahanan Kedua: Respon Imun Bawaan Internal (Innate Immunity)
Bekerja cepat dalam hitungan menit/jam jika patogen berhasil menembus barier kulit:

![Mekanisme Fagositosis oleh Sel Makrofag Menelan Bakteri Patogen](/article-images/phagocytosis_mechanism.png)

1. **Sel Fagosit (Neutrofil & Makrofag):** Sel darah putih yang menelan dan mencerna patogen melalui proses **fagositosis**. Makrofag kemudian bertindak sebagai *Antigen Presenting Cell* (APC) yang memicu respon imun lanjutan.
2. **Sel Natural Killer (NK Cells):** Sel limfoid bawaan yang mengenali dan menghancurkan sel tubuh yang telah terinfeksi virus atau sel kanker dengan melepaskan protein perforin dan granzim.
3. **Respon Inflamasi (Peradangan):** Pelepasan histamin oleh sel mast memicu vasodilatasi (pelebaran pembuluh kapiler darah), meningkatkan aliran sel darah putih ke lokasi infeksi dengan tanda khas kemerahan (*rubor*), panas (*calor*), pembengkakan (*tumor*), dan nyeri (*dolor*).
4. **Sistem Komplemen & Interferon:** Interferon adalah protein antivirus yang disekresikan sel terinfeksi untuk memperingatkan sel tetangga agar memperkuat pertahanan.

---

## 2. Garis Pertahanan Ketiga: Imunitas Adaptif Spesifik

Imunitas adaptif membutuhkan waktu beberapa hari untuk mengenali epitop **antigen** spesifik patogen, namun memiliki presisi tinggi dan menghasilkan **memori imunologis jangka panjang**:

### A. Imunitas Seluler (Dimediasi oleh Limfosit T)
Limfosit T diproduksi di sumsum tulang dan mengalami maturasi/diferensiasi di kelenjar **Timus**:
- **Sel T Sitotoksik (CD8⁺):** Bertindak layaknya prajurit penyerang garis depan yang menghancurkan sel terinfeksi virus atau sel kanker secara langsung melalui induksi apoptosis.
- **Sel T Helper (CD4⁺):** Komandan pusat sistem imun yang mengoordinasikan seluruh respon pertahanan dengan mensekresikan sitokin interleukin untuk mengaktivasi sel T sitotoksik dan sel B.
- **Sel T Supresor / Regulator:** Menghentikan respon imun setelah infeksi mereda guna mencegah kerusakan jaringan sendiri.

### B. Imunitas Humoral (Dimediasi oleh Limfosit B dan Antibodi)
Limfosit B matang di sumsum tulang (*bone marrow*). Saat teraktivasi oleh antigen spesifik dan bantuan sel T helper, sel B berproliferasi dan berdiferensiasi menjadi:
- **Sel Plasma:** Memproduksi dan mensekresikan ribuan molekul protein **antibodi (Immunoglobulin / Ig)** per detik ke dalam cairan plasma darah dan limfa.
- **Sel B Memori:** Bertahan hidup selama puluhan tahun di dalam kelenjar getah bening untuk mengingat profil antigen patogen tersebut.

---

## 3. Struktur dan Kelas Antibodi (Immunoglobulin)

Molekul antibodi berbentuk huruf **Y** yang tersusun atas dua rantai berat (*heavy chain*) dan dua rantai ringan (*light chain*). Ujung lengan Y memiliki daerah variabel (*variable region*) yang sangat spesifik menyerupai kunci dan gembok terhadap satu jenis antigen tertentu.

### Lima Kelas Utama Immunoglobulin (Ig):
1. **IgG:** Antibodi paling melimpah dalam sirkulasi darah (~80%), mampu menembus plasenta untuk memberikan imunitas pasif alami bagi janin dalam kandungan.
2. **IgA:** Melimpah pada cairan sekresi tubuh (air susu ibu / kolostrum, air liur, air mata, mukus saluran napas) untuk menjaga pintu masuk barier mukosa.
3. **IgM:** Berbentuk pentamer (lima unit Y menyatu), merupakan antibodi pertama yang disekresikan dalam jumlah besar saat terjadi infeksi primer akut.
4. **IgE:** Terlibat langsung dalam reaksi alergi dan pertahanan melawan infeksi parasit cacing.
5. **IgD:** Berada di permukaan membran sel B sebagai reseptor pengenal antigen.

---

## 4. Mekanisme Vaksinasi dan Memori Imunologis

Prinsip dasar vaksinasi adalah memicu respon imun primer yang aman tanpa menimbulkan gejala sakit:

- Vaksin memasukkan antigen patogen yang telah dilemahkan (*attenuated*), dimatikan (*inactivated*), fragmen protein rekombinan, atau instruksi genetik mRNA.
- Tubuh membentuk antibodi spesifik dan mencetak **Sel B Memori** serta **Sel T Memori**.
- Ketika patogen liar yang sesungguhnya menyerang tubuh di masa mendatang, respon imun sekunder (*secondary immune response*) berlangsung jauh lebih cepat, masif, dan berkekuatan tinggi, melumpuhkan virus sebelum sempat berkembang biak dan menimbulkan sakit.

---

## Rangkuman Konsep Sistem Imun SMA

| Komponen Pertahanan | Tipe Imunitas | Lokasi / Aktor Utama | Mekanisme Aksi |
| :--- | :--- | :--- | :--- |
| **Barier Luar** | Non-Spesifik | Kulit, Asam Lambung, Lisozim | Menghalangi penetrasi patogen |
| **Fagosit & NK Cell** | Bawaan (*Innate*) | Makrofag, Neutrofil | Menelan dan melisiskan sel patogen |
| **Sel T Sitotoksik** | Adaptif Seluler | Limfosit T (CD8⁺) | Membunuh sel tubuh yang terinfeksi |
| **Sel B Plasma** | Adaptif Humoral | Antibodi (IgG, IgM, IgA) | Netralisasi antigen & aglutinasi |
| **Sel Memori** | Adaptif Sekunder| Sel B dan T Memori | Imunitas proteksi jangka panjang |

---

## Referensi & Sumber Belajar Terverifikasi

1. [Hello Sehat - Memahami Sistem Kekebalan Tubuh dan Anatomi Limfoid](https://hellosehat.com/sehat/informasi-kesehatan/sistem-imun/)
2. [Halodoc Kesehatan - Mengenal Ragam Komponen Sistem Imun dan Antibodi](https://www.halodoc.com/kesehatan/sistem-imun)
3. [KlikDokter - Panduan Medis Imunisasi dan Pembentukan Antibodi](https://www.klikdokter.com/penyakit/imunisasi)
4. [Wikipedia Bahasa Indonesia - Sistem Imun: Pertahanan Bawaan dan Imunitas Adaptif](https://id.wikipedia.org/wiki/Sistem_imun)
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
print("Inserted SMA Immunology chapter successfully!")
