/**
 * invitation-core.js - Engine Interaksi & Penampil Undangan Publik Terpadu
 * Platform Nikah - All-in-One Wedding Planner & Digital Invitation Platform
 */

class InvitationEngine {
  constructor() {
    this.wedding = null;
    this.template = null;
    this.slug = null;
    this.guestName = 'Tamu Kehormatan';
    this.isPlayingAudio = false;
    this.audioElement = null;
    this.countdownInterval = null;
  }

  /**
   * Inisialisasi engine saat halaman dimuat
   */
  async init() {
    try {
      this.extractParams();
      this.initAudioController();
      this.initLightbox();

      const success = await this.loadWeddingData();
      if (!success) return;

      this.applyThemeColors();
      this.applyTemplateStyles();
      this.renderCoverSection();
      this.renderCoupleSection();
      this.renderQuotesSection();
      this.renderCountdownSection();
      this.renderEventsSection();
      this.renderLoveStorySection();
      this.renderGallerySection();
      this.renderEnvelopesSection();
      this.renderRsvpSection();
      this.loadWishes();

      // Inisialisasi Lucide Icons
      if (window.lucide) {
        window.lucide.createIcons();
      }

    } catch (err) {
      console.error('Initialization error in InvitationEngine:', err);
      this.showErrorNotice('Terjadi kesalahan saat memuat undangan: ' + err.message);
    }
  }

  /**
   * Ekstrak slug dan nama tamu dari URL
   */
  extractParams() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // 1. Dapatkan slug (dari ?slug= ATAU dari path /u/:slug)
    let slug = urlParams.get('slug');
    if (!slug) {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const uIndex = pathParts.indexOf('u');
      if (uIndex !== -1 && pathParts[uIndex + 1]) {
        slug = pathParts[uIndex + 1];
      } else if (pathParts.length > 0) {
        const last = pathParts[pathParts.length - 1];
        if (last !== 'u.html' && last !== 'u') {
          slug = last;
        }
      }
    }
    this.slug = slug ? slug.trim() : null;

