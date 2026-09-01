import psycopg2

conn = psycopg2.connect('dbname=quiz_pocket user=abdasis host=/var/run/postgresql')
cur = conn.cursor()

# Konten Artikel Literasi Finansial dengan 4 domain otoritas independen Indonesia terverifikasi
content_financial = """Literasi finansial bukan sekadar kemampuan menghitung pengeluaran atau menabung uang di celengan, melainkan seni komprehensif dalam mengelola sumber daya modal, mengukur rasio risiko (*risk-reward ratio*), dan memanfaatkan nilai waktu dari uang (*time value of money*) guna mencapai ketahanan ekonomi jangka panjang.

![Ilustrasi Pertumbuhan Modal dan Manajemen Portofolio Finansial](https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Compound_interest.svg/500px-Compound_interest.svg.png)

Dalam arsitektur ekonomi modern, uang yang dibiarkan mengendap secara pasif tanpa perputaran nilai akan mengalami depresiasi daya beli secara sistemik akibat laju inflasi riil tahunan.

---

## 1. Nilai Waktu dari Uang (Time Value of Money) dan Bunga Majemuk

Prinsip dasar keuangan menetapkan bahwa satu rupiah hari ini memiliki nilai ekonomi yang lebih tinggi dibandingkan satu rupiah di masa depan. Hal ini disebabkan oleh potensi kapasitas menghasilkan uang tersebut jika diinvestasikan (*earning capacity*).

Albert Einstein menyebut fenomena **bunga berbunga** (*compound interest*) sebagai keajaiban dunia kedelapan: siapa yang memahaminya akan menghasilkan uang darinya, dan siapa yang tidak memahaminya akan membayar harganya.

> **Formulasi Nilai Masa Depan (Future Value):**  
> **FV = PV × (1 + r)ⁿ**  
> *(Keterangan: FV = Nilai masa depan, PV = Modal awal saat ini, r = Imbal hasil per periode waktu, n = Jumlah periode investasi)*

Ketika imbal hasil reinvestasikan kembali ke pokok modal, kurva pertumbuhan kekayaan tidak lagi linier melainkan berubah menjadi eksponensial setelah melewati titik belok waktu (*time horizon*).

---

## 2. Fondasi Piramida Perencanaan Keuangan

Sebelum melangkah ke instrumen pasar modal yang agresif, seorang individu wajib membangun fondasi likuiditas dan proteksi risiko yang kokoh:

![Piramida Arsitektur Perencanaan Keuangan dan Alokasi Aset](https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Personal_finance_triangle.svg/500px-Personal_finance_triangle.svg.png)

1. **Arus Kas Positif (Cashflow Management):** Memastikan pendapatan bulanan selalu melampaui biaya pengeluaran operasional primer. Rumus alokasi populer seperti **50/30/20** (50% kebutuhan pokok, 30% keinginan fleksibel, 20% tabungan & investasi) dapat digunakan sebagai panduan awal.
2. **Dana Darurat (Emergency Fund):** Likuiditas likuid minimal 3 hingga 6 kali lipat total pengeluaran bulanan (atau 12 kali untuk kepala keluarga/pekerja lepas) yang ditempatkan pada instrumen tanpa risiko pasar seperti tabungan bank, deposito LPS, atau reksa dana pasar uang.
3. **Manajemen Proteksi Risiko (Asuransi):** Melindungi aset dari keruntuhan finansial mendadak akibat risiko kesehatan atau cacat tetap melalui asuransi kesehatan murni dan asuransi jiwa berjangka (*term life*).
4. **Investasi Pertumbuhan Kekayaan:** Penempatan kelebihan modal ke instrumen produktif untuk tujuan jangka panjang (pendidikan anak, pensiun, dan kebebasan finansial).

---

## 3. Seni Alokasi Aset dan Teori Portofolio Modern

Ekonom peraih Nobel Harry Markowitz memperkenalkan **Teori Portofolio Modern (MPT)** dengan prinsip bahwa diversifikasi adalah satu-satunya "makan siang gratis" (*free lunch*) dalam dunia investasi. Diversifikasi aset menurunkan volatilitas tanpa memangkas potensi imbal hasil secara proporsional.

### Spektrum Kelas Aset di Indonesia:
- **Pasar Uang & Deposito:** Tingkat risiko terendah dengan imbal hasil terukur, dijamin oleh Lembaga Penjamin Simpanan (LPS) hingga batas plafon Rp2 Miliar per nasabah per bank.
- **Surat Berharga Negara (SBN / Obligasi):** Instrumen utang yang diterbitkan oleh Kementerian Keuangan Republik Indonesia (seperti ORI, Sukuk Ritel, SBR) dengan tingkat keamanan 100% bergaransi undang-undang negara dan kupon berkala.
- **Ekuitas & Saham Pasar Modal:** Kepemilikan fraksional pada perusahaan publik yang menawarkan potensi imbal hasil tertinggi melalui capital gain dan dividen tunai, namun disertai volatilitas jangka pendek yang tinggi.
- **Aset Riil (Emas & Properti):** Pelindung nilai (*hedging*) klasik terhadap ancaman inflasi ekstrem dan ketidakpastian geopolitik global.

---

## 4. Perangkap Perilaku Finansial (Behavioral Finance)

Kunci keberhasilan mengelola kekayaan bukan ditentukan oleh IQ intelektual, melainkan pengendalian bias psikologis emosional:
- **FOMO (Fear of Missing Out):** Tergesa-gesa membeli instrumen berisiko tinggi di pucuk harga karena melihat orang lain mendadak kaya.
- **Loss Aversion Bias:** Rasa sakit mental kehilangan uang Rp1 juta dirasakan dua kali lebih berat daripada kebahagiaan mendapatkan uang Rp1 juta, membuat investor enggan memotong kerugian (*cut loss*) pada aset yang rusak fundamentalnya.
- **Skema Piramida & Investasi Ilegal:** Waspadai setiap tawaran investasi yang menjanjikan "keuntungan pasti tinggi tanpa risiko" (*high return, zero risk*). Otoritas Jasa Keuangan (OJK) merumuskan prinsip **2L (Legal dan Logis)** sebelum menyetorkan uang ke entitas keuangan apa pun.

---

## Referensi & Sumber Otoritas Finansial

1. [Sikapi Uangmu - Otoritas Jasa Keuangan (OJK RI)](https://sikapiuangmu.ojk.go.id)
2. [Edukasi Kebijakan Moneter & Sistem Pembayaran - Bank Indonesia (BI)](https://www.bi.go.id/id/edukasi/default.aspx)
3. [Portal Edukasi Pengelolaan Anggaran & Fiskal - Kementerian Keuangan RI](https://www.kemenkeu.go.id/edukasi)
4. [Edukasi Penjaminan Simpanan & Ketahanan Perbankan - LPS RI](https://lps.go.id/penjaminan-simpanan)"""

cur.execute("""
UPDATE articles 
SET content = %s,
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'manajemen-keuangan-dan-diversifikasi-investasi';
""", (content_financial,))

conn.commit()
print("Updated Financial Literacy article with 4 distinct authority domains!")
