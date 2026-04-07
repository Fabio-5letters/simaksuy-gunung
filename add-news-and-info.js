const db = require('./db');

async function addNewsAndInfo() {
  try {
    console.log('📰 Menambahkan berita dan informasi gunung...\n');

    // Update deskripsi gunung
    const gunungUpdates = [
      {
        id: 1,
        deskripsi: `Gunung Merbabu adalah gunung berapi yang sudah tidak aktif lagi di Jawa Tengah. Dengan ketinggian 3.142 mdpl, gunung ini menawarkan pemandangan spektakuler dari puncaknya yang terkenal dengan padang rumput alpine yang luas. Jalur pendakian populer melalui Selo, Wekas, dan Suwanting. Sunrise di puncak Merbabu menjadi daya tarik utama bagi para pendaki. Gunung ini juga dikenal dengan jalur trek yang cukup menantang dengan pemandangan awan yang memukau dari ketinggian.`
      },
      {
        id: 2,
        deskripsi: `Gunung Merapi adalah salah satu gunung berapi paling aktif di Indonesia yang terletak di perbatasan DIY Yogyakarta dan Jawa Tengah. Dengan ketinggian 2.911 mdpl, Merapi terkenal dengan aktivitas vulkaniknya yang tinggi dan menjadi laboratorium alam bagi para ahli geologi. Pendakian ke Merapi membutuhkan kehati-hatian ekstra karena status aktivitasnya yang bisa berubah sewaktu-waktu. Namun, panorama sunset dari puncaknya dan kawah yang aktif menjadikannya destinasi favorit bagi pendaki berpengalaman.`
      },
      {
        id: 3,
        deskripsi: `Gunung Lawu adalah gunung tertinggi di perbatasan Jawa Tengah dan Jawa Timur dengan puncak mencapai 3.265 mdpl. Gunung ini dikenal sebagai tempat spiritual dengan banyak petilasan dan makam keramat di sepanjang jalur pendakian. Lawu menawarkan jalur pendakian yang relatif landing melalui Cemoro Sewu, Cemoro Kandang, dan Candi Cetho. Pendaki sering berburu sunrise spektakuler dari puncak, dan gunung ini juga terkenal dengan fenomena "lautan awan" yang memukau di pagi hari.`
      },
      {
        id: 4,
        deskripsi: `Gunung Sindoro adalah gunung berapi tipe A di Kabupaten Wonosobo dan Temanggung dengan ketinggian 3.136 mdpl. Bersama dengan Gunung Sumbing yang berdampingan, Sindoro menawarkan keindahan alam yang luar biasa dengan kaldera yang luas di puncaknya. Jalur pendakian melalui Kledung dan Sigedang menjadi favorit pendaki. Gunung ini memiliki panorama alam yang masih alami dengan vegetasi yang beragam mulai dari hutan tropis hingga padang rumput alpine di kawasan puncak.`
      }
    ];

    // Update deskripsi gunung
    for (const update of gunungUpdates) {
      await db.query(
        'UPDATE gunung SET deskripsi = ? WHERE id = ?',
        [update.deskripsi, update.id]
      );
      console.log(`✓ Deskripsi Gunung ${update.id} ditambahkan`);
    }

    console.log('\n📰 Menambahkan berita-berita terbaru...\n');

    // Insert berita
    const beritaBaru = [
      {
        judul: 'Gunung Merbabu Buka Kuota Pendakian 150 Orang Per Hari',
        isi_berita: `Setelah melalui proses evaluasi dan penataan jalur, Gunung Merbabu resmi membuka kuota pendakian hingga 150 orang per hari mulai Mei 2026. Keputusan ini diambil setelah infrastruktur dan fasilitas pendakian diperbaiki untuk kenyamanan dan keselamatan pendaki.

Para pendaki wajib mendaftar melalui sistem SIMAKSI online dan membawa identitas diri saat pendakian. Dilarang keras mendaki tanpa SIMAKSI resmi. Gunung Merbabu dikenal dengan padang rumput alpine yang luas dan pemandangan awan yang memukau dari puncaknya.

"Kami sudah menyiapkan pos-pos pemeriksaan dan meningkatkan keamanan di setiap jalur pendakian," ujar Kepala Balai Taman Nasional Gunung Merbabu. Pendaki juga diwajibkan untuk menjaga kebersihan dan tidak meninggalkan sampah di sepanjang jalur pendakian.`,
        tanggal: '2026-04-07'
      },
      {
        judul: 'Waspada! Gunung Merapi Tingkatkan Status Menjadi Siaga II',
        isi_berita: `Badan Nasional Penanggulangan Bencana (BNPB) meningkatkan status Gunung Merapi menjadi Siaga Level II sejak awal April 2026. Peningkatan status ini disebabkan oleh adanya peningkatan aktivitas vulkanik yang terdeteksi oleh pos pemantauan.

Meskipun status Siaga II, pendakian masih diperbolehkan hingga radius 3 km dari kawah. Pendaki diharapkan selalu memantau informasi terkini dari pos pemantauan dan mengikuti arahan dari petugas.

Aktivitas kegempaan vulkanik masih fluktuatif dan perlu diwaspadai. Pendaki yang sudah mendaftar SIMAKSI tidak perlu khawatir, namun harus tetap waspada dan siap evakuasi jika diperlukan. Jalur pendakian resmi tetap buka dengan pengawasan ketat dari petugas.`,
        tanggal: '2026-04-06'
      },
      {
        judul: 'Festival Sunrise di Gunung Lawu Menarik Ribuan Pendaki',
        isi_berita: `Festival Sunrise Gunung Lawu 2026 berhasil menarik lebih dari 2.000 pendaki dari berbagai daerah. Acara yang digelar pada akhir pekan pertama April ini menyajikan panorama matahari terbit yang spektakuler dari puncak tertinggi Lawu.

Selain menikmati sunrise, peserta festival juga dapat mengikuti berbagai kegiatan seperti yoga di puncak, foto hunting, dan talkshow tentang kelestarian alam. Gunung Lawu memang terkenal dengan pemandangan matahari terbitnya yang memukau dan suasana mistis yang kental.

"Gunung Lawu bukan hanya destinasi pendakian, tapi juga pengalaman spiritual yang tak terlupakan," ungkap salah satu peserta dari Jakarta. Festival ini rencananya akan diadakan setiap tahun sebagai ajang promosi wisata alam di Jawa Tengah.`,
        tanggal: '2026-04-05'
      },
      {
        judul: 'Gunung Sindoro: Surga Tersembunyi bagi Pendaki Profesional',
        isi_berita: `Gunung Sindoro semakin dikenal luas di kalangan pendaki sebagai destinasi yang menawarkan tantangan nyata. Dengan ketinggian 3.136 mdpl, gunung ini memiliki jalur pendakian yang cukup ekstrem dan vegetasi yang masih sangat alami.

Pendakian ke puncak Sindoro membutuhkan waktu sekitar 6-8 jam dari basecamp dengan jalur yang berkelok melewati hutan tropis, savana, dan batu-batuan vulkanik. Di puncak, pendaki akan disambut dengan pemandangan kaldera yang luas dan panorama Gunung Sumbing yang berdampingan.

"Gunung Sindoro adalah tempat terbaik untuk menguji kemampuan pendakian. Jalurnya menantang tapi pemandangannya luar biasa," kata seorang guide lokal. Bagi pendaki yang mencari pengalaman petualangan sejati, Sindoro adalah pilihan yang sempurna.`,
        tanggal: '2026-04-04'
      },
      {
        judul: 'Tips Aman Mendaki Gunung untuk Pemula di Musim Hujan',
        isi_berita: `Musim hujan bukan halangan untuk mendaki gunung, namun memerlukan persiapan ekstra. Berikut adalah tips penting bagi pendaki pemula agar tetap aman dan nyaman saat mendaki di musim hujan:

1. **Cek Cuaca**: Selalu periksa prakiraan cuaca sebelum berangkat. Hindari mendaki saat ada peringatan cuaca ekstrem.

2. **Peralatan Waterproofing**: Bawa jas hujan, cover tas, dan pakaian cadangan dalam kantong plastik waterproof.

3. **Sepatu Anti Slip**: Gunakan sepatu gunung dengan sol yang baik untuk menghindari tergelincir di jalur licin.

4. **Bawa Logistik Lebih**: Siapkan makanan dan air minum ekstra karena perjalanan bisa lebih lambat di kondisi basah.

5. **Jaga Tubuh Tetap Kering**: Gunakan pakaian berlapis dan ganti pakaian basah segera untuk menghindari hipotermia.

6. **Informasikan Rencana**: Beri tahu keluarga atau teman tentang rencana pendakian Anda termasuk jalur dan estimasi waktu pulang.

Ingat, keselamatan adalah prioritas utama. Jangan memaksakan diri jika kondisi tidak memungkinkan.`,
        tanggal: '2026-04-03'
      },
      {
        judul: 'Pendakian Ramah Lingkungan: Kampanye Bersih di Semua Jalur Gunung',
        isi_berita: `Gerakan "Leave No Trace" semakin gencar dikampanyekan di seluruh jalur pendakian gunung di Jawa Tengah. Kampanye ini bertujuan menjaga kelestarian alam dan kebersihan jalur pendakian dari sampah.

Setiap pendaki diwajibkan untuk membawa turun semua sampah yang mereka hasilkan selama pendakian. Pos-pos sampah juga telah disediakan di basecamp untuk memudahkan pendaki mendaur ulang.

"Kami ingin generasi mendatang juga bisa menikmati keindahan gunung seperti yang kita rasakan sekarang," ujar koordinator kampanye. Diharapkan kampanye ini dapat meningkatkan kesadaran pendaki akan pentingnya menjaga kelestarian alam.

Pendaki yang kedapatan membuang sampah sembarangan akan dikenakan sanksi berupa denda atau pencabutan hak pendakian sementara. Mari bersama jaga gunung kita tetap bersih dan asri!`,
        tanggal: '2026-04-02'
      }
    ];

    for (const berita of beritaBaru) {
      await db.query(
        'INSERT INTO berita (judul, isi_berita, tanggal) VALUES (?, ?, ?)',
        [berita.judul, berita.isi_berita, berita.tanggal]
      );
      console.log(`✓ Berita "${berita.judul.substring(0, 50)}..." ditambahkan`);
    }

    console.log('\n✅ Selesai!');
    console.log(`   - 4 deskripsi gunung diupdate`);
    console.log(`   - 6 berita baru ditambahkan`);
    console.log('\n📊 Total Data Saat Ini:');
    
    const [totalGunung] = await db.query('SELECT COUNT(*) as total FROM gunung');
    const [totalBerita] = await db.query('SELECT COUNT(*) as total FROM berita');
    
    console.log(`   - Gunung: ${totalGunung[0].total}`);
    console.log(`   - Berita: ${totalBerita[0].total}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

addNewsAndInfo();
