import psycopg2

conn = psycopg2.connect('dbname=quiz_pocket user=abdasis host=/var/run/postgresql')
cur = conn.cursor()

title = "Pewarisan Sifat & Genetika: Struktur Heliks Ganda DNA dan Hukum Pewarisan Mendel"
slug = "pewarisan-sifat-dna-dan-hukum-mendel"
category = "Biologi SMP"
level = "SMP"
icon = "Sparkles"
read_time = 9
summary = "Materi biologi SMP komprehensif mengenai struktur asam nukleat DNA, peran kromosom, persilangan monohibrid-dihibrid Hukum Mendel, serta penerapan genetika pada manusia."

content = """Genetika adalah cabang ilmu biologi yang mempelajari bagaimana karakteristik fisik, biokimiawi, dan fisiologis diwariskan dari orang tua (induk) kepada keturunannya. Di dalam setiap inti sel makhluk hidup, tersimpan cetak biru biologis berukuran mikroskopis yang mengendalikan seluruh proses pembentukan jaringan dan sintesis protein tubuh.

![Arsitektur Heliks Ganda Asam Deoksiribonukleat (DNA) dan Pasangan Basa Nitrogen](/article-images/dna_structure.png)

Keberhasilan para ilmuwan dalam mengurai struktur materi genetik membuka pemahaman mendalam tentang asal-usul variasi biologis, golongan darah, hingga mekanisme pewarisan penyakit genetik menurun pada manusia.

---

## 1. Materi Genetik: Kromosom, Gen, dan Heliks Ganda DNA

Di dalam inti sel (*nukleus*), materi genetik terorganisasi secara rapi dalam struktur benang-benang kromatin yang memadat membentuk **kromosom** saat sel bersiap membelah:

- **DNA (*Deoxyribonucleic Acid*):** Molekul polimer raksasa yang tersusun atas dua rantai polinukleotida yang saling berpilin membentuk konfigurasi **heliks ganda** (*double helix*), sebagaimana dipetakan oleh James Watson dan Francis Crick pada tahun 1953.
- **Nukleotida:** Setiap unit penyusun DNA terdiri atas tiga komponen inti:
  1. Gula deoksiribosa (gula pentosa berkarbon 5).
  2. Gugus fosfat (membentuk kerangka tulang punggung DNA).
  3. Basa nitrogen yang berpasangan secara komplementer melalui ikatan hidrogen:
     - **Adenin (A)** selalu berpasangan dengan **Timin (T)** melalui 2 ikatan hidrogen.
     - **Guanin (G)** selalu berpasangan dengan **Sitosin (C)** melalui 3 ikatan hidrogen.
- **Gen:** Segmen tertentu pada molekul DNA yang membawa kode informasi urutan asam amino untuk menyintesis satu jenis protein fungsional spesifik.

Pada manusia normal, setiap sel somatik (tubuh) memiliki **46 kromosom (23 pasang)**, yang terdiri atas 22 pasang autosom (kromosom tubuh) dan 1 pasang gonosom (kromosom seks: XX untuk wanita dan XY untuk pria). Sel kelamin (sperma dan ovum) bersifat **haploid (n = 23 kromosom)** akibat pembelahan meiosis, sehingga ketika terjadi fertilisasi, zigot kembali memiliki susunan **diploid (2n = 46 kromosom)** yang lengkap.

---

## 2. Hukum Pewarisan Sifat Gregor Mendel

Prinsip dasar pewarisan sifat pertama kali dirumuskan secara matematis oleh biarawan Austria, **Gregor Johann Mendel** (1822–1884), melalui eksperimen persilangan terencana pada tanaman kacang kapri (*Pisum sativum*).

![Diagram Kotak Punnett Persilangan Monohibrid Hukum I Mendel](/article-images/punnett_square.png)

### A. Terminologi Kunci Genetika:
- **Genotipe:** Susunan genetik yang sebenarnya dari suatu individu yang tidak tampak dari luar (disimbolkan dengan huruf, misalnya *BB, Bb, bb*).
- **Fenotipe:** Sifat fisik yang dapat diamati secara langsung sebagai hasil interaksi antara genotipe dan lingkungan (misalnya: bunga ungu, batang tinggi, rambut ikal).
- **Alel Dominan & Resesif:** Sifat dominan (huruf kapital, misal *B*) akan menutupi penampakan sifat resesif (huruf kecil, misal *b*) pada individu heterozigot (*Bb*).
- **Homozigot vs Heterozigot:** *BB* (homozigot dominan), *bb* (homozigot resesif), *Bb* (heterozigot).

---

## 3. Persilangan Monohibrid dan Dihibrid

Mendel merumuskan dua hukum dasar pewarisan genetik berdasarkan pola pemisahan dan penggabungan alel:

### A. Hukum I Mendel (Hukum Segregasi Bebas)
> *"Pada pembentukan sel gamet, pasangan alel akan memisah secara bebas sehingga setiap gamet hanya menerima satu alel dari pasangannya."*

Pada persilangan **Monohibrid Dominan Penuh** (satu sifat beda, misal tanaman berbunga ungu dominan *UU* disilangkan dengan berbunga putih resesif *uu*):
1. **Generasi F1 (Keturunan Pertama):** 100% bergenotipe *Uu* dengan fenotipe bunga ungu.
2. **Generasi F2 (Persilangan Sesama F1: *Uu* × *Uu*):**
   - **Rasio Genotipe:** 1 *UU* : 2 *Uu* : 1 *uu* (1 : 2 : 1)
   - **Rasio Fenotipe:** 3 Bunga Ungu : 1 Bunga Putih (**3 : 1**)

### B. Hukum II Mendel (Hukum Asortasi / Pengelompokan Bebas)
> *"Ketika dua pasang sifat atau lebih diturunkan secara bersamaan, setiap pasangan alel akan mengelompok secara bebas dengan pasangan alel lainnya pada saat pembentukan gamet."*

Pada persilangan **Dihibrid** (dua sifat beda, misalnya biji bulat-kuning dominan *BBKK* disilangkan dengan biji kisut-hijau resesif *bbkk*):
- Generasi F1 menghasilkan 100% *BbKk* (Bulat Kuning).
- Generasi F2 persilangan sesama F1 menghasilkan **16 kombinasi genotipe** dengan **Rasio Fenotipe Klasik: 9 : 3 : 3 : 1** (9 Bulat Kuning : 3 Bulat Hijau : 3 Kisut Kuning : 1 Kisut Hijau).

---

## 4. Penerapan Pewarisan Sifat pada Manusia

Konsep genetika Mendel berlaku langsung dalam pewarisan sifat pada manusia:

1. **Golongan Darah Sistem ABO:** Ditentukan oleh alel ganda (*Iᴬ, Iᴮ, Iᴼ*). Alel *Iᴬ* dan *Iᴮ* bersifat kodominan satu sama lain, sementara *Iᴼ* bersifat resesif. Orang bergolongan darah A memiliki genotipe *IᴬIᴬ* atau *IᴬIᴼ*, golongan B (*IᴮIᴮ* atau *IᴮIᴼ*), golongan AB (*IᴬIᴮ*), dan golongan O (*IᴼIᴼ*).
2. **Kelainan Genetik Terpaut Kromosom Seks (X-Linked):**
   - **Buta Warna & Hemofilia:** Gen pembawa kelainan ini terpaut pada kromosom X secara resesif (*Xᵇ* atau *Xʰ*). Pria (*XᵇY*) akan langsung menderita buta warna jika memiliki satu kromosom X mutan, sedangkan wanita (*XᴮXᵇ*) hanya bertindak sebagai pembawa sifat (*carrier*) tanpa memperlihatkan gejala sakit.
3. **Kelainan Genetik Autosom:** Penyakit seperti **Albino** (ketidakmampuan memproduksi pigmen melanin) diwariskan secara autosom resesif (*aa*), di mana anak albino dapat lahir dari kedua orang tua normal yang berstatus carrier (*Aa*).

---

## Rangkuman Konsep Genetika SMP

| Topik | Penemu / Konsep | Karakteristik Inti |
| :--- | :--- | :--- |
| **Struktur DNA** | Watson & Crick (1953) | Heliks ganda, pasangan basa A-T (2 ikatan H) dan G-C (3 ikatan H) |
| **Kromosom Manusia** | Autosom & Gonosom | 46 buah (23 pasang): 44 autosom + 2 gonosom (XX / XY) |
| **Hukum I Mendel** | Segregasi Bebas | Monohibrid dominan menghasilkan rasio fenotipe F2 = 3 : 1 |
| **Hukum II Mendel** | Asortasi Bebas | Dihibrid menghasilkan rasio fenotipe F2 = 9 : 3 : 3 : 1 |
| **Kelainan Terpaut Seks** | Kromosom X Resesif | Buta warna dan hemofilia lebih sering mengenai pria (*Xʸ*) |

---

## Referensi & Sumber Belajar Terverifikasi

1. [Gramedia Literasi - Hukum Mendel: Pengertian, Percobaan, dan Penerapannya](https://www.gramedia.com/literasi/hukum-mendel/)
2. [Hello Sehat - Struktur Asam Nukleat DNA dan Fungsinya bagi Tubuh](https://hellosehat.com/sehat/informasi-kesehatan/dna-adalah/)
3. [KlikDokter - Pengenalan Penyakit Menurun dan Kelainan Genetik](https://www.klikdokter.com/penyakit/kelainan-genetik)
4. [Wikipedia Bahasa Indonesia - Asam Deoksiribonukleat (DNA) dan Konsep Pewarisan Sifat](https://id.wikipedia.org/wiki/Asam_deoksiribonukleat)
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
print("Inserted SMP Genetics & Mendel Law chapter successfully!")