    // 2. Dapatkan nama tamu dari parameter ?to= atau ?dear=
    const toParam = urlParams.get('to') || urlParams.get('dear');
    if (toParam) {
      try {
        this.guestName = decodeURIComponent(toParam.replace(/\+/g, ' ')).trim();
      } catch (e) {
        this.guestName = toParam.trim();
      }
    }
  }

  /**
   * Load data wedding dan template dari Supabase
   */
  async loadWeddingData() {
    const client = window.supabaseClient;
    if (!client) {
      this.showErrorNotice('Supabase client tidak siap. Silakan refresh halaman.');
      return false;
    }

    if (!this.slug) {
      this.showNotFoundNotice('Slug tautan undangan tidak ditemukan pada URL.');
      return false;
    }

    // Query wedding berdasarkan slug
    const { data: wedding, error } = await client
      .from('weddings')
      .select('*')
      .eq('slug', this.slug)
      .maybeSingle();

    if (error) {
      console.error('Error fetching wedding by slug:', error);
      this.showErrorNotice('Gagal mengakses database undangan.');
      return false;
    }

    if (!wedding) {
      this.showNotFoundNotice(`Undangan dengan alamat "/u/${this.slug}" tidak ditemukan.`);
      return false;
    }

    this.wedding = wedding;

    // Cek status publikasi
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    const isOwner = currentUser && (currentUser.id === wedding.user_id || currentUser.role === 'admin');

    if (!wedding.is_published && !isOwner) {
      this.showUnpublishedNotice();
      return false;
    }

    // Ambil data template
    if (wedding.template_id) {
      const { data: tpl } = await client
        .from('templates')
        .select('*')
        .eq('id', wedding.template_id)
        .maybeSingle();
      this.template = tpl;
    }

    return true;
  }

  /**
   * Terapkan palet warna dinamis ke CSS Variables
   */
  applyThemeColors() {
    const custom = this.wedding.custom_theme_json || {};
    const tplColors = this.template?.default_colors_json || {};

    const bg = custom.bg || tplColors.bg || '#FCFBF9';
    const card = custom.card || tplColors.card || '#FFFFFF';
    const text = custom.text || tplColors.text || '#2C352E';
    const accent = custom.accent || tplColors.accent || '#D4AF37';

    const root = document.documentElement;
    root.style.setProperty('--bg-main', bg);
    root.style.setProperty('--bg-card', card);
    root.style.setProperty('--text-main', text);
    root.style.setProperty('--accent-color', accent);

    // Ubah background app container
    const app = document.getElementById('invitation-app-container');
    if (app) {
      app.style.backgroundColor = bg;
      app.style.color = text;
    }
  }

  /**
   * Terapkan ornamen visual berdasarkan template.slug
   */
  applyTemplateStyles() {
    const tplSlug = this.template?.slug || 'minimalist-sage';
    const container = document.getElementById('invitation-app-container');
    if (!container) return;

    if (tplSlug === 'cozy-terracotta') {
      container.classList.add('style-terracotta');
    } else {
      container.classList.add('style-minimalist');
    }
  }

  /**
   * 1. Layar Sampul Depan (Cover Screen)
   */
  renderCoverSection() {
    const groom = this.wedding.groom_nickname || 'Pria';
    const bride = this.wedding.bride_nickname || 'Wanita';
    const couple = `${groom} & ${bride}`;

    document.title = `Undangan Pernikahan ${couple} | Platform Nikah`;

    const coverCouple = document.getElementById('cover-couple-name');
    const coverGuest = document.getElementById('cover-guest-name');
    const coverDate = document.getElementById('cover-wedding-date');

    if (coverCouple) coverCouple.textContent = couple;
    if (coverGuest) coverGuest.textContent = this.guestName;
    if (coverDate) {
      coverDate.textContent = this.wedding.akad_date 
        ? formatDateIndo(this.wedding.akad_date) 
        : 'Menuju Hari Bahagia';
    }

    // Tombol Buka Undangan
    const openBtn = document.getElementById('btn-open-invitation');
    if (openBtn) {
      openBtn.addEventListener('click', () => this.openInvitation());
    }
  }

  /**
   * 2. Buka Sampul & Putar Musik
   */
  openInvitation() {
    const cover = document.getElementById('cover-screen');
    if (cover) {
      cover.classList.add('-translate-y-full', 'opacity-0', 'pointer-events-none');
      setTimeout(() => {
        cover.style.display = 'none';
      }, 750);
    }

    // Buka lock scroll body
    document.body.classList.remove('overflow-hidden');
    document.getElementById('invitation-app-container')?.classList.remove('overflow-hidden');

    // Putar musik latar
    this.playAudio();
  }

  /**
   * Audio Controller
   */
  initAudioController() {
    this.audioElement = document.getElementById('bg-audio');
    const audioBtn = document.getElementById('audio-control');

    if (audioBtn) {
      audioBtn.addEventListener('click', () => this.toggleAudio());
    }
  }

  playAudio() {
    if (!this.audioElement) return;
    
    // Set audio source jika disediakan
    const sourceUrl = this.wedding?.audio_url || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3';
    if (!this.audioElement.src || this.audioElement.src !== sourceUrl) {
      this.audioElement.src = sourceUrl;
    }

    this.audioElement.play().then(() => {
      this.isPlayingAudio = true;
      this.updateAudioButtonState();
    }).catch(e => {
      console.warn('Autoplay audio blocked by browser policy:', e);
      this.isPlayingAudio = false;
      this.updateAudioButtonState();
    });
  }

  toggleAudio() {
    if (!this.audioElement) return;

    if (this.isPlayingAudio) {
      this.audioElement.pause();
      this.isPlayingAudio = false;
    } else {
      this.audioElement.play().then(() => {
        this.isPlayingAudio = true;
      }).catch(e => console.warn('Play audio failed:', e));
    }
    this.updateAudioButtonState();
  }

  updateAudioButtonState() {
    const btn = document.getElementById('audio-control');
    if (!btn) return;

    if (this.isPlayingAudio) {
      btn.innerHTML = `<i data-lucide="disc" class="w-5 h-5 animate-spin text-white"></i>`;
      btn.setAttribute('title', 'Hentikan Musik');
    } else {
      btn.innerHTML = `<i data-lucide="volume-x" class="w-5 h-5 text-white"></i>`;
      btn.setAttribute('title', 'Putar Musik');
    }
    if (window.lucide) window.lucide.createIcons();
  }

  /**
   * 3. Kutipan Suci / Ayat Pernikahan
   */
  renderQuotesSection() {
    const textEl = document.getElementById('quote-text');
    const sourceEl = document.getElementById('quote-source');

    const quote = this.wedding.quote_text || 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram di sampingnya.';
    const source = this.wedding.quote_source || '(QS. Ar-Rum: 21)';

    if (textEl) textEl.textContent = `"${quote}"`;
    if (sourceEl) sourceEl.textContent = source;
  }

  /**
   * 4. Profil Mempelai Pria & Wanita
   */
  renderCoupleSection() {
    const w = this.wedding;
    const groom = w.groom_nickname || 'Yogi';
    const bride = w.bride_nickname || 'Rina';

    const coupleTitle = document.getElementById('main-couple-name');
    if (coupleTitle) coupleTitle.textContent = `${groom} & ${bride}`;

    // Mempelai Pria (CPP)
    const groomName = document.getElementById('groom-name');
    const groomParents = document.getElementById('groom-parents');
    const groomImg = document.getElementById('groom-photo-img');
    const groomAvatar = document.getElementById('groom-avatar');
    const groomIgLink = document.getElementById('groom-ig-link');
    const groomIgText = document.getElementById('groom-ig-text');

    if (groomName) groomName.textContent = w.groom_fullname || groom;
    if (groomParents) groomParents.textContent = w.groom_parents || 'Putra dari Keluarga Besar';

    if (w.groom_photo && groomImg && groomAvatar) {
      groomImg.src = w.groom_photo;
      groomImg.classList.remove('hidden');
      groomAvatar.classList.add('hidden');
    } else if (groomAvatar) {
      groomAvatar.textContent = groom.charAt(0);
    }

    if (w.groom_ig && groomIgLink && groomIgText) {
      const cleanIg = w.groom_ig.replace(/^@/, '');
      groomIgLink.href = `https://instagram.com/${cleanIg}`;
      groomIgText.textContent = `@${cleanIg}`;
      groomIgLink.classList.remove('hidden');
    }

    // Mempelai Wanita (CPW)
    const brideName = document.getElementById('bride-name');
    const brideParents = document.getElementById('bride-parents');
    const brideImg = document.getElementById('bride-photo-img');
    const brideAvatar = document.getElementById('bride-avatar');
    const brideIgLink = document.getElementById('bride-ig-link');
    const brideIgText = document.getElementById('bride-ig-text');

    if (brideName) brideName.textContent = w.bride_fullname || bride;
    if (brideParents) brideParents.textContent = w.bride_parents || 'Putri dari Keluarga Besar';

    if (w.bride_photo && brideImg && brideAvatar) {
      brideImg.src = w.bride_photo;
      brideImg.classList.remove('hidden');
      brideAvatar.classList.add('hidden');
    } else if (brideAvatar) {
      brideAvatar.textContent = bride.charAt(0);
    }

    if (w.bride_ig && brideIgLink && brideIgText) {
      const cleanIg = w.bride_ig.replace(/^@/, '');
      brideIgLink.href = `https://instagram.com/${cleanIg}`;
      brideIgText.textContent = `@${cleanIg}`;
      brideIgLink.classList.remove('hidden');
    }
  }

  /**
   * 5. Hitung Mundur Detik demi Detik & Simpan ke Kalender
   */
  renderCountdownSection() {
    const targetDate = this.wedding.akad_date || this.wedding.resepsi_date;
    if (!targetDate) return;

    const daysEl = document.getElementById('countdown-days');
    const hoursEl = document.getElementById('countdown-hours');
    const minsEl = document.getElementById('countdown-minutes');
    const secsEl = document.getElementById('countdown-seconds');

    if (typeof startLiveCountdown === 'function') {
      startLiveCountdown(targetDate, (text, detailed) => {
        if (detailed && daysEl) {
          daysEl.textContent = String(detailed.days).padStart(2, '0');
          hoursEl.textContent = String(detailed.hours).padStart(2, '0');
          minsEl.textContent = String(detailed.minutes).padStart(2, '0');
          secsEl.textContent = String(detailed.seconds).padStart(2, '0');
        }
      }, '08:00:00');
    }

    // Tombol Simpan ke Google Calendar
    const calBtn = document.getElementById('btn-add-to-calendar');
    if (calBtn) {
      calBtn.href = this.generateGoogleCalendarUrl();
    }
  }

  generateGoogleCalendarUrl() {
    const w = this.wedding;
    const groom = w.groom_nickname || 'Pria';
    const bride = w.bride_nickname || 'Wanita';
    const title = encodeURIComponent(`The Wedding of ${groom} & ${bride}`);
    const details = encodeURIComponent(`Pernikahan bahagia ${w.groom_fullname || groom} & ${w.bride_fullname || bride}.\n\nInfo lengkap & konfirmasi kehadiran: ${window.location.href}`);
    const location = encodeURIComponent(`${w.akad_venue || w.resepsi_venue || 'Lokasi Acara'}, ${w.akad_address || w.resepsi_address || ''}`);

    const dateStr = (w.akad_date || '2027-08-14').replace(/-/g, '');
    const start = `${dateStr}T080000`;
    const end = `${dateStr}T140000`;

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
  }

  /**
   * 6. Detail Acara Akad & Resepsi
   */
  renderEventsSection() {
    const w = this.wedding;

    // Akad
    const akadDateEl = document.getElementById('akad-date');
    const akadTimeEl = document.getElementById('akad-time');
    const akadVenueEl = document.getElementById('akad-venue');
    const akadAddressEl = document.getElementById('akad-address');
    const akadMapsBtn = document.getElementById('akad-maps-btn');

    if (akadDateEl) akadDateEl.textContent = formatDateIndo(w.akad_date);
    if (akadTimeEl && w.akad_time) akadTimeEl.textContent = w.akad_time;
    if (akadVenueEl && w.akad_venue) akadVenueEl.textContent = w.akad_venue;
    if (akadAddressEl && w.akad_address) akadAddressEl.textContent = w.akad_address;

    if (w.akad_maps_url && akadMapsBtn) {
      akadMapsBtn.href = w.akad_maps_url;
      akadMapsBtn.classList.remove('hidden');
    }

    // Resepsi
    const resepsiDateEl = document.getElementById('resepsi-date');
    const resepsiTimeEl = document.getElementById('resepsi-time');
    const resepsiVenueEl = document.getElementById('resepsi-venue');
    const resepsiAddressEl = document.getElementById('resepsi-address');
    const resepsiMapsBtn = document.getElementById('resepsi-maps-btn');

    if (resepsiDateEl) resepsiDateEl.textContent = formatDateIndo(w.resepsi_date || w.akad_date);
    if (resepsiTimeEl && w.resepsi_time) resepsiTimeEl.textContent = w.resepsi_time;
    if (resepsiVenueEl && w.resepsi_venue) resepsiVenueEl.textContent = w.resepsi_venue;
    if (resepsiAddressEl && w.resepsi_address) resepsiAddressEl.textContent = w.resepsi_address;

    if (w.resepsi_maps_url && resepsiMapsBtn) {
      resepsiMapsBtn.href = w.resepsi_maps_url;
      resepsiMapsBtn.classList.remove('hidden');
    }
  }

  /**
   * 7. Kisah Cinta & Galeri Prewedding
   */
  renderLoveStorySection() {
    const stories = this.wedding.love_story_json;
    const section = document.getElementById('section-love-story');
    const container = document.getElementById('love-story-container');

    if (!section || !container) return;

    if (!Array.isArray(stories) || stories.length === 0) {
      section.classList.add('hidden');
      return;
    }

    section.classList.remove('hidden');
    container.innerHTML = stories.map(s => `
      <div class="p-4 rounded-2xl bg-[var(--bg-card,#ffffff)] border border-stone-200/80 shadow-2xs space-y-1 relative pl-5 border-l-4 border-l-[var(--accent-color,#b48342)]">
        <span class="text-[10px] font-bold font-mono text-[var(--accent-color,#b48342)] uppercase tracking-wider">${escapeHtml(s.year || '')}</span>
        <h4 class="font-serif text-base font-bold text-slate-900">${escapeHtml(s.title || '')}</h4>
        <p class="text-xs text-slate-600 leading-relaxed">${escapeHtml(s.story || '')}</p>
      </div>
    `).join('');
  }

  renderGallerySection() {
    const photos = this.wedding.gallery_json;
    const section = document.getElementById('section-gallery');
    const container = document.getElementById('gallery-container');

    if (!section || !container) return;

    if (!Array.isArray(photos) || photos.length === 0) {
      section.classList.add('hidden');
      return;
    }

    section.classList.remove('hidden');
    container.innerHTML = photos.map((url, idx) => `
      <div 
        onclick="window.invitationEngine.openLightbox('${url}')" 
        class="rounded-2xl overflow-hidden aspect-square border border-stone-200/80 shadow-2xs group relative bg-stone-100 cursor-pointer"
      >
        <img src="${url}" alt="Foto Prewedding ${idx + 1}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <i data-lucide="maximize-2" class="w-5 h-5 text-white drop-shadow"></i>
        </div>
      </div>
    `).join('');
  }

  initLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (!modal) return;

    modal.addEventListener('click', (e) => {
      if (e.target.id === 'lightbox-modal' || e.target.closest('#lightbox-close')) {
        this.closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeLightbox();
    });
  }

  openLightbox(url) {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    if (!modal || !img) return;

    img.src = url;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) window.lucide.createIcons();
  }

  closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  /**
   * 8. Amplop Digital (Cashless Gift)
   */
  renderEnvelopesSection() {
    const envelopes = this.wedding.envelopes_json;
    const custom = this.wedding.custom_theme_json || {};
    const section = document.getElementById('section-envelopes');
    const container = document.getElementById('envelopes-cards-container');

    if (!section || !container) return;

    const hasEnvelopes = Array.isArray(envelopes) && envelopes.length > 0;
    const hasAddress = Boolean(custom.gift_address && custom.gift_address.trim() !== '');

    if (!hasEnvelopes && !hasAddress) {
      section.classList.add('hidden');
      return;
    }

    section.classList.remove('hidden');

    if (hasEnvelopes) {
      container.innerHTML = envelopes.map(env => `
        <div class="p-4 rounded-2xl bg-[var(--bg-card,#ffffff)] border border-stone-200/80 shadow-2xs flex items-center justify-between gap-3">
          <div>
            <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200/70">
              ${escapeHtml(env.bank || 'Bank')}
            </span>
            <div class="font-mono font-bold text-sm text-slate-900 mt-1">${escapeHtml(env.number || '')}</div>
            <div class="text-[11px] text-slate-500">a.n ${escapeHtml(env.holder || '')}</div>
          </div>
          <button 
            type="button" 
            onclick="window.invitationEngine.copyAccountNumber('${escapeHtml(env.number)}', this)" 
            class="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            <span>Salin</span>
          </button>
        </div>
      `).join('');
    } else {
      container.innerHTML = '';
    }

    // Alamat Kado Fisik
    const physContainer = document.getElementById('physical-gift-container');
    const physText = document.getElementById('physical-gift-text');
    if (hasAddress && physContainer && physText) {
      physText.textContent = custom.gift_address;
      physContainer.classList.remove('hidden');
    }
  }

  copyAccountNumber(num, btn) {
    navigator.clipboard.writeText(num).then(() => {
      showToast('Nomor rekening disalin ke clipboard!', 'success');
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600"></i><span>Berhasil Disalin!</span>`;
      if (window.lucide) window.lucide.createIcons();
      setTimeout(() => {
        btn.innerHTML = originalHtml;
        if (window.lucide) window.lucide.createIcons();
      }, 2500);
    }).catch(() => {
      prompt('Salin nomor rekening manual:', num);
    });
  }

  /**
   * Smart RSVP & Real-Time Wishes Wall
   */
  renderRsvpSection() {
    // Pre-fill nama tamu dari parameter
    const nameInput = document.getElementById('guest_name_input');
    if (nameInput && this.guestName && this.guestName !== 'Tamu Kehormatan') {
      nameInput.value = this.guestName;
    }

    const form = document.getElementById('rsvp-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleRsvpSubmit(e));
    }
  }

  async handleRsvpSubmit(e) {
    e.preventDefault();

    const guestName = document.getElementById('guest_name_input')?.value.trim();
    const status = document.querySelector('input[name="rsvp_status"]:checked')?.value || 'hadir';
    const pax = status === 'hadir' 
      ? (parseInt(document.getElementById('confirmed_pax_input')?.value, 10) || 2) 
      : 0;
    const wish = document.getElementById('wish_message_input')?.value.trim() || null;
    const submitBtn = document.getElementById('btn-rsvp-submit');

    if (!guestName) {
      showToast('Mohon masukkan nama Anda', 'warning');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Mengirim...</span>`;
    if (window.lucide) window.lucide.createIcons();

    try {
      const client = window.supabaseClient;
      if (!client) throw new Error('Supabase client tidak siap');

      const now = new Date().toISOString();

      // 1. SMART MATCHING: Cek apakah tamu sudah ada di database tabel guests
      const { data: existingGuest, error: checkError } = await client
        .from('guests')
        .select('id, name')
        .eq('wedding_id', this.wedding.id)
        .ilike('name', guestName)
        .maybeSingle();

      if (existingGuest?.id) {
        // UPDATE BARIS TAMU YANG SUDAH ADA
        const { error: updateError } = await client
          .from('guests')
          .update({
            rsvp_status: status,
            confirmed_pax: pax,
            wish_message: wish,
            rsvp_submitted_at: now
          })
          .eq('id', existingGuest.id);

        if (updateError) checkRlsError(updateError);
      } else {
        // TAMU BARU (MISAL DARI LINK GRUP): INSERT BARU
        const { error: insertError } = await client
          .from('guests')
          .insert([{
            user_id: this.wedding.user_id,
            wedding_id: this.wedding.id,
            name: guestName,
            group_category: 'Tamu Undangan',
            invitation_type: 'digital',
            estimated_pax: pax || 2,
            confirmed_pax: pax,
            rsvp_status: status,
            wish_message: wish,
            is_link_sent: true,
            rsvp_submitted_at: now
          }]);

        if (insertError) checkRlsError(insertError);
      }

      showToast(`Terima kasih ${guestName}, konfirmasi (${status === 'hadir' ? 'Hadir' : 'Berhalangan'}) dan doa restu berhasil dikirim!`, 'success', 4000);
      submitBtn.innerHTML = `<i data-lucide="check-check" class="w-4 h-4 text-emerald-400"></i><span>Terkirim</span>`;
      if (window.lucide) window.lucide.createIcons();

      // REAL-TIME WISHES WALL: Tambahkan seketika ke urutan teratas tanpa reload halaman
      if (wish) {
        this.prependWishToWall({
          name: guestName,
          rsvp_status: status,
          confirmed_pax: pax,
          wish_message: wish,
          rsvp_submitted_at: now
        });
      }

    } catch (err) {
      console.error('RSVP submission error:', err);
      showToast('Terima kasih, konfirmasi kehadiran Anda telah tercatat!', 'info');
    }
  }

  async loadWishes() {
    const container = document.getElementById('wishes-list');
    const countLabel = document.getElementById('wishes-count-label');
    if (!container) return;

    try {
      const client = window.supabaseClient;
      if (!client || !this.wedding?.id) return;

      const { data: wishes, error } = await client
        .from('guests')
        .select('id, name, wish_message, rsvp_status, confirmed_pax, rsvp_submitted_at, created_at')
        .eq('wedding_id', this.wedding.id)
        .not('wish_message', 'is', null)
        .order('rsvp_submitted_at', { ascending: false })
        .limit(30);

      if (error || !wishes || !wishes.length) {
        if (countLabel) countLabel.textContent = 'Jadilah yang pertama memberikan doa restu!';
        container.innerHTML = `
          <div class="p-6 bg-[var(--bg-card,#ffffff)] rounded-2xl border border-stone-200 text-center text-xs text-stone-400">
            Belum ada ucapan doa. Tuliskan ucapan dan doa restu terbaik Anda di formulir atas.
          </div>
        `;
        return;
      }

      if (countLabel) countLabel.textContent = `${wishes.length} doa restu dari para tamu`;

      container.innerHTML = wishes.map(w => this.renderWishCardHtml(w)).join('');
      if (window.lucide) window.lucide.createIcons();

    } catch (err) {
      console.warn('Load wishes err:', err);
    }
  }

  prependWishToWall(item) {
    const container = document.getElementById('wishes-list');
    if (!container) return;

    // Hapus placeholder kosong jika ada
    const emptyBox = container.querySelector('.text-stone-400');
    if (emptyBox) container.innerHTML = '';

    const newCard = document.createElement('div');
    newCard.innerHTML = this.renderWishCardHtml(item);
    container.prepend(newCard.firstElementChild);

    if (window.lucide) window.lucide.createIcons();
  }

  renderWishCardHtml(w) {
    const initials = (w.name || 'Tamu').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '✨';
    const hadirBadge = w.rsvp_status === 'hadir'
      ? `<span class="text-[9px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">Hadir (${w.confirmed_pax || 2} Pax)</span>`
      : `<span class="text-[9px] px-2 py-0.5 rounded-full font-bold bg-stone-100 text-stone-600">Berhalangan</span>`;

    return `
      <div class="bg-[var(--bg-card,#ffffff)] p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2 animate-in fade-in duration-300">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center justify-center font-serif">
              ${initials}
            </div>
            <span class="font-bold text-xs text-slate-800">${escapeHtml(w.name)}</span>
          </div>
          ${hadirBadge}
        </div>
        <p class="text-xs text-slate-600 italic leading-relaxed pl-1">
          "${escapeHtml(w.wish_message)}"
        </p>
      </div>
    `;
  }

  /**
   * Layar Pemberitahuan (Error, Not Found, Unpublished)
   */
  showNotFoundNotice(msg) {
    this.renderNoticeScreen(
      'alert-circle',
      'Undangan Tidak Ditemukan',
      msg || 'Alamat tautan undangan yang Anda buka tidak terdaftar di sistem PlatformNikah.',
      'Kembali ke Beranda',
      '/'
    );
  }

  showUnpublishedNotice() {
    const groom = this.wedding?.groom_nickname || 'Mempelai';
    const bride = this.wedding?.bride_nickname || 'Mempelai';
    this.renderNoticeScreen(
      'clock',
      'Undangan Sedang Disiapkan',
      `Website undangan pernikahan ${groom} & ${bride} masih dalam proses penyusunan dan belum dipublikasikan secara umum.`,
      'Buka Dashboard Pengantin',
      '/login.html'
    );
  }

  showErrorNotice(msg) {
    this.renderNoticeScreen(
      'shield-alert',
      'Terjadi Gangguan Akses',
      msg,
      'Muat Ulang Halaman',
      window.location.href
    );
  }

  renderNoticeScreen(icon, title, message, btnText, btnUrl) {
    const app = document.getElementById('invitation-app-container');
    if (!app) return;

    app.innerHTML = `
      <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div class="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
          <i data-lucide="${icon}" class="w-8 h-8"></i>
        </div>
        <h2 class="font-serif text-2xl font-bold text-slate-900">${title}</h2>
        <p class="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">${message}</p>
        <a 
          href="${btnUrl}" 
          class="mt-4 px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
        >
          ${btnText}
        </a>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }
}

// Inisialisasi global
window.InvitationEngine = InvitationEngine;
window.invitationEngine = new InvitationEngine();
