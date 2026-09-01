import psycopg2

conn = psycopg2.connect('dbname=quiz_pocket user=abdasis host=/var/run/postgresql')
cur = conn.cursor()

# Materi SMP: Sistem Pencernaan dan Enzimatis Manusia
title = "Sistem Pencernaan Manusia: Mekanisme Mekanik, Aksi Enzimatis dan Penyerapan Nutrisi"
slug = "sistem-pencernaan-dan-enzim-manusia"
category = "Biologi SMP"
level = "SMP"
icon = "Utensils"
read_time = 7
summary = "Panduan lengkap biologi SMP mengenai saluran pencernaan makanan, pembagian fungsi organ, aksi enzimatis lambung-pankreas, dan penyerapan sari makanan di usus."

content = """Sistem pencernaan manusia (*digestive system*) adalah rangkaian organ kompleks yang bertugas memecah molekul makanan makronutrien (karbohidrat, protein, dan lemak) menjadi molekul sederhana yang dapat diserap oleh dinding usus dan diedarkan oleh darah ke seluruh sel tubuh.

![Struktur dan Anatomi Saluran Pencernaan Manusia Lengkap](https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Digestive_system_diagram_id.svg/500px-Digestive_system_diagram_id.svg.png)

Proses pencernaan pada tubuh manusia terbagi menjadi dua mekanisme utama:
1. **Pencernaan Mekanik:** Proses pemecahan gumpalan makanan berukuran besar menjadi partikel yang lebih kecil secara fisik tanpa mengubah struktur kimianya (misalnya mastikasi oleh gigi di rongga mulut dan gerak peristaltik kerongkongan).
2. **Pencernaan Kimiawi (Enzimatis):** Proses penguraian ikatan kimia kompleks makanan menjadi senyawa sederhana dengan bantuan katalis biokimia berupa **enzim pencernaan**.

---

## 1. Rongga Mulut dan Kerongkongan (Esofagus)

Perjalanan makanan dimulai di rongga mulut (*cavum oris*), di mana makanan mengalami pencernaan mekanik sekaligus kimiawi:
- **Gigi (*Dentes*):** Gigi seri (*insisivus*) memotong makanan, gigi taring (*kaninus*) merobek, dan gigi geraham (*molar*) menggilas hingga halus.
- **Kelenjar Ludah (*Glandula Saliva*):** Mensekresikan air liur yang mengandung enzim **ptialin (amilase mulut)**. Sebagaimana dijelaskan dalam literatur biologi, enzim ptialin bekerja optimal pada pH netral untuk memecah ikatan amilum (pati) menjadi disakarida sederhana berupa maltosa.
- **Lidah (*Lingua*):** Mengatur letak makanan dan membentuk gumpalan bulat lembut yang disebut **bolus**.

Ketika bolus ditelan, katup tulang rawan elastis bernama **epiglotis** secara otomatis menutup pangkal tenggorokan (*laring*) agar makanan tidak masuk ke saluran pernapasan. Di dalam kerongkongan (*esofagus*), otot sirkular dan longitudinal berkontraksi secara bergantian menciptakan **gerak peristaltik**, mendorong bolus menuju lambung dalam waktu sekitar 5 hingga 8 detik.

---

## 2. Lambung: Dapur Asam dan Pemecah Protein

Lambung (*ventrikulus*) berupa kantong berotot tebal yang terletak di rongga perut sebelah kiri atas, tepat di bawah diafragma. Dinding lambung dilapisi lapisan mukosa tebal untuk menahan lingkungan asam yang ekstrem:

![Anatomi Bagian-Bagian Lambung Manusia: Kardia, Fundus, Korpus, dan Pilorus](https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Stomach_diagram-id.svg/500px-Stomach_diagram-id.svg.png)

Lambung mensekresikan getah lambung (*gastric juice*) yang mengandung komponen krusial:
- **Asam Klorida (HCl):** Menciptakan lingkungan sangat asam (pH 1,5–2,5) yang berfungsi membunuh bakteri patogen pada makanan serta mengaktifkan enzim tidak aktif pepsinogen menjadi bentuk aktifnya, yaitu **pepsin**.
- **Enzim Pepsin:** Memutus ikatan peptida rantai protein kompleks menjadi rantai fragmen pendek berupa **pepton** atau proteosa.
- **Enzim Renin:** Berfungsi mengendapkan kasein (protein susu) dari air susu agar dapat dicerna lebih lanjut.
- **Mukus (Lendir Pelindung):** Melapisi epitel dinding lambung agar tidak mengalami korosi atau luka (*ulkus peptikum*) akibat asam lambung sendiri.

Otot lambung mengaduk dan meremas bolus selama 2 hingga 4 jam hingga berubah wujud menjadi bubur semi-cair kental berwarna kekuningan yang disebut **kimus** (*chyme*).

---

## 3. Usus Halus: Pusat Enzimatis dan Penyerapan Nutrisi

Kimus dari lambung dikeluarkan secara bertahap melalui sfingter pilorus menuju **usus halus** (*intestinum tenue*). Usus halus memiliki panjang total sekitar 6 hingga 7 meter pada orang dewasa dan terbagi menjadi tiga zona fungsional:

1. **Usus Dua Belas Jari (*Duodenum*):** Muara bagi dua kelenjar pencernaan utama, yaitu kantung empedu dan pankreas.
   - **Getah Empedu:** Dihasilkan oleh hati (*hepar*) dan disimpan di kantung empedu. Empedu mengandung garam empedu yang berfungsi mengemulsikan lemak (memecah globula lemak besar menjadi tetesan mikro) agar enzim pencernaan dapat bekerja.
   - **Getah Pankreas:** Mengandung natrium bikarbonat (menetralkan keasaman kimus dari lambung) serta tiga enzim penting:
     - **Tripsin:** Melanjutkan penguraian pepton menjadi asam amino bebas.
     - **Amilase Pankreas:** Mengubah sisa amilum menjadi maltosa dan glukosa.
     - **Lipase Pankreas (Steapsin):** Menghidrolisis emulsi lemak menjadi **asam lemak dan gliserol**.
2. **Usus Kosong (*Jejunum*):** Melanjutkan proses pencernaan enzimatis oleh enzim-enzim dinding usus seperti maltase, laktase, sukrase, dan peptidase.
3. **Usus Penyerapan (*Ileum*):** Permukaan dinding dalam ileum berlipat-lipat dan ditutupi oleh jutaan tonjolan mikroskopis menyerupai jari yang disebut **vili (jonjot usus)** dan mikrovili. Struktur vili ini melipatgandakan luas area permukaan penyerapan hingga ratusan meter persegi:
   - Glukosa, asam amino, vitamin larut air (B dan C), dan mineral diserap masuk ke dalam pembuluh kapiler darah lalu dibawa ke hati melalui vena porta hepatika.
   - Asam lemak dan gliserol dikemas bersama protein membentuk kilomikron, diserap masuk ke dalam pembuluh getah bening (*pembuluh kil / lakteal*) sebelum masuk ke sirkulasi darah umum.

---

## 4. Usus Besar (Kolon) dan Pembentukan Feses

Sisa makanan yang tidak dapat dicerna dan diserap (seperti serat selulosa tumbuhan) dialirkan masuk ke **usus besar** (*kolon*):

- **Reabsorpsi Air dan Elektrolit:** Kolon menyerap kembali kelebihan air dari materi sisa sehingga terbentuk konsistensi feses yang padat namun lembut.
- **Simbiosis Bakteri Baik (*Escherichia coli*):** Bakteri komensal *E. coli* di usus besar membantu proses pembusukan sisa makanan serta mensintesis vitamin penting seperti **Vitamin K** (berperan vital dalam pembekuan darah) dan beberapa jenis Vitamin B.
- **Rektum dan Anus:** Feses disimpan sementara di rektum. Ketika dinding rektum meregang, timbul impuls saraf refleks defekasi, dan feses dikeluarkan melalui saluran akhir berupa anus.

---

## Rangkuman Enzim Pencernaan Utama

| Organ Penghasil | Nama Enzim | Substrat Makanan | Hasil Penguraian |
| :--- | :--- | :--- | :--- |
| **Kelenjar Mulut** | Ptialin (Amilase) | Amilum (Pati) | Maltosa |
| **Lambung** | Pepsin | Protein | Pepton |
| **Lambung** | Renin | Kaseinogen Susu | Kasein Tergumpal |
| **Pankreas** | Tripsin | Pepton / Protein | Asam Amino |
| **Pankreas** | Amilase Pankreas | Amilum | Glukosa / Disakarida |
| **Pankreas** | Lipase | Lemak teremulsi | Asam Lemak & Gliserol |
| **Usus Halus** | Maltase / Sukrase | Disakarida Gula | Monosakarida (Glukosa) |

---

## Referensi & Sumber Belajar

1. [Wikipedia Bahasa Indonesia - Sistem Pencernaan Manusia: Saluran dan Organ](https://id.wikipedia.org/wiki/Sistem_pencernaan_manusia)
2. [Wikipedia Bahasa Indonesia - Anatomi Lambung dan Fisiologi Sekresi Enzim](https://id.wikipedia.org/wiki/Lambung)
3. [Wikipedia Bahasa Indonesia - Usus Halus: Duodenum, Jejunum, dan Ileum](https://id.wikipedia.org/wiki/Usus_halus)
4. [Wikipedia Bahasa Indonesia - Usus Besar: Reabsorpsi Air dan Simbiosis Kolon](https://id.wikipedia.org/wiki/Usus_besar)
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
print("Inserted SMP Digestive System chapter successfully!")
