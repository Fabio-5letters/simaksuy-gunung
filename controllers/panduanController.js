const fs = require('fs');
const path = require('path');

// Panduan content data
const panduanData = {
    'keselamatan': {
        title: 'Panduan Keselamatan Lengkap',
        filename: 'Panduan-Keselamatan.txt',
        content: `
╔════════════════════════════════════════════════════════════════════════════╗
║                    PANDUAN KESELAMATAN PENDAKIAN GUNUNG                    ║
║                              SIMAKSI v2.0.0                               ║
╚════════════════════════════════════════════════════════════════════════════╝

Tanggal: ${new Date().toLocaleDateString('id-ID')}
Platform: SIMAKSI - Sistem Informasi Manajemen Pendakian Gunung

═══════════════════════════════════════════════════════════════════════════════

1. PERSIAPAN SEBELUM BERANGKAT

   a) Registrasi Resmi
      • Selalu daftar melalui sistem SIMAKSI resmi
      • Pastikan data Anda lengkap dan akurat
      • Catat nomor registrasi Anda

   b) Rencana Perjalanan
      • Tinggalkan salinan rencana perjalanan kepada keluarga
      • Informasikan rute yang akan ditempuh
      • Sebutkan estimasi waktu kembali

   c) Cek Status Jalur
      • Pastikan jalur tidak sedang ditutup
      • Periksa kondisi cuaca terkini
      • Hubungi basecamp untuk informasi terbaru

═══════════════════════════════════════════════════════════════════════════════

2. SELAMA DI JALUR

   a) Tetap di Jalur
      • Jangan memotong jalur untuk menghindari kerusakan alam
      • Ikuti petanda/tanda jalur yang ada
      • Jika ragu, tanyakan kepada guide atau pendaki lain

   b) Manajemen Waktu
      • Mulailah sepagi mungkin
      • Istirahat secara berkala
      • Hindari mendaki di malam hari jika memungkinkan

   c) Tetap Terhidrasi
      • Minum air secara berkala meskipun tidak merasa haus
      • Bawalah minimal 2 liter air
      • Hindari minuman beralkohol

═══════════════════════════════════════════════════════════════════════════════

3. PROSEDUR DARURAT (S.T.O.P)

   Jika mengalami keadaan darurat atau tersesat:

   S = SIT (Duduk)
       Duduklah dengan tenang dan jangan panik

   T = THINK (Berpikir)
       Pikirkan kembali rute yang Anda lalui

   O = OBSERVE (Amati)
       Amati lingkungan sekitar untuk mencari tanda-tanda jalur

   P = PLAN (Rencana)
       Buat rencana tindakan yang logis

═══════════════════════════════════════════════════════════════════════════════

4. MANAJEMEN BAHAYA

   a) Cuaca Ekstrem
      • Waspadai badai petir di punggungan terbuka
      • Hindari bersembunyi di bawah pohoh saat ada petir
      • Gunakan pakaian berlapis untuk adaptasi suhu

   b) Medan Terjal
      • Hati-hati pada jalur berbatu yang licin
      • Gunakan sepatu dengan grip yang baik
      • Gunakan trekking pole untuk keseimbangan

   c) Sinyal Darurat
      • Jika memerlukan pertolongan, gunakan peluit tiga kali
      • Gunakan cermin untuk memberikan sinyal ke pencari

═══════════════════════════════════════════════════════════════════════════════

5. NOMOR PENTING

   Basecamp Rescue: +62 274 515 912
   SAR Nasional: 115
   Rumah Sakit Terdekat: +62 274 XXX XXXX

═══════════════════════════════════════════════════════════════════════════════

Dokumentasi ini dibuat oleh SIMAKSI untuk memastikan keselamatan Anda.
Untuk informasi lebih lanjut, kunjungi https://simaksi.local
`
    },
    'teknis': {
        title: 'Panduan Teknis & Navigasi',
        filename: 'Panduan-Teknis.txt',
        content: `
╔════════════════════════════════════════════════════════════════════════════╗
║                      PANDUAN TEKNIS & NAVIGASI PENDAKIAN                  ║
║                              SIMAKSI v2.0.0                               ║
╚════════════════════════════════════════════════════════════════════════════╝

Tanggal: ${new Date().toLocaleDateString('id-ID')}

═══════════════════════════════════════════════════════════════════════════════

1. TEKNIK BERJALAN

   a) Langkah Pendek dan Konsisten
      • Gunakan langkah pendek yang konsisten untuk hemat energi
      • Kecepatan stabil lebih penting dari kecepatan tinggi
      • Tujukan pandangan ke depan, tidak ke bawah

   b) Rest Step (Teknik Istirahat Saat Berjalan)
      • Saat melangkah ke atas, luruskan kaki belakang sepenuhnya
      • Istirahatkan lutut belakang sebentar sebelum melangkah
      • Teknik ini menghemat energi hingga 30%

   c) Penggunaan Trekking Pole
      • Gunakan pole untuk mengurangi tekanan pada lutut
      • Sesuaikan tinggi pole dengan medan
      • Untuk turun, gunakan pole di depan untuk stabilitas

═══════════════════════════════════════════════════════════════════════════════

2. NAVIGASI DASAR

   a) Orientasi Peta
      • Menyamakan arah peta dengan medan sebenarnya
      • Cari landmark yang mudah dikenali
      • Gunakan tulisan di peta sebagai panduan

   b) Penggunaan Kompas
      • Posisikan kompas di peta dengan garis sejajar rute
      • Putar peta dan kompas hingga garis lurus ke arah utara
      • Baca pembacaan sudut (azimuth) untuk arah tujuan

   c) Tanda-tanda Alam
      • Lumut tumbuh lebih banyak di sisi utara pohon
      • Matahari terbit di timur dan terbenam di barat
      • Gunung cenderung memiliki puncak yang mudah dikenali

═══════════════════════════════════════════════════════════════════════════════

3. ESTIMASI WAKTU PERJALANAN

   Rumus Umum:
   Waktu (jam) = Jarak Horizontal (km) / 5 + Kenaikan Vertikal (m) / 600

   Contoh:
   Rute 8 km horizontal + 1200 m naik = 8/5 + 1200/600 = 1.6 + 2 = 3.6 jam

═══════════════════════════════════════════════════════════════════════════════

4. SETUP CAMP DAN BIVAK

   a) Pemilihan Lokasi
      • Pilih tempat yang datar dan aman dari luncuran batu
      • Hindari area rawa atau pengaliran air
      • Pastikan ada perlindungan dari angin

   b) Pemasangan Tenda
      • Pasang tenda dengan arah pintu menghadap ke hilir
      • Gunakan guyline (tali) dengan baik untuk stabilitas
      • Singkirkan batu dan duri sebelum memasang

═══════════════════════════════════════════════════════════════════════════════

Dokumentasi ini dibuat oleh SIMAKSI untuk meningkatkan pengetahuan teknis Anda.
Untuk informasi lebih lanjut, kunjungi https://simaksi.local
`
    },
    'peralatan': {
        title: 'Daftar Peralatan & Packing',
        filename: 'Panduan-Peralatan.txt',
        content: `
╔════════════════════════════════════════════════════════════════════════════╗
║                       DAFTAR PERALATAN & PACKING PANDUAN                  ║
║                              SIMAKSI v2.0.0                               ║
╚════════════════════════════════════════════════════════════════════════════╝

Tanggal: ${new Date().toLocaleDateString('id-ID')}

═══════════════════════════════════════════════════════════════════════════════

1. PERALATAN WAJIB (INDIVIDUAL)

   Perlengkapan Pribadi:
   ☑ Carrier/Ransel (50-70L untuk multi-hari)
   ☑ Sleeping Bag (disesuaikan dengan suhu)
   ☑ Matras (foam atau inflatable)
   ☑ Sepatu trekking berkualitas (sudah break-in)
   ☑ Kaos kaki tebal (minimal 2 pasang)
   ☑ Pakaian berlapis (base layer, mid layer, outer layer)
   ☑ Topi atau bandana
   ☑ Sarung tangan (jika dingin)
   ☑ Baterai cadangan untuk headlamp
   ☑ Obat pribadi dan P3K

═══════════════════════════════════════════════════════════════════════════════

2. PERALATAN OPSIONAL (INDIVIDUAL)

   Peralatan Tambahan:
   • Gaiter (untuk mencegah debu/kerikil masuk sepatu)
   • Brace lutut atau ankle support
   • Sunscreen dan lip balm
   • Insect repellent
   • Kamera atau smartphone dengan power bank
   • Headlamp cadangan
   • Pena dan notebook kecil
   • Permen atau energi bar ekstra

═══════════════════════════════════════════════════════════════════════════════

3. PERALATAN KELOMPOK

   Perlengkapan Kelompok (dibagi rata):
   ☑ Tenda (kapasitas sesuai jumlah peserta)
   ☑ Kompor camping dan bahan bakar
   ☑ Panci dan peralatan masak
   ☑ Alat makan (piring, gelas, sendok)
   ☑ Tali dan peralatan keselamatan
   ☑ Peta dan kompas
   ☑ First aid kit lengkap
   ☑ Obat-obatan kelompok

═══════════════════════════════════════════════════════════════════════════════

4. SISTEM LAYERING PAKAIAN

   Layer 1: Base Layer (Wicking)
   • Material: Merino wool atau polyester
   • Fungsi: Menyerap keringat dari kulit
   • Contoh: Thermal shirt/legging

   Layer 2: Mid Layer (Insulation)
   • Material: Fleece atau down
   • Fungsi: Menjaga kehangatan
   • Contoh: Fleece jacket, down vest

   Layer 3: Outer Layer (Protection)
   • Material: Windproof/waterproof
   • Fungsi: Melindungi dari cuaca ekstrem
   • Contoh: Rain jacket, wind shell

═══════════════════════════════════════════════════════════════════════════════

5. TIPS PACKING

   a) Sistem Packing
      • Berat terberat (sleeping bag, tenda) di tengah dekat punggung
      • Barang yang sering digunakan di luar atau mudah dijangkau
      • Barang berat di bagian bawah, ringan di bagian atas

   b) Waterproofing
      • Gunakan dry bag atau trash bag plastik
      • Pisahkan barang basah dan kering
      • Jika item penting, beri perlindungan ganda

   c) Berat Total
      • Ideal untuk pendaki pemula: 15-20% dari berat badan
      • Untuk pendaki berpengalaman: 20-25% dari berat badan
      • Maksimal: 30 kg (kecuali untuk guide kelompok)

═══════════════════════════════════════════════════════════════════════════════

Dokumentasi ini dibuat oleh SIMAKSI untuk membantu Anda berkemas dengan tepat.
Untuk informasi lebih lanjut, kunjungi https://simaksi.local
`
    },
    'fisik': {
        title: 'Persiapan Fisik & Nutrisi',
        filename: 'Panduan-Fisik.txt',
        content: `
╔════════════════════════════════════════════════════════════════════════════╗
║                       PERSIAPAN FISIK & NUTRISI PANDUAN                   ║
║                              SIMAKSI v2.0.0                               ║
╚════════════════════════════════════════════════════════════════════════════╝

Tanggal: ${new Date().toLocaleDateString('id-ID')}

═══════════════════════════════════════════════════════════════════════════════

1. PROGRAM LATIHAN FISIK (8-12 minggu)

   Minggu 1-3: Pembangunan Dasar
   • Lari ringan 2-3x per minggu (20-30 menit)
   • Naik turun tangga 2x per minggu (10-15 menit)
   • Stretching dan flexibility 3x per minggu

   Minggu 4-6: Intensitas Sedang
   • Lari 3x per minggu (30-40 menit)
   • Hill training 1-2x per minggu
   • Squats dan lunges 2x per minggu (3 set x 10 reps)
   • Berenang atau bersepeda 1x per minggu

   Minggu 7-10: Persiapan Khusus
   • Lari 3-4x per minggu dengan beban (carrier 10-15 kg)
   • Naik gunung kecil atau tanjakan curam 2-3x
   • Latihan otot inti (core) 3x per minggu
   • Latihan keseimbangan dan stabilitas

═══════════════════════════════════════════════════════════════════════════════

2. LATIHAN OTOT UTAMA

   a) Otot Kaki
      • Squats: 3 set x 15 reps
      • Lunges: 3 set x 12 reps
      • Calf raises: 3 set x 15 reps
      • Step-ups dengan beban: 3 set x 10 reps

   b) Otot Punggung dan Inti
      • Plank: 3 set x 30-60 detik
      • Superman: 3 set x 10 reps
      • Reverse fly: 3 set x 12 reps
      • Dead bug: 3 set x 10 reps

   c) Otot Bahu
      • Push-ups: 3 set x 10-15 reps
      • Shoulder press: 3 set x 10 reps

═══════════════════════════════════════════════════════════════════════════════

3. NUTRISI UNTUK PENDAKIAN

   a) Karbohidrat Kompleks
      • Nasi merah, gandum, oat
      • Roti whole wheat
      • Pasta integral
      • Proporsi: 45-65% dari total kalori

   b) Protein
      • Daging tanpa lemak, ikan
      • Telur, kacang-kacangan
      • Produk dairy rendah lemak
      • Proporsi: 10-35% dari total kalori

   c) Lemak Sehat
      • Avokad, kacang, biji-bijian
      • Minyak zaitun, ikan berlemak
      • Proporsi: 20-35% dari total kalori

═══════════════════════════════════════════════════════════════════════════════

4. HIDRASI

   Kebutuhan Air:
   • Sebelum aktivitas: 500-600 ml, 2-3 jam sebelumnya
   • Selama aktivitas: 150-250 ml setiap 15-20 menit
   • Sesudah aktivitas: 150% dari cairan yang hilang selama 4-6 jam

   Tips:
   • Minum secara rutin, jangan menunggu haus
   • Gunakan elektrolit untuk aktivitas lebih dari 1 jam
   • Hindari kafein berlebihan sebelum pendakian

═══════════════════════════════════════════════════════════════════════════════

5. ISTIRAHAT DAN PEMULIHAN

   a) Istirahat Sebelum Pendakian
      • Tidur 7-8 jam minimal 1 minggu sebelumnya
      • Tidur 8+ jam malam sebelum pendakian
      • Hindari alkohol 2-3 hari sebelumnya

   b) Pemulihan Setelah Pendakian
      • Stretching ringan dalam 30 menit pertama
      • Konsumsi karbohidrat + protein dalam 30-60 menit
      • Tidur cukup untuk recovery otot
      • Hindari aktivitas berat 2-3 hari kemudian

═══════════════════════════════════════════════════════════════════════════════

Dokumentasi ini dibuat oleh SIMAKSI untuk optimasi performa fisik Anda.
Untuk informasi lebih lanjut, kunjungi https://simaksi.local
`
    },
    'medis': {
        title: 'Kesehatan & Pertolongan Pertama',
        filename: 'Panduan-Medis.txt',
        content: `
╔════════════════════════════════════════════════════════════════════════════╗
║                    KESEHATAN & PERTOLONGAN PERTAMA PANDUAN                ║
║                              SIMAKSI v2.0.0                               ║
╚════════════════════════════════════════════════════════════════════════════╝

Tanggal: ${new Date().toLocaleDateString('id-ID')}

═══════════════════════════════════════════════════════════════════════════════

1. PENYAKIT KETINGGIAN (ACUTE MOUNTAIN SICKNESS - AMS)

   Gejala Awal:
   • Sakit kepala
   • Mual dan kehilangan nafsu makan
   • Kelelahan dan kelemahan
   • Pusing dan sulit tidur

   Pencegahan:
   • Naik secara perlahan untuk aklimatisasi
   • Tingkatkan ketinggian maksimal 300-500 m per hari
   • Istirahat yang cukup
   • Hidrasi yang adekuat
   • Hindari alkohol

   Penanganan:
   • Istirahat di ketinggian saat ini
   • Konsumsi aspirin atau ibuprofen
   • Jika gejala memburuk, turun ke ketinggian yang lebih rendah

═══════════════════════════════════════════════════════════════════════════════

2. HIPOTERMIA (PENURUNAN SUHU TUBUH)

   Gejala:
   • Gemetar yang tidak terkontrol
   • Bingung atau perubahan perilaku
   • Kulit pucat dan dingin
   • Nadi lambat

   Pencegahan:
   • Jaga tubuh tetap kering
   • Gunakan pakaian berlapis
   • Hindari angin dan kelembaban

   Penanganan:
   • Pindahkan ke tempat yang hangat
   • Ganti pakaian basah dengan pakaian kering
   • Beri minuman hangat (hindari alkohol)
   • Hubungi pertolongan medis jika serius

═══════════════════════════════════════════════════════════════════════════════

3. DEHIDRASI

   Gejala:
   • Haus yang berlebihan
   • Mulut dan lidah kering
   • Urine berwarna gelap
   • Pusing dan lemas

   Pencegahan:
   • Minum air secara berkala (150-250 ml setiap 15-20 menit)
   • Jangan menunggu sampai haus
   • Hindari minuman beralkohol

   Penanganan:
   • Berhenti dan istirahat
   • Minum air secara perlahan dan teratur
   • Konsumsi makanan yang mengandung natrium

═══════════════════════════════════════════════════════════════════════════════

4. LUKA DAN PERDARAHAN

   Luka Ringan:
   • Bersihkan dengan air bersih
   • Keringkan dengan kain bersih
   • Aplikasikan salep antiseptik
   • Tutup dengan plester atau kain kasa

   Luka Dalam/Perdarahan Berat:
   • Tekan dengan kain bersih untuk menghentikan perdarahan
   • Angkat bagian tubuh yang terluka
   • Ikat dengan perban ketat (jangan sampai memotong sirkulasi)
   • Hubungi pertolongan medis segera

═══════════════════════════════════════════════════════════════════════════════

5. CEDERA SENDI

   Keseleo Ringan:
   • Istirahat (R)
   • Es atau kompres dingin (I)
   • Kompresi dengan perban elastis (C)
   • Elevasi/angkat sendi (E)

   Keseleo Berat:
   • Immobilisasi sendi
   • Berikan es dalam 10-15 menit
   • Hubungi pertolongan medis

═══════════════════════════════════════════════════════════════════════════════

6. P3K KIT YANG HARUS DIBAWA

   Obat-obatan:
   • Aspirin atau paracetamol (untuk pusing/demam)
   • Ibuprofen (untuk anti radang)
   • Diare dan anti mual
   • Salep antiseptik
   • Obat pribadi (insulin, inhaler, dll)

   Peralatan:
   • Perban elastis
   • Kasa steril dan plester
   • Pinset dan gunting
   • Thermal blanket
   • Handuk kecil dan sarung tangan
   • Thermometer

═══════════════════════════════════════════════════════════════════════════════

Dokumentasi ini dibuat oleh SIMAKSI untuk kesehatan dan keselamatan Anda.
Untuk informasi lebih lanjut, kunjungi https://simaksi.local
`
    },
    'etika': {
        title: 'Etika Pendaki & Pelestarian',
        filename: 'Panduan-Etika.txt',
        content: `
╔════════════════════════════════════════════════════════════════════════════╗
║                     ETIKA PENDAKI & PELESTARIAN PANDUAN                   ║
║                              SIMAKSI v2.0.0                               ║
╚════════════════════════════════════════════════════════════════════════════╝

Tanggal: ${new Date().toLocaleDateString('id-ID')}

═══════════════════════════════════════════════════════════════════════════════

1. PRINSIP LEAVE NO TRACE (LNT)

   1. Plan Ahead and Prepare
      • Rencanakan perjalanan dengan matang
      • Ketahui regulasi dan syarat khusus
      • Siapkan perlengkapan yang sesuai

   2. Travel on Durable Surfaces
      • Tetap di jalur yang sudah ada
      • Hindari menciptakan jalur baru
      • Jangan membuat shortcut yang merusak vegetasi

   3. Dispose of Waste Properly
      • Bawa turun semua sampah (termasuk organic waste)
      • Jangan buang di sumber air
      • Gunakan toilet yang tersedia jika ada

   4. Leave What You Find
      • Jangan memetik bunga atau tanaman
      • Jangan menggambari batu atau pohon
      • Jangan mengambil artefak alam

   5. Minimize Campfire Impacts
      • Gunakan kompor, hindari api unggun jika mungkin
      • Jika harus api, gunakan existing fire ring
      • Matikan sepenuhnya sebelum meninggalkan

   6. Respect Wildlife
      • Amati satwa dari jarak jauh
      • Jangan memberi makan hewan
      • Hindari gangguan pada habitat

   7. Be Considerate of Other Visitors
      • Jaga suara agar tidak mengganggu
      • Langkah di tepi jalur saat bertemu pendaki lain
      • Berbagi informasi dengan ramah

═══════════════════════════════════════════════════════════════════════════════

2. ETIKA PENGHORMATAN ALAM

   Kelestarian Flora:
   • Tidak memetik bunga langka atau endemik
   • Tidak merusak pohon untuk membuat kayu bakar
   • Hindari berjalan di vegetasi yang rentan

   Kelestarian Fauna:
   • Jangan mengejar atau menangkap hewan
   • Jangan mengambil telur atau sarang
   • Hindari membuat kebisingan saat dusk/dawn

   Kelestarian Geologi:
   • Jangan mengambil batu atau mineral
   • Jangan membuat goresan di batu
   • Jaga stalaktin/stalagmit di gua

═══════════════════════════════════════════════════════════════════════════════

3. ETIKA SOSIAL PENDAKI

   Papasan di Jalur:
   • Langkah ke tepi dan biarkan pendaki naik lewat
   • Geser ke bawah untuk pendaki turun
   • Sapakan salam dengan ramah

   Kearifan Lokal:
   • Hormati tradisi dan kepercayaan setempat
   • Jangan memasuki area yang dianggap sakral
   • Tanya izin sebelum berfoto

   Kebisingan dan Musik:
   • Hindari musik atau speaker
   • Berbicara dengan suara normal
   • Hargai ketenangan alam

═══════════════════════════════════════════════════════════════════════════════

4. TANGGUNG JAWAB SEBAGAI PENDAKI

   Sebelum Pendakian:
   • Informasikan rencana ke keluarga
   • Pastikan fisik siap
   • Beri tahu guide tentang kondisi kesehatan

   Selama Pendakian:
   • Ikuti instruksi guide
   • Jangan memisahkan diri dari kelompok
   • Laporkan masalah kesehatan segera

   Setelah Pendakian:
   • Beri kabar kepada keluarga
   • Jangan membuang sampah di jalanan
   • Berbagi pengalaman dengan positif

═══════════════════════════════════════════════════════════════════════════════

5. DAMPAK LINGKUNGAN DAN SOLUSI

   Masalah: Kerusakan Vegetasi
   Solusi: Tetap di jalur, gunakan alas kaki yang tepat

   Masalah: Sampah di Gunung
   Solusi: Bawa turun semua sampah, ajak orang lain juga

   Masalah: Overuse Jalur
   Solusi: Gunakan jalur alternatif, kunjungi di off-season

   Masalah: Gangguan Satwa
   Solusi: Hindari pemangilan, jangan pemberian makanan

═══════════════════════════════════════════════════════════════════════════════

Dokumentasi ini dibuat oleh SIMAKSI untuk menjaga kelestarian alam Indonesia.
Untuk informasi lebih lanjut, kunjungi https://simaksi.local
`
    }
};

