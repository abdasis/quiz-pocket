import psycopg2

conn = psycopg2.connect('dbname=quiz_pocket user=abdasis host=/var/run/postgresql')
cur = conn.cursor()

# Artikel Tata Surya komprehensif lengkap dengan diagram & gambar ilmiah resmi beresolusi tajam
content_tata_surya = """Tata surya kita adalah sebuah sistem keterikatan gravitasi yang terbentang melintasi ruang antariksa berjarak miliaran kilometer, dengan Matahari bertindak sebagai bintang induk pusat massa yang mengendalikan lintasan seluruh objek langit di sekitarnya.

![Gambaran Umum Susunan Anggota Tata Surya Sesuai Skala Ukuran](https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Planets2008-id.jpg/500px-Planets2008-id.jpg)

Terbentuk sekitar 4,6 miliar tahun yang lalu akibat keruntuhan gravitasi awan gas molekuler dan debu kosmis raksasa (*solar nebula*), tata surya menyajikan keteraturan fisika yang menakjubkan di bawah hukum-hukum mekanika benda langit universal.

---

## 1. Pembentukan Tata Surya dari Piringan Protoplanet

Kisah terbentuknya tata surya bermula ketika sebuah kantung awan gas hidrogen dan helium antarbintang mengalami gangguan gravitasi (kemungkinan besar dipicu oleh gelombang kejut ledakan supernova di dekatnya). Tarikan gravitasi menyebabkan materi awan memadat dan berputar semakin cepat sambil merata menjadi piringan akresi berputar (*protoplanetary disk*).

Di pusat piringan yang memiliki densitas massa dan temperatur tertinggi, tekanan memicu fusi termonuklir hidrogen menjadi helium, melahirkan bintang induk kita: **Matahari**. Sementara itu, partikel-partikel debu dan es di piringan luar saling bertumbukan dan bergabung melalui proses akresi elektrostatik dan gravitasi membentuk benda berukuran kilometer (*planetesimal*), yang akhirnya tumbuh menjadi protoplanet dan membentuk konfigurasi delapan planet modern.

---

## 2. Klasifikasi Planet Berdasarkan Garis Beku (Frost Line)

Karakteristik planet di tata surya terbelah secara tegas oleh **garis beku** (*frost line*), yaitu batas jarak dari Matahari di mana suhu cukup dingin sehingga senyawa volatil seperti air, amonia, dan metana dapat memadat menjadi butiran es:

![Struktur Tata Surya Bagian Dalam dan Orbit Planet Terestrial](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Solarsys.svg/500px-Solarsys.svg.png)

### A. Planet Terestrial (Inner Rocky Planets)
Terletak di dalam garis beku, terdiri dari **Merkurius, Venus, Bumi, dan Mars**. Karena radiasi panas matahari yang kuat menguapkan senyawa volatil ringan, planet-planet ini berukuran relatif kecil dengan komposisi padat berbatu silikat dan inti logam besi-nikel padat:
- **Merkurius:** Planet terkecil dan terdekat dengan Matahari. Karena tidak memiliki lapisan atmosfer tebal yang mampu menahan panas, Merkurius mengalami fluktuasi temperatur paling ekstrem di tata surya: mencapai +430°C di sisi siang dan anjlok hingga -180°C di sisi malam.
- **Venus:** Memiliki ukuran dan massa yang mirip dengan Bumi namun diselimuti atmosfer neraka yang tersusun dari 96% karbon dioksida dengan tekanan permukaan 90 kali lipat Bumi. Akibat fenomena efek rumah kaca tak terkendali (*runaway greenhouse effect*), Venus merupakan planet terpanas di tata surya dengan suhu permukaan konstan ~465°C.
- **Bumi:** Planet unik yang memiliki air dalam wujud cair di permukaan, atmosfer kaya nitrogen-oksigen, serta medan magnet dinamo aktif yang melindungi biosfer dari radiasi surya.
- **Mars:** Memiliki bentang alam spektakuler berupa *Valles Marineris* (ngarai raksasa selebar benua) dan *Olympus Mons* (gunung berapi setinggi 21 km, tertinggi di tata surya). Warna merah khas Mars berasal dari kandungan mineral besi oksida (*karat*) di permukaannya.

### B. Planet Raksasa (Outer Jovian Planets)
Terletak di luar garis beku, material es yang melimpah memungkinkan inti planet tumbuh sangat masif hingga mampu menarik selubung gas hidrogen dan helium secara masif:
- **Raksasa Gas (Jupiter & Saturnus):** Jupiter memiliki massa 2,5 kali lipat total massa seluruh planet lain digabungkan. Di atmosfernya terdapat badai antisiklon raksasa *Great Red Spot* yang telah mengamuk selama ratusan tahun. Saturnus terkenal dengan sistem cincin konsentris spektakuler yang tersusun atas miliaran partikel es murni dan debu berbatu.
- **Raksasa Es (Uranus & Neptunus):** Memiliki selubung tebal senyawa mantel es bertekanan tinggi (air, metana, amonia). Metana di atmosfer atas menyerap cahaya merah dan memantulkan cahaya biru, memberikan rona warna biru pirus pada Uranus dan biru laut pekat pada Neptunus. Neptunus juga memegang rekor planet dengan kecepatan angin atmosfer tercepat di tata surya, melesat hingga 2.100 km/jam.

---

## 3. Hukum Kepler dan Dinamika Gravitasi Newton

Keteraturan orbit planet-planet mengitari Matahari dijelaskan secara matematis melalui **Tiga Hukum Gerak Planet Johannes Kepler** yang disempurnakan oleh Hukum Gravitasi Universal Sir Isaac Newton:

1. **Hukum I Kepler (Hukum Lintasan Elips):** Setiap planet bergerak dalam orbit yang berbentuk elips, bukan lingkaran sempurna, dengan Matahari bertindak sebagai salah satu titik fokusnya (*foci*).
2. **Hukum II Kepler (Hukum Kesamaan Luas):** Vektor radius khayal yang menghubungkan pusat planet ke Matahari menyapu luasan sektor elips yang sama dalam selang waktu yang sama. Akibatnya, kecepatan orbit planet tidak konstan: bergerak paling cepat saat mendekati titik terdekat dengan Matahari (**perihelion**) dan bergerak paling lambat saat berada di titik terjauh (**aphelion**).
3. **Hukum III Kepler (Hukum Periode Harmonik):** Kuadrat periode revolusi suatu planet berbanding lurus dengan pangkat tiga jarak rata-rata sumbu semi-mayor lintasannya dari Matahari:
   $$\frac{T_1^2}{a_1^3} = \frac{T_2^2}{a_2^3} = \text{Konstanta}$$

Newton membuktikan bahwa gaya gravitasi tarik-menarik antara dua massa merupakan gaya sentripetal yang membengkokkan lintasan inersia lurus planet menjadi orbit elips yang stabil selama miliaran tahun.

---

## 4. Batas Luar Tata Surya: Sabuk Kuiper dan Awan Oort

Pengaruh gravitasi Matahari tidak berhenti di orbit Neptunus, melainkan membentang jauh hingga ke perbatasan antarbintang:

![Peta Wilayah Sabuk Kuiper dan Selubung Raksasa Awan Oort](https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Kuiper_belt_-_Oort_cloud-en.svg/500px-Kuiper_belt_-_Oort_cloud-en.svg.png)

- **Sabuk Asteroid:** Wilayah di antara orbit Mars dan Jupiter yang dipenuhi jutaan batuan sisa pembentukan purba yang gagal menyatu akibat gangguan resonansi gravitasi masif Jupiter, rumah bagi planet kerdil *Ceres*.
- **Sabuk Kuiper:** Piringan objek beku di luar orbit Neptunus (30 hingga 55 Satuan Astronomi / AU), rumah bagi planet kerdil *Pluto, Eris, Haumea,* dan *Makemake*.
- **Awan Oort:** Selubung berbentuk bola raksasa hipotetis yang berisi triliunan komet es berperiode panjang, membentang dari jarak 2.000 hingga 100.000 AU (hampir separuh jarak ke bintang terdekat *Proxima Centauri*).

Medan magnet matahari dan angin surya menciptakan gelembung raksasa bernama **heliosfer** yang bertindak sebagai perisai magnetik kosmis utama, membelokkan sinar kosmik galaktik berenergi tinggi agar tidak membombardir sistem planet di dalamnya.

---

## Referensi & Sumber Rujukan

1. [Wikipedia Bahasa Indonesia - Tata Surya: Struktur, Komponen dan Evolusi](https://id.wikipedia.org/wiki/Tata_Surya)
2. [Wikipedia Bahasa Indonesia - Tiga Hukum Gerak Planet Kepler](https://id.wikipedia.org/wiki/Hukum_gerak_planet_Kepler)
3. [Wikipedia Bahasa Indonesia - Sabuk Kuiper dan Objek Trans-Neptunus](https://id.wikipedia.org/wiki/Sabuk_Kuiper)
4. [Wikipedia Bahasa Indonesia - Awan Oort dan Asal-Usul Komet Kosmis](https://id.wikipedia.org/wiki/Awan_Oort)"""

cur.execute("""
UPDATE articles 
SET content = %s,
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'tata-surya-dan-gravitasi-planet';
""", (content_tata_surya,))

conn.commit()
print("Updated Tata Surya article with verified Indonesian references and illustrations!")
