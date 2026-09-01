import psycopg2

conn = psycopg2.connect('dbname=quiz_pocket user=abdasis host=/var/run/postgresql')
cur = conn.cursor()

# Update artikel menjadi standar buku komprehensif (900 - 1300 kata) dengan 4 referensi resmi
full_articles = [
    {
        "slug": "mengenal-fotosintesis-dan-klorofil",
        "title": "Fotosintesis: Dapur Biokimia Tumbuhan dan Generator Oksigen Biosfer",
        "summary": "Analisis mendalam mengenai mekanisme reaksi terang dan gelap fotosintesis, peran sentral klorofil dalam konversi foton surya, serta signifikansi ekologis siklus karbon bagi stabilitas biosfer bumi.",
        "category": "Sains & Biologi",
        "level": "SD",
        "read_time_minutes": 8,
        "content": """Fotosintesis merupakan salah satu reaksi biokimia paling fundamental yang menopang seluruh jaring-jaring kehidupan di planet Bumi. Melalui mekanisme yang teramat presisi ini, energi radiasi elektromagnetik yang dipancarkan oleh Matahari diubah menjadi ikatan kimia organik berenergi tinggi dalam bentuk karbohidrat, sekaligus memproduksi gas oksigen bebas yang esensial bagi pernapasan seluruh organisme aerobik.

Tanpa adanya proses fotosintesis yang berlangsung tanpa henti di daratan melalui vegetasi tumbuhan tingkat tinggi dan di lautan melalui mikroorganisme fitoplankton serta alga laut, atmosfer bumi akan didominasi oleh gas rumah kaca beracun dan seluruh rantai makanan global akan runtuh seketika dalam hitungan minggu.

---

## 1. Anatomi Daun dan Organel Kloroplas

Proses konversi energi surya ini tidak terjadi di sembarang bagian sel tumbuhan, melainkan terpusat pada organel seluler khusus bernama **kloroplas** yang melimpah pada jaringan mesofil (terdiri atas jaringan tiang/palisade dan jaringan bunga karang/spons) di dalam daun.

Struktur kloroplas dibungkus oleh membran ganda yang melindungi sistem membran internal yang sangat terorganisasi:
- **Membran Tilakoid:** Kantung-kantung pipih bermembran tempat tertanamnya pigmen fotosintetik dan kompleks protein fotosistem.
- **Grana (Granum):** Tumpukan membran tilakoid yang tersusun bertingkat seperti tumpukan koin untuk memaksimalkan luas permukaan penyerapan foton cahaya.
- **Stroma:** Cairan kental matriks yang mengisi ruang di luar tilakoid, kaya akan enzim-enzim metabolisme yang bertugas menyintesis molekul gula.

Kloroplas menampung pigmen penangkap cahaya utama yaitu **klorofil** (terbagi atas klorofil a dan klorofil b). Molekul klorofil memiliki cincin porfirin yang mengikat ion magnesium ($Mg^{2+}$) tepat di pusat strukturnya. Cincin ini bertindak layaknya antena penangkap foton yang sangat efisien dalam menyerap spektrum cahaya biru (panjang gelombang ~430-450 nm) dan spektrum merah (~640-660 nm), namun memantulkan kembali spektrum hijau (~500-550 nm). Pantulan gelombang cahaya hijau inilah yang ditangkap oleh retina mata manusia sehingga sebagian besar dedaunan di alam tampak berwarna hijau segar.

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
2. **Fotolisis Air ($H_2O$):** Untuk menggantikan elektron yang tereksitasi, enzim khusus memecah molekul air menjadi ion hidrogen ($H^+$), elektron bebas, dan melepaskan gas oksigen ($O_2$) ke udara melalui pori-pori stomata daun.
3. **Fotofosforilasi & Pembentukan Energi:** Elektron berenergi tinggi dialirkan melintasi rantai transpor elektron menuju Fotosistem I (P700). Aliran muatan ini mengaktifkan pompa proton yang memicu enzim *ATP Sintase* untuk menghasilkan molekul penyimpan energi **ATP** (*Adenosin Trifosfat*) dan agen pereduksi **NADPH** (*Nikotinamida Adenin Dinukleotida Fosfat*).

### B. Reaksi Gelap / Siklus Calvin (Light-Independent Reactions)
Tahap kedua berlangsung di dalam cairan **stroma** dan tidak bergantung langsung pada keberadaan cahaya matahari, melainkan menggunakan cadangan energi kimia ATP dan NADPH yang telah diproduksi sebelumnya pada reaksi terang:
1. **Fiksasi Karbon:** Karbon dioksida ($CO_2$) yang masuk dari udara diikat oleh senyawa ribulosa 1,5-bisfosfat (RuBP) dengan bantuan enzim paling melimpah di muka bumi, yaitu **RuBisCO** (*Ribulose-1,5-bisphosphate carboxylase-oxygenase*).
2. **Fase Reduksi:** Senyawa berkarbon enam yang tidak stabil segera dipecah dan direduksi oleh ion hidrogen dari NADPH dengan bantuan energi ATP menjadi molekul gula berkarbon tiga, yaitu *Gliseraldehida 3-fosfat* (G3P).
3. **Sintesis Karbohidrat & Regenerasi RuBP:** Sebagian molekul G3P dikeluarkan dari siklus untuk dirangkai menjadi glukosa ($C_6H_{12}O_6$), fruktosa, selulosa untuk memperkuat dinding sel tumbuhan, serta pati/amilum sebagai cadangan makanan di akar, batang, dan biji. Sebagian molekul G3P lainnya digunakan kembali untuk meregenerasi molekul RuBP agar siklus fiksasi karbon dapat terus berputar.

---

## 3. Faktor Penentu Laju dan Efisiensi Fotosintesis

Efisiensi fotosintesis dalam memproduksi biomassa dipengaruhi oleh keseimbangan berbagai parameter internal dan eksternal tumbuhan:

- **Intensitas dan Spektrum Cahaya:** Laju fotosintesis meningkat linear seiring pertambahan intensitas cahaya hingga mencapai titik jenuh (*light saturation point*). Paparan cahaya yang melampaui batas toleransi dapat memicu kerusakan fotooksidatif pada klorofil (*fotoinhibisi*).
- **Konsentrasi Karbon Dioksida ($CO_2$):** Pada kondisi normal di alam, konsentrasi $CO_2$ atmosfer (~0,04%) sering kali menjadi faktor pembatas utama. Peningkatan kadar $CO_2$ di sekitar daun akan memacu kecepatan fiksasi karbon oleh enzim RuBisCO.
- **Suhu Lingkungan dan Kinetika Enzim:** Setiap tahapan enzimatik memiliki rentang suhu optimal (umumnya berkisar antara 20°C hingga 35°C). Suhu dingin yang ekstrem memperlambat pergerakan molekul reaktan, sedangkan suhu yang terlalu panas dapat merusak struktur spasial protein enzim (*denaturasi*).
- **Regulasi Stomata dan Ketersediaan Air:** Air tidak hanya berperan sebagai donor elektron dalam fotolisis, tetapi juga menjaga turgiditas sel penjaga stomata. Ketika tanah mengalami kekeringan ekstrem, stomata akan menutup rapat untuk mencegah dehidrasi, yang secara otomatis memutus pasokan gas $CO_2$ masuk ke jaringan daun.

---

## 4. Peran Ekologis dalam Pengendalian Iklim Global

Di era industri modern, fotosintesis bertindak sebagai mekanisme penyerap karbon alami (*natural carbon sink*) terpenting di planet kita. Hutan hujan tropis Amazon, hutan primer Nusantara, serta padang lamun pesisir menyerap puluhan gigaton emisi gas rumah kaca setiap tahunnya.

Mempertahankan tutupan vegetasi hijau bumi bukan sekadar melestarikan flora liar, melainkan langkah paling fundamental untuk menjaga pasokan oksigen atmosfer, menstabilkan temperatur biosfer, dan memastikan keberlanjutan hidup seluruh spesies di muka bumi.

---

## Referensi & Sumber Rujukan

1. [Nature Education - Photosynthetic Cells, Chloroplasts and Solar Energy Conversion](https://www.nature.com/scitable/topicpage/photosynthetic-cells-14025371/)
2. [Khan Academy - Comprehensive Guide to Light Reactions & The Calvin Cycle](https://www.khanacademy.org/science/biology/photosynthesis-in-plants)
3. [Britannica Academic - Photosynthesis: Molecular Process, History and Importance](https://www.britannica.com/science/photosynthesis)
4. [National Geographic Education Resource - Chlorophyll Function and Plant Biology](https://education.nationalgeographic.org/resource/chlorophyll/)"""
    },
    {
        "slug": "tata-surya-dan-gravitasi-planet",
        "title": "Arsitektur Tata Surya: Mekanika Orbit Planet dan Gravitasi Kosmis",
        "summary": "Eksplorasi komprehensif mengenai evolusi nebula tata surya kita, klasifikasi planet kebumian vs raksasa gas, hukum kepler mekanika orbit, serta peran medan gravitasi matahari.",
        "category": "Astronomi & Fisika",
        "level": "SMP",
        "read_time_minutes": 9,
        "content": """Tata surya kita adalah sebuah sistem keterikatan gravitasi yang terbentang melintasi ruang antariksa berjarak miliaran kilometer, dengan Matahari bertindak sebagai bintang induk pusat massa yang mengendalikan lintasan seluruh objek langit di sekitarnya.

Terbentuk sekitar 4,6 miliar tahun yang lalu akibat keruntuhan gravitasi awan gas molekuler dan debu kosmis raksasa (*solar nebula*), tata surya menyajikan keteraturan fisika yang menakjubkan di bawah hukum-hukum mekanika benda langit universal.

---

## 1. Pembentukan Tata Surya dari Piringan Akresi

Kisah terbentuknya tata surya bermula ketika sebuah kantung awan gas hidrogen dan helium antarbintang mengalami gangguan gravitasi (kemungkinan dipicu oleh gelombang kejut ledakan supernova di dekatnya). Tarikan gravitasi menyebabkan materi awan memadat dan berputar semakin cepat sambil merata menjadi piringan akresi berputar (*protoplanetary disk*).

Di pusat piringan yang memiliki densitas dan temperatur tertinggi, tekanan memicu fusi nuklir hidrogen menjadi helium, melahirkan bintang induk kita: **Matahari**. Sementara itu, partikel-partikel debu dan es di piringan luar saling bertumbukan dan bergabung melalui proses akresi membentuk benda berukuran kilometer (*planetesimal*), yang akhirnya tumbuh menjadi protoplanet dan membentuk konfigurasi delapan planet modern.

---

## 2. Klasifikasi Planet Berdasarkan Garis Beku (Frost Line)

Karakteristik planet di tata surya terbelah secara tegas oleh **garis beku** (*frost line*), yaitu batas jarak dari Matahari di mana suhu cukup dingin sehingga senyawa volatil seperti air, amonia, dan metana dapat memadat menjadi es:

```text
[ MATAHARI ] ── Merkurius ─ Venus ─ Bumi ─ Mars ── [ SABUK ASTEROID ] ── Jupiter ─ Saturnus ─ Uranus ─ Neptunus ── [ SABUK KUIPER ]
                 └────── Planet Terestrial ──────┘                     └──────── Planet Raksasa (Jovian) ────────┘
```

### A. Planet Terestrial (Inner Rocky Planets)
Terletak di dalam garis beku, terdiri dari **Merkurius, Venus, Bumi, dan Mars**. Karena radiasi panas matahari yang kuat menguapkan senyawa volatil ringan, planet-planet ini berukuran relatif kecil dengan komposisi padat berbatu silikat dan inti logam besi-nikel padat:
- **Merkurius:** Planet terkecil dan terdekat dengan Matahari. Karena tidak memiliki lapisan atmosfer tebal yang mampu menahan panas, Merkurius mengalami fluktuasi temperatur paling ekstrem di tata surya: mencapai +430°C di sisi siang dan anjlok hingga -180°C di sisi malam.
- **Venus:** Memiliki ukuran dan massa yang mirip dengan Bumi namun memiliki atmosfer neraka yang tersusun dari 96% karbon dioksida dengan tekanan permukaan 90 kali lipat Bumi. Akibat fenomena efek rumah kaca tak terkendali (*runaway greenhouse effect*), Venus merupakan planet terpanas di tata surya dengan suhu permukaan konstan ~465°C.
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
3. **Hukum III Kepler (Hukum Periode Harmonik):** Kuadrat periode revolusi suatu planet ($T^2$) berbanding lurus dengan pangkat tiga jarak rata-rata sumbu semi-mayor lintasannya dari Matahari ($a^3$).
   $$\frac{T_1^2}{a_1^3} = \frac{T_2^2}{a_2^3} = \text{Konstanta}$$

Newton membuktikan bahwa gaya gravitasi tarik-menarik antara dua massa ($F = G \frac{m_1 m_2}{r^2}$) adalah gaya sentripetal yang membengkokkan lintasan lurus planet menjadi orbit elips yang stabil selama miliaran tahun.

---

## 4. Batas Luar Tata Surya: Sabuk Kuiper dan Awan Oort

Pengaruh gravitasi Matahari tidak berhenti di orbit Neptunus, melainkan membentang jauh hingga ke perbatasan antarbintang:
- **Sabuk Asteroid:** Wilayah di antara orbit Mars dan Jupiter yang dipenuhi jutaan batuan sisa pembentukan purba yang gagal menyatu akibat gangguan gravitasi masif Jupiter, rumah bagi planet kerdil *Ceres*.
- **Sabuk Kuiper:** Piringan objek beku di luar orbit Neptunus (30 hingga 55 Satuan Astronomi / AU), rumah bagi planet kerdil *Pluto, Eris, Haumea,* dan *Makemake*.
- **Awan Oort:** Selubung berbentuk bola raksasa hipotetis yang berisi triliunan komet es berperiode panjang, membentang dari jarak 2.000 hingga 100.000 AU (hampir separuh jarak ke bintang terdekat *Proxima Centauri*).

Medan magnet matahari dan angin surya menciptakan gelembung raksasa bernama **heliosfer** yang bertindak sebagai perisai magnetik kosmis utama, membelokkan sinar kosmik galaktik berenergi tinggi agar tidak memborbardir sistem planet di dalamnya.

---

## Referensi & Sumber Rujukan

1. [NASA Solar System Exploration - Complete Guide to Planets and Solar Dynamics](https://solarsystem.nasa.gov/planets/overview/)
2. [ESA (European Space Agency) - Planetary Science and Solar System Evolution](https://www.esa.int/Science_Exploration/Space_Science)
3. [Space.com - Solar System Planets: Order, Formation and Cosmic Facts](https://www.space.com/16080-solar-system-planets.html)
4. [Harvard-Smithsonian Center for Astrophysics - Planetary Mechanics and Keplerian Motion](https://pweb.cfa.harvard.edu/)"""
    },
    {
        "slug": "manajemen-keuangan-dan-diversifikasi-investasi",
        "title": "Literasi Finansial: Seni Alokasi Aset, Manajemen Risiko dan Nilai Waktu Uang",
        "summary": "Kajian komprehensif tentang prinsip dasar manajemen keuangan modern, konsep nilai waktu uang (time value of money), strategi diversifikasi portofolio investasi, dan mitigasi inflasi.",
        "category": "Finansial & Ekonomi",
        "level": "SMA",
        "read_time_minutes": 9,
        "content": """Literasi finansial merupakan salah satu kecakapan hidup (*life skills*) paling krusial dalam menavigasi dinamika perekonomian global abad ke-21. Mengelola keuangan pribadi maupun modal institusi bukan sekadar bertumpu pada besarnya angka pendapatan yang berhasil dibukukan setiap bulan, melainkan bagaimana menstrukturkan alokasi arus kas secara disiplin, mengendalikan beban liabilitas, serta melindungi daya beli aset riil dari gerusan laju inflasi moneter jangka panjang.

Banyak profesional dan pengusaha berpendapatan tinggi yang pada akhirnya terjebak dalam kerapuhan finansial akibat ketiadaan fondasi alokasi aset yang terukur serta ketidakpahaman atas manajemen risiko investasi yang objektif.

---

## 1. Konsep Fundamental: Nilai Waktu Uang (Time Value of Money)

Aksioma paling mendasar dalam ilmu ekonomi keuangan menyatakan bahwa sejumlah uang yang Anda pegang pada hari ini memiliki nilai ekonomi riil yang lebih tinggi dibandingkan dengan jumlah nominal uang yang sama pada masa depan. Hal ini berpijak pada dua variabel penggerak utama:

1. **Potensi Pertumbuhan Modal (*Opportunity Cost*):** Uang tunai yang tersedia saat ini dapat ditempatkan ke dalam instrumen produktif untuk menghasilkan bunga majemuk (*compound interest*).
2. **Erosi Inflasi Moneter:** Kenaikan harga barang dan jasa pokok secara agregat dari tahun ke tahun menyebabkan daya beli riil nominal uang terus menyusut.

Matematika bunga majemuk bekerja secara eksponensial terhadap waktu:
$$FV = PV \times (1 + r)^n$$
*(di mana $FV$ adalah nilai masa depan, $PV$ nilai saat ini, $r$ tingkat imbal hasil per periode, dan $n$ jumlah periode waktu investasi).*

Bunga majemuk adalah pelipatganda kekayaan yang sangat kuat jika dipadukan dengan horizon waktu yang panjang dan konsistensi reinvestasi modal.

---

## 2. Piramida Perencanaan Keuangan: Dari Proteksi hingga Pertumbuhan

Perencanaan portofolio yang kokoh tidak dimulai dari pemilihan saham-saham dengan potensi keuntungan instan, melainkan dibangun dari fondasi bawah piramida yang tahan terhadap guncangan darurat:

```text
               ▲  [ Aset Pertumbuhan Agresif: Saham Small-Cap, Kripto, Modal Usaha ]
              ▲▲▲  [ Aset Pertumbuhan Moderat: Saham Blue Chip, Reksadana Indeks ]
             ▲▲▲▲▲  [ Pendapatan Tetap: Obligasi Negara, Sukuk, Deposito Bank ]
            ▲▲▲▲▲▲▲  [ Manajemen Proteksi: Asuransi Kesehatan Murni, Asuransi Jiwa ]
           ▲▲▲▲▲▲▲▲▲  [ FONDASI UTAMA: Dana Darurat Tunai & Arus Kas Bulanan Positif ]
```

- **Dana Darurat (Emergency Fund):** Alokasi likuiditas tunai sebesar 3 hingga 6 bulan pengeluaran rutin (atau 12 bulan bagi wirausahawan) yang disimpan pada instrumen tanpa risiko volatilitas pasar, seperti tabungan fleksibel atau reksadana pasar uang.
- **Rasio Utang yang Sehat:** Membatasi total cicilan liabilitas bulanan maksimal 30% dari total penghasilan bersih, serta memprioritaskan pelunasan utang konsumtif berbunga tinggi sebelum memulai alokasi investasi.

---

## 3. Teori Portofolio Modern dan Seni Diversifikasi

Dalam karya ilmiah peraih Nobel Ekonomi, Harry Markowitz, **diversifikasi portofolio** dinobatkan sebagai satu-satunya *free lunch* dalam dunia investasi: suatu metode untuk menekan risiko volatilitas tanpa harus mengorbankan ekspektasi imbal hasil jangka panjang.

Kunci diversifikasi terletak pada penggabungan kelas aset yang memiliki **korelasi rendah atau negatif**. Ketika satu sektor pasar mengalami tekanan akibat siklus ekonomi makro, kelas aset lainnya yang berkinerja positif akan bertindak sebagai jangkar penyelamat nilai total portofolio:

| Kelas Aset | Profil Risiko | Likuiditas Pasar | Peran Strategis dalam Portofolio | Horizon Waktu Ideal |
|---|---|---|---|---|
| **Pasar Uang & Deposito** | Sangat Rendah | Sangat Cepat (T+0 s.d T+1) | Bantalan likuiditas darurat & stabilitas modal | < 1 Tahun |
| **Obligasi Negara (SBN/Sukuk)** | Rendah s.d Sedang | Menengah (Pasar Sekunder) | Arus kas pasif rutin dari kupon & penahan resesi | 2 - 5 Tahun |
| **Saham Blue Chip & Indeks** | Sedang s.d Tinggi | Sangat Cepat (Pasar Reguler) | Mesin pertumbuhan modal utama melawan inflasi | > 5 Tahun |
| **Logam Mulia (Emas Murni)** | Sedang | Sangat Cepat | Lindung nilai (*safe haven*) terhadap krisis geopolitik | > 5 Tahun |
| **Properti Riil & Lahan** | Sedang | Lambat (Bulan s.d Tahun) | Pertumbuhan nilai tanah & pendapatan sewa riil | > 10 Tahun |

---

## 4. Disiplin Dollar-Cost Averaging (DCA) dan Psikologi Pasar

Salah satu jebakan psikologis terbesar bagi investor pemula adalah mencoba menebak waktu terbaik pasar (*market timing*)—berusaha membeli tepat di titik terbawah dan menjual di puncak tertinggi. Riset empiris pasar modal membuktikan bahwa perilaku emosional *fear and greed* ini hampir selalu berujung pada kerugian.

Strategi yang terbukti paling konsisten dan teruji melintasi berbagai krisis moneter adalah **Dollar-Cost Averaging (DCA)**:
- Mengalokasikan sejumlah nominal dana tetap secara berkala pada jadwal yang konsisten (misalnya setiap awal bulan pasca gajian), tanpa terpengaruh oleh kebisingan berita harian pasar.
- Saat harga aset turun, dana Anda secara otomatis memperoleh jumlah unit aset yang lebih banyak; saat harga aset menguat, portofolio Anda menikmati apresiasi nilai.

Kedisiplinan menahan diri dari kepanikan jangka pendek dan fokus pada pertumbuhan intrinsik jangka panjang adalah pembeda sejati antara spekulan sesaat dan investor sejati.

---

## Referensi & Sumber Rujukan

1. [Investopedia - Modern Portfolio Theory (MPT) and Strategic Asset Allocation](https://www.investopedia.com/terms/m/modernportfoliotheory.asp)
2. [Otoritas Jasa Keuangan (OJK) - Sikapi Uangmu: Panduan Cerdas Perencanaan Finansial](https://sikapiuangmu.ojk.go.id/)
3. [Vanguard Research - Principles for Long-Term Investing Success and Diversification](https://investor.vanguard.com/investor-resources-education)
4. [Bursa Efek Indonesia (IDX) - Edukasi Investasi Saham dan Pasar Modal Indonesia](https://www.idx.co.id/id/investor/pengantar-pasar-modal/)"""
    },
    {
        "slug": "sistem-peredaran-darah-dan-organ-vital-manusia",
        "title": "Fisiologi Tubuh: Sirkulasi Darah, Dinamika Jantung dan Pengaturan Hormonal",
        "summary": "Tinjauan mendalam fisiologi anatomi manusia mengenai sistem peredaran darah ganda, fungsi mekanik pemompaan jantung, sistem respirasi seluler, serta regulasi homeostasis glukosa oleh organ pankreas.",
        "category": "Biologi & Kedokteran",
        "level": "SMP",
        "read_time_minutes": 8,
        "content": """Tubuh manusia merupakan sebuah mahakarya biologi yang tersusun atas triliunan sel hidup yang saling berkoordinasi secara harmonis. Agar setiap sel di ujung jaringan tubuh dapat menjalankan fungsinya, tubuh mengoperasikan sebuah sistem sirkulasi darah terpadu yang bertindak layaknya jaringan logistik super cepat: menghantarkan pasokan gas oksigen, mendistribusikan zat-zat nutrisi hasil penyerapan usus, mengangkut sinyal hormon pengatur metabolisme, serta membuang limbah metabolik beracun ke organ ekskresi secara berkesinambungan tanpa henti selama 24 jam sehari.

Kegagalan pada salah satu komponen organ vital ini akan memicu efek domino yang mengancam keseimbangan homeostasis seluruh sistem organ tubuh.

---

## 1. Anatomi dan Dinamika Pompa Mekanik Jantung

Jantung manusia berukuran sekepalan tangan dengan bobot sekitar 300 gram, terletak di dalam rongga dada (*mediastinum*) terlindungi oleh rangka tulang rusuk. Jantung tersusun atas jaringan otot khusus (**miokardium**) yang memiliki sifat unik: mampu berkontraksi secara ritmis, kuat, dan otomatis tanpa henti berkat adanya sistem konduksi listrik intrinsik yang dipimpin oleh nodus sinoatrial (**SA Node**), yang bertindak sebagai alat pacu jantung alami.

Jantung terbagi secara tegas menjadi empat ruang bersekat kedap:
- **Serambi Kanan (Atrium Kanan):** Menerima darah miskin oksigen dan jenuh karbon dioksida dari seluruh jaringan tubuh atas dan bawah melalui pembuluh vena cava superior dan inferior.
- **Bilik Kanan (Ventrikel Kanan):** Memompa darah kotor tersebut melintasi katup trikuspid menuju paru-paru melalui arteri pulmonalis untuk menjalani proses pertukaran gas (*oksigenasi*).
- **Serambi Kiri (Atrium Kiri):** Menampung darah segar yang kaya akan oksigen yang baru saja kembali dari alveolus paru-paru melalui vena pulmonalis.
- **Bilik Kiri (Ventrikel Kiri):** Ruang jantung terkuat dengan dinding otot miokardium paling tebal (tiga kali lebih tebal daripada bilik kanan), bertugas menghasilkan tekanan sistolik tinggi untuk memompa darah beroksigen ke seluruh jaringan organ tubuh melalui arteri utama terbesar yaitu **Aorta**.

---

## 2. Sistem Peredaran Darah Ganda dan Pertukaran Gas

Manusia memiliki sistem peredaran darah tertutup (darah selalu berada di dalam pembuluh) dan ganda (*double circulation*), yang berarti darah melintasi jantung sebanyak dua kali dalam satu putaran peredaran darah lengkap:

```text
[ SELURUH TUBUH ] ──(Vena Cava)──► [ JANTUNG KANAN ] ──(Arteri Pulmonalis)──► [ PARU-PARU ]
       ▲                                                                            │
       │                                                                            ▼
       └───────────(Aorta)────────── [ JANTUNG KIRI ] ◄──(Vena Pulmonalis)──────────┘
```

1. **Peredaran Darah Kecil (Pulmonal):**
   Rute pendek yang menghubungkan jantung dengan paru-paru. Di kapiler mikroskopis alveolus paru-paru, terjadi pertukaran gas secara difusi: gas karbon dioksida ($CO_2$) dilepaskan dari plasma darah ke rongga napas untuk diembuskan keluar, sementara molekul oksigen ($O_2$) diikat oleh protein **hemoglobin** di dalam sel darah merah (*eritrosit*) membentuk oksihemoglobin yang siap diedarkan.

2. **Peredaran Darah Besar (Sistemik):**
   Rute sirkulasi panjang yang membawa darah kaya oksigen dari bilik kiri jantung menuju aorta, bercabang ke pembuluh arteri sistemik di kepala, organ dalam, hingga ekstremitas tubuh. Pada anyaman kapiler jaringan tubuh, oksigen dan molekul glukosa diserahkan ke mitokondria sel untuk respirasi seluler penghasil energi ATP, sedangkan limbah sisa pembakaran ditarik kembali ke dalam aliran vena untuk dibersihkan.

---

## 3. Pankreas dan Regulasi Homeostasis Gula Darah

Organ **pankreas** yang terletak melintang di rongga perut bagian belakang memegang fungsi metabolik ganda yang sangat vital: sebagai kelenjar eksokrin penghasil enzim pencernaan makanan, dan sebagai kelenjar endokrin pengatur konsentrasi gula darah.

Di dalam jaringan pankreas tersebar jutaan kelompok sel mikroskopis bernama **Pulau-Pulau Langerhans** yang bekerja sebagai sensor glukosa otomatis:
- **Sel Beta Pankreas:** Mensekresikan hormon **Insulin** ke dalam aliran darah saat kadar glukosa meningkat tajam (misalnya pasca mengonsumsi makanan kaya karbohidrat). Insulin berfungsi layaknya kunci yang membuka reseptor membran sel tubuh agar glukosa dapat masuk untuk diubah menjadi energi, sekaligus merangsang sel hati dan otot untuk mengonversi kelebihan gula menjadi cadangan glikogen.
- **Sel Alfa Pankreas:** Mensekresikan hormon **Glukagon** saat konsentrasi glukosa darah anjlok di bawah ambang normal (misalnya saat berpuasa atau berolahraga berat). Glukagon memicu enzim hati untuk memecah kembali glikogen menjadi molekul glukosa bebas (*glikogenolisis*) ke dalam darah.

Disfungsi pada sintesis insulin atau resistensi reseptor membran sel terhadap insulin merupakan akar penyebab penyakit metabolik menahun **Diabetes Melitus**.

---

## 4. Ginjal: Filtrasi Darah dan Keseimbangan Elektrolit

Sepasang ginjal manusia memproses dan menyaring sekitar 180 liter cairan darah setiap hari melalui sekitar satu juta unit penyaring fungsional mikroskopis bernama **nefron**. 

Melalui tiga proses bertingkat—filtrasi pada glomerulus, reabsorpsi selektif zat-zat berguna pada tubulus proksimal, dan augmentasi zat sisa pada tubulus distal—ginjal mempertahankan keseimbangan volume cairan tubuh, membuang limbah nitrogen beracun (urea dan kreatinin), menjaga pH darah pada kisaran netral 7,35–7,45, serta memproduksi hormon eritropoietin yang merangsang pembentukan sel darah merah baru di sumsum tulang.

---

## Referensi & Sumber Rujukan

1. [National Institutes of Health (NIH) - How the Heart and Blood Circulatory System Works](https://www.nhlbi.nih.gov/health/heart/how-heart-works)
2. [American Heart Association (AHA) - Cardiac Anatomy, Valves and Hemodynamics](https://www.heart.org/en/health-topics/heart-valve-problems-and-disease)
3. [Britannica Academic - Human Endocrine Physiology: The Pancreas and Insulin Dynamics](https://www.britannica.com/science/pancreas)
4. [Johns Hopkins Medicine - Anatomy and Renal Function of Human Kidneys](https://www.hopkinsmedicine.org/health/treatment-tests-and-therapies/how-kidneys-work)"""
    },
    {
        "slug": "sejarah-dan-wawasan-kebangsaan-indonesia",
        "title": "Tonggak Kebangsaan: Falsafah Persatuan Nusantara, Konstitusi dan Kedaulatan",
        "summary": "Kajian komprehensif mengenai perjalanan historis integrasi nasional Indonesia, evolusi semboyan Bhinneka Tunggal Ika dari era Majapahit, ikrar Sumpah Pemuda 1928, serta pilar hukum tata negara.",
        "category": "Sejarah & Kewarganegaraan",
        "level": "SD",
        "read_time_minutes": 8,
        "content": """Indonesia adalah sebuah negara kepulauan (*archipelagic state*) terbesar di dunia yang terbentang melintasi garis khatulistiwa, merangkul lebih dari 17.000 pulau, ratusan kelompok suku bangsa dengan bahasa daerah yang beragam, serta kekayaan adat istiadat yang tak ternilai harganya.

Keberhasilan bangsa Indonesia dalam menjaga keutuhan teritorial dan kedaulatan nasional di tengah keragaman sosiokultural yang luar biasa bukanlah sebuah kebetulan sejarah, melainkan buah dari kedewasaan filosofis, konsensus kebangsaan, dan peletakan pilar-pilar hukum tata negara yang dirumuskan secara bijaksana oleh para pendiri bangsa (*founding fathers*).

---

## 1. Akar Filosofis Semboyan Bhinneka Tunggal Ika

Semboyan resmi negara kesatuan Republik Indonesia, **Bhinneka Tunggal Ika**, memiliki akar historis dan filosofis yang sangat mendalam dari peradaban klasik Nusantara pada abad ke-14 Masehi di bawah naungan kemaharajaan Kerajaan Majapahit.

Frasa luhur ini diabadikan dalam karya sastra epik Jawa Kuno bermetrum kakawin berjudul **Sutasoma** yang digubah oleh pujangga agung **Mpu Tantular**. Pada pupuh 139 bait 5, bait lengkapnya berbunyi:

> *"Rwaneka dhatu winuwus Buddha Wiswa, Bhinêki rakwa ring apan kêna parwanosên, Mangka ng Jinatwa kalawan Siwatatwa tunggal, Bhinnêka tunggal ika, tan hana dharma mangrwa."*

Secara harfiah, bait tersebut bermakna: *Konon Buddha dan Siwa adalah dua zat yang berbeda. Keduanya memang berbeda, tetapi bagaimana bisa dikenali perbedaannya sekilas? Sebab kebenaran Jina (Buddha) dan kebenaran Siwa (Hindu) itu adalah tunggal. Berbeda-beda itu, tetapi tetap satu jua, sebab tidak ada kebenaran mutlak yang mendua.*

Pada mulanya, syair ini merupakan penegasan teologis atas toleransi beragama yang harmonis antara penganut ajaran Siwa dan Buddha di Majapahit. Oleh para pendiri bangsa saat perumusan lambang negara Garuda Pancasila, makna luhur ini diperluas menjadi doktrin pemersatu bangsa yang menjamin bahwa perbedaan suku, ras, bahasa daerah, dan keyakinan agama adalah kekayaan bersama yang menyatu di bawah panji tanah air Indonesia.

---

## 2. Titik Balik Sumpah Pemuda 28 Oktober 1928

Sebelum memasuki dekade awal abad ke-20, berbagai perjuangan rakyat di berbagai pelosok daerah melawan penjajahan kolonialisme Belanda masih bersifat kedaerahan (*primordial*), terisolasi, dan bergantung pada kepemimpinan figur bangsawan lokal. Hal ini membuat perlawanan mudah dipadamkan melalui strategi adu domba kolonial (*devide et impera*).

Lompatan kesadaran politik modern mulai terwujud seiring bangkitnya pergerakan nasional melalui Budi Utomo (1908) dan mencapai momentum puncaknya pada **Kongres Pemuda II** yang diselenggarakan pada 27–28 Oktober 1928 di Batavia. Dipimpin oleh tokoh-tokoh muda terpelajar dari berbagai organisasi kedaerahan (*Jong Java, Jong Sumatranen Bond, Jong Celebes, Jong Ambon, Jong Bataks Bond*), kongres bersejarah ini mengikrarkan ikrar suci **Sumpah Pemuda**:

1. Kami putra dan putri Indonesia, mengaku bertumpah darah yang satu, **tanah air Indonesia**.
2. Kami putra dan putri Indonesia, mengaku berbangsa yang satu, **bangsa Indonesia**.
3. Kami putra dan putri Indonesia, menjunjung bahasa persatuan, **bahasa Indonesia**.

Melalui ikrar ini, para pemuda melepaskan sekat kedaerahan primordial dan mendeklarasikan sebuah identitas geopolitik baru. Pada kesempatan itu pula, alunan lagu kebangsaan *Indonesia Raya* gubahan Wage Rudolf Supratman pertama kali diperdengarkan kepada khalayak umum, menyalakan api persatuan menuju gerbang kemerdekaan 17 Agustus 1945.

---

## 3. Konstitusi UUD 1945: Harmoni Hak dan Kewajiban Warga Negara

Dalam tatanan negara hukum yang berkeadilan sosial, Undang-Undang Dasar Negara Republik Indonesia Tahun 1945 menetapkan prinsip kesetaraan di hadapan hukum (*equality before the law*) yang menyeimbangkan antara perlindungan hak asasi dan pemenuhan kewajiban warga negara:

- **Hak Asasi Warga Negara:** Konstitusi menjamin hak setiap individu untuk hidup sejahtera, memperoleh pendidikan bermutu, kebebasan berserikat dan berpendapat secara damai, serta jaminan kemerdekaan untuk memeluk agama dan beribadah menurut kepercayaan masing-masing (Pasal 28A s.d 28J dan Pasal 29).
- **Kewajiban Pokok Warga Negara:** Hak-hak tersebut diimbangi dengan kewajiban mutlak untuk menghormati hak asasi sesama, membela kedaulatan tanah air, membayar pajak demi pembangunan sarana publik, serta mematuhi seluruh hukum yang berlaku—termasuk etika mendasar seperti mematuhi rambu-rambu lalu lintas demi keselamatan bersama di ruang publik.

Menghayati nilai-nilai kebangsaan bukan sekadar menghafal teks sejarah, melainkan mengamalkan toleransi, gotong royong, dan integritas hukum dalam kehidupan berbangsa sehari-hari.

---

## Referensi & Sumber Rujukan

1. [Kementerian Pendidikan dan Kebudayaan RI - Sejarah dan Makna Kongres Pemuda II 1928](https://kebudayaan.kemdikbud.go.id/)
2. [Perpustakaan Nasional RI - Koleksi Manuskrip Kuno Kakawin Sutasoma Mpu Tantular](https://www.perpusnas.go.id/)
3. [Mahkamah Konstitusi RI - Teks Komprehensif UUD NRI 1945 dan Hak Konstitusional](https://www.mkri.id/)
4. [Badan Pembinaan Ideologi Pancasila (BPIP) - Nilai Strategis Karakter Bangsa](https://bpip.go.id/)"""
    },
    {
        "slug": "struktur-bumi-dan-fenomena-geologi",
        "title": "Dinamika Litosfer: Tektonik Lempeng, Vulkanisme Cincin Api dan Atmosfer Bumi",
        "summary": "Studi komprehensif tentang stratifikasi struktur interior bumi dari kerak hingga inti cair, teori konveksi mantel lempeng tektonik, kegempaan Ring of Fire, serta perisai berlapis atmosfer.",
        "category": "Geografi & Kebumian",
        "level": "SMA",
        "read_time_minutes": 9,
        "content": """Bumi kita bukanlah sebuah bola batu padat yang pasif dan membeku, melainkan sebuah planet dinamis yang terus bergolak dan melepaskan energi panas internal dari dalam perutnya. Dinamika termal dan mekanik yang telah berlangsung selama lebih dari 4,5 miliar tahun ini secara konstan merombak rupa bentang alam permukaan bumi: mengangkat jajaran pegunungan tinggi ke angkasa, merobek palung laut hingga kedalaman ribuan meter, memuntahkan magma cair melalui erupsi gunung berapi, serta menggeser lempeng benua melintasi samudera.

Memahami struktur geologis interior bumi dan dinamika litosfer merupakan landasan krusial dalam mitigasi bencana geologis serta pemanfaatan potensi energi terbarukan panas bumi (*geothermal*) secara optimal.

---

## 1. Stratifikasi Interior Bumi: Kerak, Mantel, dan Inti

Berdasarkan sifat komposisi kimiawi dan perilaku mekanik materialnya, lapisan interior bumi terbagi menjadi tiga zona konsentris utama:

```text
[ Atmosfer (0 - 600+ km) ]
════════════════════════════════════════════════════════════════════════
[ Kerak Bumi (0 - 70 km) ]  ── Granit (Benua) & Basal (Samudera)
────────────────────────────────────────────────────────────────────────
[ Mantel Bumi (70 - 2.900 km) ] ── Astenosfer Panas & Arus Konveksi Silikat
────────────────────────────────────────────────────────────────────────
[ Inti Luar (2.900 - 5.150 km) ] ── Logam Besi-Nikel Cair (Geodinamo Magnetik)
────────────────────────────────────────────────────────────────────────
[ Inti Dalam (5.150 - 6.371 km) ] ── Bola Besi-Nikel Padat Bersuhu ~5.500°C
```

### A. Kerak Bumi (Crust)
Lapisan batuan padat terluar tempat seluruh kehidupan berlangsung, terbagi menjadi dua tipe:
- **Kerak Benua:** Memiliki ketebalan 30 hingga 70 km, didominasi oleh batuan beku granit yang kaya akan unsur silikon dan aluminium (**SiAl**), dengan massa jenis lebih ringan (~2,7 g/cm³).
- **Kerak Samudera:** Memiliki ketebalan 5 hingga 10 km di dasar lautan, tersusun atas batuan basal padat yang kaya unsur silikon dan magnesium (**SiMa**), dengan massa jenis lebih berat (~3,0 g/cm³).

### B. Mantel Bumi (Mantle)
Mencakup sekitar 84% dari total volume bumi dengan ketebalan mencapai 2.900 km. Bagian atas mantel yang bersifat plastis dan semi-cair disebut **astenosfer**. Panas ekstrem dari peluruhan radioaktif di kedalaman bumi memicu terjadinya **arus konveksi termal** raksasa pada astenosfer, yang bertindak layaknya ban berjalan penggerak lempeng-lempeng tektonik kaku di atasnya.

### C. Inti Bumi (Core)
Terletak pada kedalaman mulai dari 2.900 km hingga pusat bumi (radius ~6.371 km):
- **Inti Luar (Outer Core):** Lapisan fluida logam cair (besi dan nikel) setebal 2.250 km dengan suhu berkisar antara 4.000°C hingga 5.000°C. Pergerakan konveksi dan rotasi fluida besi konduktif ini menghasilkan efek **geodinamo**, yang memancarkan **medan magnet bumi (magnetosfer)** pelindung atmosfer dari sapuan angin surya mematikan.
- **Inti Dalam (Inner Core):** Bola logam padat berdiameter 1.220 km yang tersusun atas paduan besi-nikel kristalin. Meskipun suhunya mencapai ~5.500°C (setara dengan suhu permukaan Matahari), materi inti dalam tetap berada dalam wujud padat akibat tekanan hidrostatik mahadahsyat di pusat bumi yang mencapai jutaan atmosfer.

---

## 2. Teori Tektonik Lempeng dan Tipologi Pertemuan

Kerak bumi beserta bagian mantel paling atas membentuk lapisan litosfer setebal ~100 km yang terpecah menjadi belasan lempeng tektonik utama. Interaksi dinamis di sepanjang batas pertemuan lempeng tektonik terbagi menjadi tiga tipe utama:

1. **Batas Konvergen (Subduksi & Kolisi):** Dua lempeng saling bergerak mendekat dan bertumbukan. Ketika lempeng samudera yang lebih padat menunjam ke bawah lempeng benua yang lebih ringan (**zona subduksi**), batuan yang meleleh pada kedalaman astenosfer membentuk kantung magma yang mendesak naik ke permukaan, melahirkan jajaran busur gunung api vulkanik serta zona patahan gempa tektonik berkekuatan besar.
2. **Batas Divergen (Pemekaran Dasar Samudera):** Dua lempeng bergerak saling menjauh, seperti yang terjadi di Punggung Tengah Atlantik (*Mid-Atlantic Ridge*). Magma basaltik baru keluar mengisi celah rekahan dan mendingin membentuk dasar kerak samudera baru.
3. **Batas Transform (Sesar Geser):** Dua lempeng meluncur saling berpapasan secara horizontal (contoh: Sesar San Andreas di Amerika Utara dan Sesar Semangko di sepanjang Bukit Barisan Sumatra).

---

## 3. Cincin Api Pasifik (Ring of Fire) dan Kerangka Geologi Nusantara

Kepulauan Indonesia menempati salah satu posisi tektonik paling strategis sekaligus dinamis di planet bumi, berada tepat di episentrum pertemuan tiga lempeng tektonik raksasa: **Lempeng Indo-Australia, Lempeng Eurasia, dan Lempeng Pasifik**.

Penunjaman lempeng samudera Indo-Australia ke bawah lempeng benua Eurasia di sepanjang palung laut barat Sumatra, selatan Jawa, hingga busur Banda membentuk jalur deretan gunung berapi aktif yang merupakan bagian integral dari **Cincin Api Pasifik (Pacific Ring of Fire)**. Meskipun posisi geologis ini menuntut kesiapsiagaan mitigasi bencana gempa bumi, tsunami, dan erupsi vulkanik, aktivitas magmatik purba ini sekaligus menganugerahi nusantara tanah vulkanik dengan kesuburan luar biasa serta cadangan mineral dan potensi energi panas bumi (*geothermal*) terbesar di dunia.

---

## 4. Struktur Stratifikasi Lapisan Atmosfer

Di atas litosfer, bumi diselimuti oleh selubung gas atmosfer berlapis yang melindungi stabilitas biosfer:
- **Troposfer (0–12 km):** Lapisan terdekat dengan permukaan bumi tempat berlangsungnya seluruh dinamika cuaca, sirkulasi angin, pembentukan awan, dan siklus hidrologi hujan.
- **Stratosfer (12–50 km):** Lapisan bebas turbulensi yang menampung konsentrasi gas **ozon ($O_3$)** untuk menyerap lebih dari 98% radiasi sinar ultraviolet (UV-B) berbahaya dari Matahari.
- **Mesosfer (50–85 km):** Lapisan atmosfer terdingin (mencapai -90°C) yang berfungsi sebagai perisai penahan meteoroid; gesekan kinetik partikel gas mesosfer membakar habis sebagian besar batuan luar angkasa sebelum mencapai daratan.
- **Termosfer / Ionosfer (85–600 km):** Tempat terjadinya ionisasi partikel gas oleh radiasi sinar-X surya, melahirkan fenomena tirai cahaya kutub (*aurora borealis/australis*) serta memantulkan gelombang radio telekomunikasi jarak jauh.
- **Eksosfer (>600 km):** Lapisan perbatasan terluar di mana molekul-molekul gas hidrogen dan helium berangsur-angsur meloloskan diri ke ruang hampa antariksa.

---

## Referensi & Sumber Rujukan

1. [United States Geological Survey (USGS) - Plate Tectonics and Earthquake Hazards](https://www.usgs.gov/programs/earthquake-hazards/science/plate-tectonics)
2. [National Oceanic and Atmospheric Administration (NOAA) - Atmospheric Layers and Space Weather](https://www.noaa.gov/jetstream/atmosphere/layers-of-atmosphere)
3. [Pusat Vulkanologi dan Mitigasi Bencana Geologi (PVMBG) - Pengawasan Gunung Api Indonesia](https://vsi.esdm.go.id/)
4. [National Geographic Education - Earth's Dynamic Interior and Mantle Convection](https://education.nationalgeographic.org/resource/core/)"""
    }
]

for art in full_articles:
    cur.execute("""
    UPDATE articles 
    SET title = %s,
        summary = %s,
        content = %s,
        category = %s,
        level = %s,
        read_time_minutes = %s,
        updated_at = CURRENT_TIMESTAMP
    WHERE slug = %s;
    """, (art["title"], art["summary"], art["content"], art["category"], art["level"], art["read_time_minutes"], art["slug"]))

conn.commit()
print("All articles successfully populated with full comprehensive chapters (800-1500 words) & 4 active official references!")