// Download panduan file
exports.downloadPanduan = (req, res) => {
    try {
        const filename = req.params.filename;
        const guideType = filename.replace(/\.txt$|\.pdf$/, '').toLowerCase().replace(/-/g, '');
        
        // Cari panduan yang sesuai
        let panduanKey = null;
        for (const key of Object.keys(panduanData)) {
            if (filename.toLowerCase().includes(key)) {
                panduanKey = key;
                break;
            }
        }

        if (!panduanKey || !panduanData[panduanKey]) {
            return res.status(404).json({ error: 'File panduan tidak ditemukan' });
        }

        const panduan = panduanData[panduanKey];
        const content = panduan.content;

        // Set header untuk download
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${panduan.filename}"`);
        
        // Send file content
        res.send(content);
    } catch (err) {
        console.error('Download panduan error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengunduh panduan' });
    }
};

// Get panduan list
exports.getPanduanList = (req, res) => {
    try {
        const list = Object.keys(panduanData).map(key => ({
            id: key,
            title: panduanData[key].title,
            filename: panduanData[key].filename
        }));
        
        res.json(list);
    } catch (err) {
        console.error('Get panduan list error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};

// Generate panduan content for view
exports.generateContent = (type) => {
    if (panduanData[type]) {
        return panduanData[type].content;
    }
    return null;
};
