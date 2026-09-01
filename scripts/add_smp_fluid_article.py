import psycopg2

conn = psycopg2.connect('dbname=quiz_pocket user=abdasis host=/var/run/postgresql')
cur = conn.cursor()

title = "Mekanika Fluida & Tekanan: Hukum Pascal, Prinsip Archimedes dan Tekanan Hidrostatis"
slug = "tekanan-fluida-pascal-dan-archimedes"
category = "Fisika SMP"
level = "SMP"
icon = "Compass"
read_time = 8
summary = "Materi fisika SMP mendalam tentang konsep tekanan zat padat, tekanan hidrostatis zat cair, hukum Pascal pada dongkrak hidrolik, gaya apung Archimedes, dan hukum Boyle gas ideal."

content = """Tekanan (*pressure*) merupakan salah satu besaran fisika paling fundamental yang menjelaskan bagaimana suatu gaya terdistribusi pada permukaan suatu benda. Dalam mekanika fluida (zat cair dan gas), perilaku tekanan memiliki karakteristik unik yang menjadi fondasi bagi rekayasa teknologi modern: mulai dari sistem pengereman kendaraan, kapal selam, dongkrak hidrolik, hingga barometer cuaca.

![Diagram Gaya Apung Fluida dan Prinsip Archimedes](/article-images/buoyancy_forces.png)

Secara fisika dasar, tekanan zat padat didefinisikan sebagai besar gaya tegak lurus (*F*) yang bekerja per satuan luas bidang tekan (*A*):

> **Formulasi Tekanan Dasar:**  
> **P = F / A**  
> *(Keterangan: P = Tekanan dalam Pascal (Pa) atau N/m², F = Gaya tekan dalam Newton (N), A = Luas bidang sentuh dalam m²)*

Dari persamaan ini, terlihat bahwa untuk besar gaya yang sama, semakin kecil luas bidang tekan maka tekanan yang dihasilkan akan berlipat ganda semakin besar. Prinsip inilah yang menjelaskan mengapa pisau tajam mudah memotong daging atau mengapa jarum suntik runcing mudah menembus kulit.

---

## 1. Tekanan Hidrostatis Zat Cair

Fluida diam (*statis*) memiliki massa dan mengalami tarikan gravitasi bumi, sehingga menghasilkan gaya tekan ke bawah pada dasar maupun dinding wadahnya. Tekanan yang ditimbulkan oleh zat cair yang diam pada kedalaman tertentu disebut **Tekanan Hidrostatis**:

> **Formulasi Tekanan Hidrostatis:**  
> **P_h = ρ × g × h**  
> *(Keterangan: P_h = Tekanan hidrostatis (Pa), ρ = Massa jenis zat cair (kg/m³), g = Percepatan gravitasi (~9,8 m/s²), h = Kedalaman titik diukur dari permukaan zat cair (m))*

### Karakteristik Penting Tekanan Hidrostatis:
1. **Bergantung pada Kedalaman (*h*):** Semakin dalam posisi suatu titik di bawah permukaan laut, semakin tebal kolom air di atasnya, sehingga tekanan hidrostatis akan meningkat secara linear. Itulah sebabnya dinding dasar bendungan air selalu dibangun jauh lebih tebal daripada dinding bagian atasnya.
2. **Tidak Bergantung pada Bentuk Wadah (Paradoks Hidrostatis):** Selama jenis cairan dan kedalamannya sama, tekanan hidrostatis di dasar wadah akan selalu bernilai identik terlepas dari bentuk tabung bejananya.
3. **Tekanan ke Segala Arah:** Pada kedalaman tertentu di dalam fluida, partikel cairan memberikan tekanan yang sama besar ke segala arah (atas, bawah, maupun samping).

---

## 2. Hukum Pascal dan Multiplikasi Gaya Hidrolik

Fisikawan dan matematikawan asal Prancis, Blaise Pascal (1623–1662), menemukan prinsip mendasar perilaku cairan dalam sistem tertutup yang dikenal sebagai **Hukum Pascal**:

> *"Tekanan yang diberikan pada zat cair di dalam ruang tertutup akan diteruskan oleh zat cair tersebut ke segala arah dengan sama rata dan tanpa berkurang kekuatannya."*

![Prinsip Kerja Mesin Dongkrak dan Kempa Hidrolik Pascal](/article-images/hydraulic_press.png)

Prinsip ini diterapkan pada sistem hidrolik dengan dua piston berpenampang berbeda (*A₁* dan *A₂*) yang saling terhubung:

> **Formulasi Hukum Pascal:**  
> **P₁ = P₂  ──►  F₁ / A₁ = F₂ / A₂  ──►  F₂ = F₁ × (A₂ / A₁)**  
> *(Keterangan: F₁ = Gaya input kecil, A₁ = Luas penampang kecil, F₂ = Gaya output besar yang dihasilkan, A₂ = Luas penampang besar)*

Melalui rasio luas penampang *(A₂ / A₁)*, gaya otot manusia yang relatif kecil pada pedal rem atau tuas pompa mampu melipatgandakan gaya keluaran hingga ribuan Newton, cukup kuat untuk mengangkat mobil seberat beberapa ton pada tempat pencucian kendaraan atau mencengkeram piringan rem cakram truk berkecepatan tinggi.

---

## 3. Prinsip Archimedes: Gaya Apung dan Hukum Kerapatan

Ketika sebuah benda dimasukkan ke dalam bejana berisi zat cair, permukaan air akan terdesak naik. Fenomena gaya dorong ke atas ini dirumuskan oleh filsuf Yunani Kuno Archimedes dari Sirakusa melalui **Prinsip Archimedes**:

> *"Sebuah benda yang tercelup sebagian atau seluruhnya ke dalam zat cair akan mengalami gaya apung ke atas (gaya Archimedes) yang besarnya sama dengan berat zat cair yang dipindahkan oleh benda tersebut."*

> **Formulasi Gaya Apung Archimedes:**  
> **F_a = ρ_fluida × g × V_celup**  
> *(Keterangan: F_a = Gaya apung ke atas (N), ρ_fluida = Massa jenis fluida (kg/m³), g = Gravitasi, V_celup = Volume bagian benda yang tercelup/memindahkan cairan (m³))*

### Tiga Kondisi Keseimbangan Benda dalam Fluida:
1. **Terapung (ρ_benda < ρ_fluida):** Gaya apung maksimum lebih besar daripada berat benda (*W*), sehingga benda menyembul ke permukaan hingga berat air yang dipindahkan tepat mengimbangi berat total benda. Inilah prinsip mengapa kapal kargo berbahan baja puluhan ribu ton dapat mengapung: bentuk lambung kapal yang berongga udara membuat massa jenis rata-rata total kapal jauh lebih ringan daripada air laut.
2. **Melayang (ρ_benda = ρ_fluida):** Massa jenis rata-rata benda persis sama dengan fluida, sehingga benda dapat diam di kedalaman mana pun di dalam cairan.
3. **Tenggelam (ρ_benda > ρ_fluida):** Massa jenis benda melebihi massa jenis cairan, sehingga gaya gravitasi mengalahkan gaya apung maksimum dan benda jatuh ke dasar wadah. Kapal selam mengatur kondisi terapung, melayang, dan tenggelam dengan mengisi atau mengosongkan tangki pemberat (*ballast tank*) dengan air laut.

---

## 4. Tekanan Gas dan Hukum Boyle

Selain zat cair, fluida berwujud gas juga memberikan tekanan akibat tumbukan kinetik triliunan molekul gas pada dinding wadahnya. Kimiawan Robert Boyle (1662) merumuskan hubungan antara tekanan dan volume gas dalam ruang tertutup:

> *"Pada suhu konstan, volume dari sejumlah massa gas tertentu berbanding terbalik dengan tekanannya."*

> **Formulasi Hukum Boyle:**  
> **P₁ × V₁ = P₂ × V₂ = Konstanta**  
> *(Keterangan: P = Tekanan gas (atm atau Pa), V = Volume ruang gas (m³ atau Liter))*

Ketika torak suntikan ditekan (volume *V* diperkecil menjadi separuh), molekul gas menjadi semakin padat dan frekuensi tumbukan per satuan luas meningkat dua kali lipat, melipatgandakan tekanan *P*. Prinsip mekanika tekanan gas ini juga menjadi dasar sistem pernapasan paru-paru manusia: saat otot diafragma berkontraksi turun, rongga dada membesar (volume paru-paru naik), tekanan udara di dalam paru-paru anjlok di bawah 1 atmosfer, dan udara dari luar terhisap masuk secara spontan.

---

## Rangkuman Konsep Tekanan Fisika SMP

| Prinsip / Hukum | Penemu | Rumus Inti | Penerapan Nyata |
| :--- | :--- | :--- | :--- |
| **Tekanan Dasar** | - | P = F / A | Pisau tajam, paku, sepatu salju |
| **Tekanan Hidrostatis** | - | P = ρ · g · h | Desain bendungan, penyelaman laut |
| **Hukum Pascal** | Blaise Pascal | F₁ / A₁ = F₂ / A₂ | Dongkrak mobil, rem hidrolik, kempa |
| **Prinsip Archimedes** | Archimedes | F_a = ρ · g · V | Kapal laut, kapal selam, jembatan ponton, hidrometer |
| **Hukum Boyle** | Robert Boyle | P₁ · V₁ = P₂ · V₂ | Pompa ban sepeda, tabung jarum suntik, inhalasi paru |

---

## Referensi & Sumber Belajar

1. [Wikipedia Bahasa Indonesia - Konsep dan Definisi Tekanan Fisika](https://id.wikipedia.org/wiki/Tekanan)
2. [Wikipedia Bahasa Indonesia - Hukum Pascal: Prinsip Mekanika Fluida Ruang Tertutup](https://id.wikipedia.org/wiki/Hukum_Pascal)
3. [Wikipedia Bahasa Indonesia - Prinsip Archimedes: Gaya Apung dan Perpindahan Fluida](https://id.wikipedia.org/wiki/Prinsip_Archimedes)
4. [Wikipedia Bahasa Indonesia - Hukum Boyle: Dinamika Tekanan dan Volume Gas Ideal](https://id.wikipedia.org/wiki/Hukum_Boyle)
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
print("Inserted SMP Fluid Mechanics chapter successfully!")
