import psycopg2

conn = psycopg2.connect('dbname=quiz_pocket user=abdasis host=/var/run/postgresql')
cur = conn.cursor()

title = "Listrik Dinamis: Hukum Ohm, Rangkaian Seri-Paralel dan Hukum Kirchhoff"
slug = "listrik-dinamis-hukum-ohm-dan-kirchhoff"
category = "Fisika SMP"
level = "SMP"
icon = "Zap"
read_time = 8
summary = "Materi fisika SMP tentang arus muatan listrik, beda potensial, formulasi Hukum Ohm, karakteristik hambatan seri-paralel, serta hukum kekekalan arus Kirchhoff."

content = """Listrik dinamis merupakan fenomena aliran muatan listrik (elektron) yang bergerak melintasi suatu medium konduktor akibat adanya perbedaan potensial energi listrik. Dalam peradaban modern, listrik dinamis adalah urat nadi teknologi yang menggerakkan seluruh perangkat elektronik, jaringan transmisi daya, hingga sistem komputasi mikroprosesor.

![Diagram Rangkaian Listrik Seri dan Paralel](/article-images/series_parallel_circuit.png)

Pemahaman mengenai hukum-hukum kelistrikan dasar memungkinkan kita merancang instalasi kelistrikan rumah tangga yang aman, efisien, dan andal.

---

## 1. Arus Listrik dan Beda Potensial (Tegangan)

Aliran listrik dalam suatu rangkaian tertutup terjadi karena adanya perpindahan elektron bebas:

- **Kuat Arus Listrik (*I*):** Jumlah muatan listrik (*Q*) yang mengalir melintasi penampang konduktor dalam selang waktu tertentu (*t*). Diukur dalam satuan **Ampere (A)**.
  > **Formulasi Kuat Arus:**  
  > **I = Q / t**  
  > *(Keterangan: I = Kuat arus dalam Ampere, Q = Muatan listrik dalam Coulomb (C), t = Waktu dalam sekon (s))*
- **Beda Potensial / Tegangan (*V*):** Energi yang diperlukan untuk memindahkan satu satuan muatan listrik antar dua titik dalam suatu rangkaian. Diukur dalam satuan **Volt (V)**.
- **Arah Aliran Arus:** Berdasarkan konvensi fisika klasik, arus listrik mengalir dari kutub berpotensial tinggi (positif) menuju kutub berpotensial rendah (negatif). Namun secara mikroskopis, elektron sebenarnya mengalir dari kutub negatif menuju kutub positif.

---

## 2. Hukum Ohm: Hubungan Tegangan, Arus, dan Hambatan

Fisikawan Jerman Georg Simon Ohm (1827) menemukan bahwa kuat arus yang mengalir melalui suatu kawat penghantar berbanding lurus dengan beda potensial di kedua ujungnya, selama suhu penghantar konstan:

![Segitiga Relasi Rumus Hukum Ohm (V, I, R)](/article-images/ohm_law_triangle.png)

> **Formulasi Hukum Ohm:**  
> **V = I × R   ──►   I = V / R   ──►   R = V / I**  
> *(Keterangan: V = Tegangan dalam Volt (V), I = Kuat arus dalam Ampere (A), R = Hambatan listrik dalam Ohm (Ω))*

### Faktor yang Mempengaruhi Nilai Hambatan Kawat Penghantar:
Nilai hambatan (*R*) suatu kawat penghantar dipengaruhi oleh sifat fisik kawat:
> **R = ρ × (L / A)**  
> *(Keterangan: ρ = Hambatan jenis bahan (Ω·m), L = Panjang kawat (m), A = Luas penampang kawat (m²))*
- Kawat yang semakin panjang memiliki hambatan yang semakin besar.
- Kawat yang berpenampang tebal memiliki hambatan yang lebih kecil sehingga lebih mudah mengalirkan arus listrik besar tanpa cepat panas.

---

## 3. Analisis Rangkaian Seri dan Paralel

Dalam rangkaian listrik, komponen resistor atau beban lampu dapat dirangkai dalam dua konfigurasi dasar atau kombinasinya:

### A. Rangkaian Seri (Pembagi Tegangan)
Komponen disusun secara berderet sejajar tanpa percabangan:
1. **Arus Sama:** Kuat arus yang mengalir pada setiap komponen bernilai identik (*I_total = I₁ = I₂ = I₃*).
2. **Hambatan Pengganti Total (*R_total*):** Nilai hambatan total merupakan penjumlahan langsung seluruh hambatan:  
   > **R_seri = R₁ + R₂ + R₃ + ...**
3. **Tegangan Terbagi:** *V_total = V₁ + V₂ + V₃*.
4. **Kelemahan:** Jika salah satu lampu putus atau dicabut, seluruh rangkaian akan mati padam seketika.

### B. Rangkaian Paralel (Pembagi Arus)
Komponen disusun secara bertingkat dengan titik percabangan:
1. **Tegangan Sama:** Beda potensial pada setiap cabang bernilai identik (*V_total = V₁ = V₂ = V₃*).
2. **Hambatan Pengganti Total (*R_total*):** Dihitung melalui penjumlahan kebalikan hambatan:  
   > **1 / R_paralel = 1/R₁ + 1/R₂ + 1/R₃ + ...**  
   *(Nilai hambatan total paralel selalu lebih kecil daripada hambatan terkecil komponennya).*
3. **Arus Terbagi:** *I_total = I₁ + I₂ + I₃*.
4. **Keunggulan:** Jika satu lampu dimatikan, lampu di cabang lain tetap menyala. Inilah alasan mengapa seluruh instalasi listrik rumah tangga menggunakan susunan paralel.

---

## 4. Hukum I Kirchhoff: Hukum Kekekalan Arus

Gustav Kirchhoff merumuskan prinsip konservasi muatan listrik pada titik simpul percabangan (*junction*):

> *"Jumlah kuat arus listrik yang masuk ke suatu titik percabangan sama dengan jumlah kuat arus listrik yang keluar dari titik percabangan tersebut."*

> **Formulasi Hukum I Kirchhoff:**  
> **Σ I_masuk = Σ I_keluar**  
> *(Contoh: Jika arus masuk 10 A terbagi ke dua cabang dengan cabang pertama 4 A, maka cabang kedua pasti mengalirkan 6 A).*

---

## 5. Daya dan Energi Listrik

Energi listrik (*W*) yang diubah menjadi energi bentuk lain (cahaya, panas, kinetik) dalam selang waktu tertentu dinyatakan sebagai **Daya Listrik (*P*)** dalam satuan Watt:

> **Formulasi Daya dan Energi Listrik:**  
> **P = V × I = I² × R = V² / R**  
> **W = P × t**  
> *(Keterangan: P = Daya dalam Watt (W), W = Energi listrik dalam Joule (J) atau kiloWatt-hour (kWh), t = Waktu dalam sekon/jam)*

Perusahaan Listrik Negara (PLN) menghitung tagihan listrik konsumen berdasarkan pemakaian energi dalam satuan **kWh (kiloWatt-hour)**: daya alat (kW) dikalikan lama pemakaian (jam).

---

## Rangkuman Konsep Listrik Dinamis SMP

| Besaran / Hukum | Simbol / Rumus | Satuan Standar (SI) | Sifat Karakteristik |
| :--- | :--- | :--- | :--- |
| **Kuat Arus (*I*)** | I = Q / t | Ampere (A) | Laju muatan per detik |
| **Tegangan (*V*)** | V = I · R | Volt (V) | Beda potensial penggerak muatan |
| **Hukum Ohm** | R = V / I | Ohm (Ω) | Hubungan linear V dan I |
| **Hambatan Kawat** | R = ρ · (L / A) | Ohm (Ω) | Tergantung panjang & tebal kawat |
| **Hukum I Kirchhoff** | Σ I_masuk = Σ I_keluar | Ampere (A) | Konservasi muatan pada percabangan |
| **Daya Listrik (*P*)** | P = V · I | Watt (W) | Kecepatan penyerapan energi |

---

## Referensi & Sumber Belajar Terverifikasi

1. [Gramedia Literasi - Rangkaian Listrik Seri dan Paralel: Ciri dan Karakteristik](https://www.gramedia.com/literasi/rangkaian-listrik/)
2. [Sampoerna Academy - Hukum Ohm: Pengertian, Rumus, dan Contoh Soal](https://www.sampoernaacademy.sch.id/id/hukum-ohm/)
3. [Quipper Blog - Panduan Lengkap Listrik Dinamis Kelas 9 SMP](https://www.quipper.com/id/blog/mapel/fisika/listrik-dinamis-kelas-9/)
4. [Wikipedia Bahasa Indonesia - Hukum Ohm dan Konduktivitas Kelistrikan](https://id.wikipedia.org/wiki/Hukum_Ohm)
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
print("Inserted SMP Dynamic Electricity chapter successfully!")
