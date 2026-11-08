/**
 * seeder.js - Initial Seeder for Newly Registered Bride & Groom Accounts
 * Platform Nikah - All-in-One Wedding Planner & Digital Invitation
 */

/**
 * 16 Item Checklist Persiapan Pernikahan Indonesia (4 Fase Waktu)
 */
const DEFAULT_WEDDING_CHECKLISTS = [
  // FASE 1: H-12 s/d H-6 (Penentuan Fondasi & Booking Utama)
  {
    phase: 'H-12_H-6',
    task_title: 'Menentukan konsep pernikahan & kesepakatan tanggal kedua keluarga',
    notes: 'Diskusi adat (Jawa/Sunda/Minang/Modern), jumlah estimasi tamu, dan restu orang tua.',
    sort_order: 1
  },
  {
    phase: 'H-12_H-6',
    task_title: 'Menyusun estimasi total anggaran & pembagian 7 pos biaya utama',
    notes: 'Kalkulasi alokasi dana tabungan pengantin vs bantuan keluarga untuk mencegah overbudget.',
    sort_order: 2
  },
  {
    phase: 'H-12_H-6',
    task_title: 'Survei dan booking Venue / Gedung akad & resepsi pernikahan',
    notes: 'Kunci tanggal dan amankan DP venue sebelum slot tanggal cantik penuh.',
    sort_order: 3
  },
  {
    phase: 'H-12_H-6',
    task_title: 'Uji rasa (Food Tasting) & pemilihan vendor Katering utama',
    notes: 'Hitung rasio porsi prasmanan dan pondokan (rasio ideal tamu x 1.8 atau 2 porsi).',
    sort_order: 4
  },

  // FASE 2: H-6 s/d H-3 (Vendor Kreatif & Berkas Administrasi KUA)
  {
    phase: 'H-6_H-3',
    task_title: 'Booking vendor Dekorasi Pelaminan, Photo Booth & Pencahayaan',
    notes: 'Sesuaikan tema warna busana dengan palet dekorasi panggung pelaminan.',
    sort_order: 5
  },
  {
    phase: 'H-6_H-3',
    task_title: 'Booking Make Up Artist (MUA) & Fitting Baju Pengantin + Keluarga',
    notes: 'Tes make up pengantin dan pastikan seragam keluarga inti sudah siap.',
    sort_order: 6
  },
  {
    phase: 'H-6_H-3',
    task_title: 'Booking vendor Dokumentasi (Fotografer, Videografer & Drone)',
    notes: 'Tentukan paket cinematic teaser, foto prewedding, dan dokumentasi hari H.',
    sort_order: 7
  },
  {
    phase: 'H-6_H-3',
    task_title: 'Urus berkas KUA N1-N4 (Surat Pengantar RT/RW, Puskesmas & Kelurahan)',
    notes: 'Syarat wajib administrasi KUA: Surat N1, N2, N4, imunisasi TT calon pengantin, dan surat numpang nikah jika beda kecamatan.',
    sort_order: 8
  },

  // FASE 3: H-3 s/d H-1 (Finalisasi Berkas, Tamu & Desain Undangan)
  {
    phase: 'H-3_H-1',
    task_title: 'Daftar nikah resmi di KUA setempat & ikut Bimbingan Perkawinan (Bimwin)',
    notes: 'Lengkapi bukti pendaftaran Simkah Kemenag dan sertifikat aplikasi Elsimil BKKBN.',
    sort_order: 9
  },
  {
    phase: 'H-3_H-1',
    task_title: 'Finalisasi daftar master tamu undangan & alokasi souvenir',
    notes: 'Kelompokkan tamu VIP, keluarga, rekan kerja, dan sahabat di tabel tamu.',
    sort_order: 10
  },
  {
    phase: 'H-3_H-1',
    task_title: 'Membeli cincin kawin, mahar nikah & hias kotak seserahan hantaran',
    notes: 'Siapkan mahar tunai/emas serta hantaran seserahan sesuai tradisi.',
    sort_order: 11
  },
  {
    phase: 'H-3_H-1',
    task_title: 'Aktifkan website Undangan Digital & sebar link via WhatsApp',
    notes: 'Kirim undangan digital personal dengan tautan nama tamu masing-masing.',
    sort_order: 12
  },

  // FASE 4: H-30 s/d D-Day (Technical Meeting, Rundown & Pelaksanaan)
  {
    phase: 'H-30_D-Day',
    task_title: 'Technical Meeting (TM) seluruh vendor & panitia keluarga besar',
    notes: 'Penyelarasan alur acara, jam loading dekorasi, listrik venue, dan konsumsi panitia.',
    sort_order: 13
  },
  {
    phase: 'H-30_D-Day',
    task_title: 'Finalisasi Rundown Acara Akad & Resepsi menit demi menit',
    notes: 'Tunjuk PIC keluarga untuk buku tamu, konsumsi, mahar, dan koordinasi penghulu KUA.',
    sort_order: 14
  },
  {
    phase: 'H-30_D-Day',
    task_title: 'Pelunasan seluruh invoice pembayaran vendor pernikahan',
    notes: 'Selesaikan sisa tagihan katering, dekorasi, sound system, dan siapkan tips crew.',
    sort_order: 15
  },
  {
    phase: 'H-30_D-Day',
    task_title: 'Gladi resik akad nikah, serah terima mahar & istirahat total H-2',
    notes: 'Jaga stamina, perbanyak doa, dan pastikan seluruh perlengkapan akad sudah di venue.',
    sort_order: 16
  }
];

