import psycopg2

conn = psycopg2.connect('dbname=quiz_pocket user=abdasis host=/var/run/postgresql')
cur = conn.cursor()

# Artikel Fotosintesis lengkap dengan diagram & gambar ilmiah resmi beresolusi tajam
content_with_images = """Fotosintesis merupakan salah satu reaksi biokimia paling fundamental yang menopang seluruh jaring-jaring kehidupan di planet Bumi. Melalui mekanisme yang teramat presisi ini, energi radiasi elektromagnetik yang dipancarkan oleh Matahari diubah menjadi ikatan kimia organik berenergi tinggi dalam bentuk karbohidrat, sekaligus memproduksi gas oksigen bebas yang esensial bagi pernapasan seluruh organisme aerobik di darat maupun perairan.

![Skema Umum Proses Fotosintesis pada Daun Tumbuhan](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Photosynthesis_id.svg/500px-Photosynthesis_id.svg.png)

Tanpa adanya proses fotosintesis yang berlangsung tanpa henti di daratan melalui vegetasi tumbuhan tingkat tinggi dan di lautan melalui mikroorganisme fitoplankton serta alga laut, atmosfer bumi akan didominasi oleh gas rumah kaca beracun dan seluruh rantai makanan global akan runtuh seketika dalam hitungan minggu.

---

## 1. Anatomi Daun dan Organel Kloroplas

Proses konversi energi surya ini tidak terjadi di sembarang bagian sel tumbuhan, melainkan terpusat pada organel seluler khusus bernama **kloroplas** yang melimpah pada jaringan mesofil (terdiri atas jaringan tiang/palisade dan jaringan bunga karang/spons) di dalam daun.

![Diagram Struktur Bagian-Bagian Kloroplas dan Tilakoid](https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Chloroplast.svg/500px-Chloroplast.svg.png)

Struktur kloroplas dibungkus oleh membran ganda yang melindungi sistem membran internal yang sangat terorganisasi:
- **Membran Tilakoid:** Kantung-kantung pipih bermembran tempat tertanamnya pigmen fotosintetik dan kompleks protein fotosistem.
- **Grana (Granum):** Tumpukan membran tilakoid yang tersusun bertingkat seperti tumpukan koin untuk memaksimalkan luas permukaan penyerapan foton cahaya.
- **Stroma:** Cairan kental matriks yang mengisi ruang di luar tilakoid, kaya akan enzim-enzim metabolisme yang bertugas menyintesis molekul gula.

Kloroplas menampung pigmen penangkap cahaya utama yaitu **klorofil** (terbagi atas klorofil a dan klorofil b). Molekul klorofil memiliki cincin porfirin yang mengikat ion magnesium (Mg²⁺) tepat di pusat strukturnya. Cincin ini bertindak layaknya antena penangkap foton yang sangat efisien dalam menyerap spektrum cahaya biru (panjang gelombang ~430-450 nm) dan spektrum merah (~640-660 nm), namun memantulkan kembali spektrum hijau (~500-550 nm). Pantulan gelombang cahaya hijau inilah yang ditangkap oleh retina mata manusia sehingga sebagian besar dedaunan di alam tampak berwarna hijau segar.

---

## 2. Dua Tahapan Reaksi Fotosintesis Terpadu

Secara fisiologis modern, proses fotosintesis terbagi menjadi dua tahapan reaksi biokimia terkoordinasi yang berlangsung secara berkesinambungan di lokasi yang berbeda di dalam kloroplas:

```text
Cahaya Matahari + H2O ──► [ REAKSI TERANG (Tilakoid) ] ──► ATP + NADPH + O2 (Dilepas)
                                   │
                                   ▼
CO2 dari Udara ──────────► [ SIKLUS CALVIN (Stroma) ] ──► Glukosa (C6H12O6)
```

### A. Reaksi Terang (Light-Dependent Reactions)
Tahapan pertama ini berlangsung di dalam **membran tilakoid** dan mutlak membutuhkan keberadaan foton cahaya secara langsung:
1. **Penyerapan Energi Foton:** Cahaya matahari mengenai molekul klorofil pada kompleks Fotosistem II (P680), mengeksitasi elektron ke tingkat energi yang lebih tinggi.
2. **Fotolisis Air (H2O):** Untuk menggantikan elektron yang tereksitasi, enzim khusus memecah molekul air menjadi ion hidrogen (H⁺), elektron bebas, dan melepaskan gas oksigen (O2) ke udara melalui pori-pori stomata daun.
3. **Fotofosforilasi & Pembentukan Energi:** Elektron berenergi tinggi dialirkan melintasi rantai transpor elektron menuju Fotosistem I (P700). Aliran muatan ini mengaktifkan pompa proton yang memicu enzim ATP Sintase untuk menghasilkan molekul penyimpan energi **ATP** (Adenosin Trifosfat) dan agen pereduksi **NADPH** (Nikotinamida Adenin Dinukleotida Fosfat).

### B. Reaksi Gelap / Siklus Calvin (Light-Independent Reactions)
Tahap kedua berlangsung di dalam cairan **stroma** dan tidak bergantung langsung pada keberadaan cahaya matahari, melainkan menggunakan cadangan energi kimia ATP dan NADPH yang telah diproduksi sebelumnya pada reaksi terang:

![Bagan Rangkaian Jalur Reaksi Gelap / Siklus Calvin](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Reaksi_gelapedit_copy.png/500px-Reaksi_gelapedit_copy.png)

1. **Fiksasi Karbon:** Karbon dioksida (CO2) yang masuk dari udara diikat oleh senyawa ribulosa 1,5-bisfosfat (RuBP) dengan bantuan enzim paling melimpah di muka bumi, yaitu **RuBisCO** (Ribulose-1,5-bisphosphate carboxylase-oxygenase).
2. **Fase Reduksi:** Senyawa berkarbon enam yang tidak stabil segera dipecah dan direduksi oleh ion hidrogen dari NADPH dengan bantuan energi ATP menjadi molekul gula berkarbon tiga, yaitu Gliseraldehida 3-fosfat (G3P).
3. **Sintesis Karbohidrat & Regenerasi RuBP:** Sebagian molekul G3P dikeluarkan dari siklus untuk dirangkai menjadi glukosa (C6H12O6), fruktosa, selulosa untuk memperkuat dinding sel tumbuhan, serta pati/amilum sebagai cadangan makanan di akar, batang, dan biji. Sebagian molekul G3P lainnya digunakan kembali untuk meregenerasi molekul RuBP agar siklus fiksasi karbon dapat terus berputar.

---

## 3. Faktor Penentu Laju dan Efisiensi Fotosintesis

Efisiensi fotosintesis dalam memproduksi biomassa dipengaruhi oleh keseimbangan berbagai parameter internal dan eksternal tumbuhan:

- **Intensitas dan Spektrum Cahaya:** Laju fotosintesis meningkat linear seiring pertambahan intensitas cahaya hingga mencapai titik jenuh (*light saturation point*). Paparan cahaya yang melampaui batas toleransi dapat memicu kerusakan fotooksidatif pada klorofil (*fotoinhibisi*).
- **Konsentrasi Karbon Dioksida (CO2):** Pada kondisi normal di alam, konsentrasi CO2 atmosfer (~0,04%) sering kali menjadi faktor pembatas utama. Peningkatan kadar CO2 di sekitar daun akan memacu kecepatan fiksasi karbon oleh enzim RuBisCO.
- **Suhu Lingkungan dan Kinetika Enzim:** Setiap tahapan enzimatik memiliki rentang suhu optimal (umumnya berkisar antara 20°C hingga 35°C). Suhu dingin yang ekstrem memperlambat pergerakan molekul reaktan, sedangkan suhu yang terlalu panas dapat merusak struktur spasial protein enzim (*denaturasi*).
- **Regulasi Stomata dan Ketersediaan Air:** Air tidak hanya berperan sebagai donor elektron dalam fotolisis, tetapi juga menjaga turgiditas sel penjaga stomata. Ketika tanah mengalami kekeringan ekstrem, stomata akan menutup rapat untuk mencegah dehidrasi, yang secara otomatis memutus pasokan gas CO2 masuk ke jaringan daun.

---

## 4. Peran Ekologis dalam Pengendalian Iklim Global

Di era industri modern, fotosintesis bertindak sebagai mekanisme penyerap karbon alami (*natural carbon sink*) terpenting di planet kita. Hutan hujan tropis Amazon, hutan primer Nusantara di Kalimantan dan Papua, serta ekosistem mangrove di pesisir menyerap puluhan gigaton emisi gas rumah kaca setiap tahunnya.

![Distribusi Aktivitas Biosfer Global dan Penyerapan Karbon](https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Seawifs_global_biosphere.jpg/500px-Seawifs_global_biosphere.jpg)

Mempertahankan tutupan vegetasi hijau bumi bukan sekadar melestarikan keanekaragaman hayati, melainkan langkah paling fundamental untuk menjaga pasokan oksigen atmosfer, menstabilkan iklim global, dan memastikan keberlanjutan hidup seluruh makhluk di muka bumi.

---

## Referensi & Sumber Rujukan

1. [Wikipedia Bahasa Indonesia - Konsep dan Reaksi Fotosintesis](https://id.wikipedia.org/wiki/Fotosintesis)
2. [Wikipedia Bahasa Indonesia - Struktur dan Fungsi Pigmen Klorofil](https://id.wikipedia.org/wiki/Klorofil)
3. [Wikipedia Bahasa Indonesia - Tahapan Reaksi Gelap dan Siklus Calvin](https://id.wikipedia.org/wiki/Siklus_Calvin)
4. [Wikipedia Bahasa Indonesia - Anatomi dan Organel Kloroplas Tumbuhan](https://id.wikipedia.org/wiki/Kloroplas)"""

cur.execute("""
UPDATE articles 
SET content = %s,
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'mengenal-fotosintesis-dan-klorofil';
""", (content_with_images,))

conn.commit()
print("Updated Fotosintesis with high-res scientific illustrations & captions!")