/**
 * 7 Pos Kategori Anggaran Dasar Pernikahan
 */
const DEFAULT_WEDDING_BUDGETS = [
  {
    category: 'Katering',
    item_name: 'Paket Katering Prasmanan & Stall Makanan',
    estimated_amount: 35000000,
    paid_amount: 0,
    actual_amount: 0,
    notes: 'Pos terbesar (~40-50% budget). Termasuk makanan prasmanan & gubukan.'
  },
  {
    category: 'Venue',
    item_name: 'Sewa Gedung / Lokasi Akad & Resepsi',
    estimated_amount: 15000000,
    paid_amount: 0,
    actual_amount: 0,
    notes: 'Biaya sewa tempat, kebersihan, parkir, dan izin keramaian.'
  },
  {
    category: 'Dekorasi',
    item_name: 'Dekorasi Pelaminan, Photo Booth & Lorong Masuk',
    estimated_amount: 12000000,
    paid_amount: 0,
    actual_amount: 0,
    notes: 'Panggung pelaminan, kursi pengantin, janur kuning, dan pencahayaan.'
  },
  {
    category: 'MUA & Busana',
    item_name: 'Make Up & Busana Akad/Resepsi (Mempelai & Orang Tua)',
    estimated_amount: 8000000,
    paid_amount: 0,
    actual_amount: 0,
    notes: 'Rias pengantin akad + resepsi, retouched, kain kebaya/beskap orang tua & besan.'
  },
  {
    category: 'Dokumentasi',
    item_name: 'Foto Liputan, Cinematic Video Teaser & Album Kolase',
    estimated_amount: 7000000,
    paid_amount: 0,
    actual_amount: 0,
    notes: 'Dokumentasi momen sakral akad nikah, resepsi, dan video highlight.'
  },
  {
    category: 'Seserahan & KUA',
    item_name: 'Biaya Penghulu KUA, Mahar & Kotak Seserahan Hantaran',
    estimated_amount: 5000000,
    paid_amount: 0,
    actual_amount: 0,
    notes: 'Biaya nikah di luar KUA / hari libur (Rp 600rb PNBP), jasa hias hantaran & mahar.'
  },
  {
    category: 'Dana Darurat',
    item_name: 'Dana Cadangan Kontinjensi (10%)',
    estimated_amount: 8000000,
    paid_amount: 0,
    actual_amount: 0,
    notes: 'Antisipasi kelebihan porsi katering mendadak, tips crew/kebersihan, dan kebutuhan tak terduga.'
  }
];

/**
 * Fungsi seeder otomatis yang dipanggil saat user baru terdaftar dengan token
 * @param {string} userId - UUID user di tabel users
 * @param {string} groomName - Nama panggilan pria
 * @param {string} brideName - Nama panggilan wanita
 * @param {string} weddingDate - Tanggal rencana pernikahan (YYYY-MM-DD)
 * @returns {Promise<{success: boolean, wedding: object|null, checklistsCount: number, budgetsCount: number}>}
 */
async function seedNewBrideAccount(userId, groomName, brideName, weddingDate) {
  if (!window.supabaseClient) {
    console.error('Supabase client belum terinisialisasi!');
    return { success: false, error: 'Supabase client not initialized' };
  }

  const client = window.supabaseClient;

  try {
    // 1. Buat Slug unik (groom + bride + 3 digit acak)
    const cleanGroom = (groomName || 'groom').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanBride = (brideName || 'bride').toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomCode = Math.floor(100 + Math.random() * 900);
    const slug = `${cleanGroom}-${cleanBride}-${randomCode}`;

    // A) Insert baris awal ke tabel weddings
    const weddingPayload = {
      user_id: userId,
      slug: slug,
      groom_fullname: groomName || 'Mempelai Pria',
      bride_fullname: brideName || 'Mempelai Wanita',
      groom_nickname: groomName || 'Pria',
      bride_nickname: brideName || 'Wanita',
      akad_date: weddingDate || null,
      resepsi_date: weddingDate || null,
      is_published: false
    };

    const { data: weddingData, error: weddingError } = await client
      .from('weddings')
      .insert([weddingPayload])
      .select()
      .single();

    if (weddingError) {
      console.error('Error saat seed tabel weddings:', weddingError);
      checkRlsError(weddingError);
    } else {
      console.log('Berhasil membuat data awal weddings:', weddingData);
      // Simpan referensi wedding ke localStorage
      if (weddingData) {
        localStorage.setItem(STORAGE_KEYS.WEDDING, JSON.stringify(weddingData));
      }
    }

    // B) Insert 16 Checklist Persiapan Pernikahan Indonesia
    const checklistPayload = DEFAULT_WEDDING_CHECKLISTS.map(item => ({
      user_id: userId,
      task_title: item.task_title,
      // Format notes menyimpan kode fase untuk mempermudah filter & UI
      notes: `[${item.phase}] ${item.notes}`,
      is_completed: false,
      sort_order: item.sort_order
    }));

    const { data: checklistsData, error: checklistsError } = await client
      .from('planner_checklists')
      .insert(checklistPayload)
      .select();

    if (checklistsError) {
      console.error('Error saat seed tabel planner_checklists:', checklistsError);
      checkRlsError(checklistsError);
    } else {
      console.log(`Berhasil insert ${checklistsData?.length || 0} item checklist.`);
    }

    // C) Insert 7 Pos Anggaran Dasar Pernikahan
    const budgetPayload = DEFAULT_WEDDING_BUDGETS.map(item => ({
      user_id: userId,
      category: item.category,
      item_name: item.item_name,
      estimated_amount: item.estimated_amount,
      paid_amount: item.paid_amount,
      actual_amount: item.actual_amount,
      notes: item.notes
    }));

    const { data: budgetsData, error: budgetsError } = await client
      .from('planner_budgets')
      .insert(budgetPayload)
      .select();

    if (budgetsError) {
      console.error('Error saat seed tabel planner_budgets:', budgetsError);
      checkRlsError(budgetsError);
    } else {
      console.log(`Berhasil insert ${budgetsData?.length || 0} pos anggaran.`);
    }

    return {
      success: true,
      wedding: weddingData || weddingPayload,
      checklistsCount: checklistsData ? checklistsData.length : checklistPayload.length,
      budgetsCount: budgetsData ? budgetsData.length : budgetPayload.length
    };
  } catch (err) {
    console.error('Terjadi pengecualian saat seedNewBrideAccount:', err);
    return { success: false, error: err.message };
  }
}

// Ekspor ke window global
window.seedNewBrideAccount = seedNewBrideAccount;
window.DEFAULT_WEDDING_CHECKLISTS = DEFAULT_WEDDING_CHECKLISTS;
window.DEFAULT_WEDDING_BUDGETS = DEFAULT_WEDDING_BUDGETS;
