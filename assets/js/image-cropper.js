/**
 * image-cropper.js - Interactive HTML5 Canvas Image Cropper, Pan, Zoom, Rotate & Flip Editor
 * Platform Nikah - All-in-One Wedding Planner & Digital Invitation Platform (MenikahBersama)
 */

(function () {
  'use strict';

  // Global Cropper State
  const state = {
    modalEl: null,
    canvasEl: null,
    ctx: null,
    img: null,
    originalFile: null,
    targetType: 'cover', // 'cover' | 'groom' | 'bride' | 'gallery'
    aspectRatio: '3:4', // '1:1' | '3:4' | '4:5' | 'free'
    shapeGuide: 'arch', // 'arch' | 'oval' | 'circle' | 'rect'
    zoom: 1.0,
    minZoom: 0.5,
    maxZoom: 3.5,
    rotation: 0, // degrees
    flipH: false,
    panX: 0,
    panY: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    lastPanX: 0,
    lastPanY: 0,
    touchDistanceStart: 0,
    touchZoomStart: 1.0,
    onComplete: null,
    isProcessing: false
  };

  /**
   * Buat dan inject Modal HTML ke DOM jika belum ada
   */
  function ensureModalInDOM() {
    if (document.getElementById('mb-image-cropper-modal')) {
      state.modalEl = document.getElementById('mb-image-cropper-modal');
      state.canvasEl = document.getElementById('mb-cropper-canvas');
      state.ctx = state.canvasEl.getContext('2d');
      return;
    }

    const modalHtml = `
      <div id="mb-image-cropper-modal" style="z-index: 99999;" class="fixed inset-0 z-[99999] hidden items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
        <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[95vh]">
          
          <!-- Modal Header -->
          <div class="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2v14a2 2 0 0 0 2 2h14"></path>
                  <path d="M18 22V8a2 2 0 0 0-2-2H2"></path>
                </svg>
              </div>
              <div>
                <h3 id="mb-cropper-title" class="font-serif text-base font-bold text-slate-900 leading-tight">Sesuaikan & Potong Foto</h3>
                <p class="text-[11px] text-slate-500">Geser, perbesar, putar, dan sesuaikan sudut foto Anda.</p>
              </div>
            </div>
            <button 
              type="button" 
              id="mb-cropper-btn-close" 
              class="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-stone-200/60 flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <!-- Modal Body (Canvas & Controls) -->
          <div class="p-4 sm:p-5 overflow-y-auto space-y-4">
            
            <!-- Canvas Preview Container -->
            <div class="relative w-full aspect-square max-w-[340px] mx-auto bg-stone-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center select-none touch-none">
              <canvas id="mb-cropper-canvas" width="340" height="340" class="w-full h-full cursor-grab active:cursor-grabbing"></canvas>
              
              <!-- Petunjuk Geser / Pan di HP & Desktop -->
              <div class="absolute bottom-2 left-2 right-2 pointer-events-none flex items-center justify-between text-[10px] text-white/80 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full">
                <span>👆 Drag / geser untuk atur posisi</span>
                <span id="mb-cropper-ratio-badge" class="font-mono uppercase font-bold text-amber-300">3:4 Arch</span>
              </div>
            </div>

            <!-- Rasio Aspek Selector -->
            <div class="flex items-center justify-center gap-1.5 p-1 bg-stone-100 rounded-xl">
              <button type="button" data-ratio="3:4" class="mb-ratio-btn flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors">
                3:4 (Arch/Portret)
              </button>
              <button type="button" data-ratio="1:1" class="mb-ratio-btn flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors">
                1:1 (Persegi/Lingkaran)
              </button>
              <button type="button" data-ratio="4:5" class="mb-ratio-btn flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors">
                4:5 (Standar)
              </button>
            </div>

            <!-- Slider Zoom -->
            <div class="space-y-1.5 bg-stone-50 p-3 rounded-xl border border-stone-200/80">
              <div class="flex items-center justify-between text-xs font-bold text-slate-700">
                <span class="flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                  <span>Zoom Skala Foto</span>
                </span>
                <span id="mb-cropper-zoom-val" class="font-mono text-amber-700">1.0x</span>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" id="mb-btn-zoom-out" class="w-7 h-7 rounded-lg bg-white border border-stone-300 text-slate-600 flex items-center justify-center font-bold hover:bg-stone-100 cursor-pointer">−</button>
                <input 
                  type="range" 
                  id="mb-cropper-zoom-slider" 
                  min="0.5" 
                  max="3.0" 
                  step="0.02" 
                  value="1.0"
                  class="flex-1 accent-amber-600 cursor-pointer"
                >
                <button type="button" id="mb-btn-zoom-in" class="w-7 h-7 rounded-lg bg-white border border-stone-300 text-slate-600 flex items-center justify-center font-bold hover:bg-stone-100 cursor-pointer">+</button>
              </div>
            </div>

            <!-- Tombol Rotasi & Flip -->
            <div class="space-y-2 bg-stone-50 p-3 rounded-xl border border-stone-200/80">
              <div class="flex items-center justify-between text-xs font-bold text-slate-700">
                <span class="flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                  <span>Rotasi & Sudut Kemiringan</span>
                </span>
                <span id="mb-cropper-rotate-val" class="font-mono text-amber-700">0°</span>
              </div>

              <!-- Slider Kemiringan Halus (-45° s/d +45°) -->
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-slate-400 font-mono">-45°</span>
                <input 
                  type="range" 
                  id="mb-cropper-rotate-slider" 
                  min="-45" 
                  max="45" 
                  step="1" 
                  value="0"
                  class="flex-1 accent-amber-600 cursor-pointer"
                >
                <span class="text-[10px] text-slate-400 font-mono">+45°</span>
              </div>

              <!-- Tombol Cepat: -90°, +90°, Flip Horizontal, Reset -->
              <div class="grid grid-cols-4 gap-1.5 pt-1">
                <button 
                  type="button" 
                  id="mb-btn-rot-left" 
                  class="py-1.5 px-2 rounded-lg bg-white border border-stone-300 text-slate-700 text-[11px] font-semibold hover:bg-stone-100 flex items-center justify-center gap-1 cursor-pointer"
                  title="Putar 90 Derajat ke Kiri"
                >
                  <span>↺ -90°</span>
                </button>
                <button 
                  type="button" 
                  id="mb-btn-rot-right" 
                  class="py-1.5 px-2 rounded-lg bg-white border border-stone-300 text-slate-700 text-[11px] font-semibold hover:bg-stone-100 flex items-center justify-center gap-1 cursor-pointer"
                  title="Putar 90 Derajat ke Kanan"
                >
                  <span>+90° ↻</span>
                </button>
                <button 
                  type="button" 
                  id="mb-btn-flip-h" 
                  class="py-1.5 px-2 rounded-lg bg-white border border-stone-300 text-slate-700 text-[11px] font-semibold hover:bg-stone-100 flex items-center justify-center gap-1 cursor-pointer"
                  title="Cerminkan / Balik Kiri-Kanan"
                >
                  <span>⇄ Flip</span>
                </button>
                <button 
                  type="button" 
                  id="mb-btn-reset-transform" 
                  class="py-1.5 px-2 rounded-lg bg-white border border-stone-300 text-slate-700 text-[11px] font-semibold hover:bg-stone-100 flex items-center justify-center gap-1 cursor-pointer"
                  title="Kembalikan Posisi Semula"
                >
                  <span>Reset</span>
                </button>
              </div>
            </div>

          </div>

          <!-- Modal Footer Actions -->
          <div class="px-5 py-3.5 border-t border-stone-100 bg-stone-50 flex flex-wrap items-center justify-between gap-2.5">
            <button 
              type="button" 
              id="mb-cropper-btn-cancel" 
              class="py-2.5 px-4 rounded-xl border border-stone-300 bg-white text-slate-700 text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Batal
            </button>

            <div class="flex items-center gap-2">
              <button 
                type="button" 
                id="mb-cropper-btn-direct" 
                class="py-2.5 px-3.5 rounded-xl border border-stone-300 bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Unggah Langsung Tanpa Crop
              </button>

              <button 
                type="button" 
                id="mb-cropper-btn-apply" 
                class="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span id="mb-cropper-apply-text">Simpan Hasil Crop</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    state.modalEl = document.getElementById('mb-image-cropper-modal');
    state.canvasEl = document.getElementById('mb-cropper-canvas');
    state.ctx = state.canvasEl.getContext('2d');

    attachEventListeners();
  }

  /**
   * Bind event listeners untuk canvas drag, slider, dan tombol
   */
  function attachEventListeners() {
    const { canvasEl } = state;

    // Mouse drag
    canvasEl.addEventListener('mousedown', (e) => {
      state.isDragging = true;
      state.dragStartX = e.clientX;
      state.dragStartY = e.clientY;
      state.lastPanX = state.panX;
      state.lastPanY = state.panY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!state.isDragging) return;
      const dx = e.clientX - state.dragStartX;
      const dy = e.clientY - state.dragStartY;
      state.panX = state.lastPanX + dx;
      state.panY = state.lastPanY + dy;
      renderCanvas();
    });

    window.addEventListener('mouseup', () => {
      state.isDragging = false;
    });

    // Touch events for mobile phones
    canvasEl.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        state.isDragging = true;
        state.dragStartX = e.touches[0].clientX;
        state.dragStartY = e.touches[0].clientY;
        state.lastPanX = state.panX;
        state.lastPanY = state.panY;
      } else if (e.touches.length === 2) {
        // Pinch zoom start
        state.isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        state.touchDistanceStart = Math.hypot(dx, dy);
        state.touchZoomStart = state.zoom;
      }
    }, { passive: false });

    canvasEl.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (state.isDragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - state.dragStartX;
        const dy = e.touches[0].clientY - state.dragStartY;
        state.panX = state.lastPanX + dx;
        state.panY = state.lastPanY + dy;
        renderCanvas();
      } else if (e.touches.length === 2 && state.touchDistanceStart > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const scaleChange = dist / state.touchDistanceStart;
        setZoom(state.touchZoomStart * scaleChange);
      }
    }, { passive: false });

    canvasEl.addEventListener('touchend', () => {
      state.isDragging = false;
      state.touchDistanceStart = 0;
    });

    // Mouse wheel zoom
    canvasEl.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomStep = e.deltaY < 0 ? 0.08 : -0.08;
      setZoom(state.zoom + zoomStep);
    }, { passive: false });

    // Zoom slider & buttons
    const zoomSlider = document.getElementById('mb-cropper-zoom-slider');
    zoomSlider.addEventListener('input', (e) => {
      setZoom(parseFloat(e.target.value));
    });

    document.getElementById('mb-btn-zoom-in').addEventListener('click', () => {
      setZoom(state.zoom + 0.15);
    });
    document.getElementById('mb-btn-zoom-out').addEventListener('click', () => {
      setZoom(state.zoom - 0.15);
    });

    // Rotation slider & buttons
    const rotateSlider = document.getElementById('mb-cropper-rotate-slider');
    rotateSlider.addEventListener('input', (e) => {
      state.rotation = parseInt(e.target.value, 10);
      updateRotationUI();
      renderCanvas();
    });

    document.getElementById('mb-btn-rot-left').addEventListener('click', () => {
      state.rotation = (state.rotation - 90);
      if (state.rotation < -180) state.rotation += 360;
      updateRotationUI();
      renderCanvas();
    });

    document.getElementById('mb-btn-rot-right').addEventListener('click', () => {
      state.rotation = (state.rotation + 90);
      if (state.rotation > 180) state.rotation -= 360;
      updateRotationUI();
      renderCanvas();
    });

    document.getElementById('mb-btn-flip-h').addEventListener('click', () => {
      state.flipH = !state.flipH;
      renderCanvas();
    });

    document.getElementById('mb-btn-reset-transform').addEventListener('click', () => {
      resetTransforms();
    });

    // Aspect ratio selector buttons
    document.querySelectorAll('.mb-ratio-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setAspectRatio(btn.getAttribute('data-ratio'));
      });
    });

    // Close & Cancel
    document.getElementById('mb-cropper-btn-close').addEventListener('click', closeModal);
    document.getElementById('mb-cropper-btn-cancel').addEventListener('click', closeModal);

    // Direct Upload Without Crop
    const directBtn = document.getElementById('mb-cropper-btn-direct');
    if (directBtn) {
      directBtn.addEventListener('click', handleDirectUploadFromModal);
    }

    // Apply & Upload
    document.getElementById('mb-cropper-btn-apply').addEventListener('click', handleApplyAndUpload);
  }

  function setZoom(val) {
    state.zoom = Math.max(state.minZoom, Math.min(state.maxZoom, val));
    document.getElementById('mb-cropper-zoom-slider').value = state.zoom.toFixed(2);
    document.getElementById('mb-cropper-zoom-val').textContent = state.zoom.toFixed(2) + 'x';
    renderCanvas();
  }

  function updateRotationUI() {
    const slider = document.getElementById('mb-cropper-rotate-slider');
    if (state.rotation >= -45 && state.rotation <= 45) {
      slider.value = state.rotation;
    }
    document.getElementById('mb-cropper-rotate-val').textContent = state.rotation + '°';
  }

  function resetTransforms() {
    state.zoom = 1.0;
    state.rotation = 0;
    state.flipH = false;
    state.panX = 0;
    state.panY = 0;
    document.getElementById('mb-cropper-zoom-slider').value = '1.0';
    document.getElementById('mb-cropper-zoom-val').textContent = '1.0x';
    document.getElementById('mb-cropper-rotate-slider').value = '0';
    document.getElementById('mb-cropper-rotate-val').textContent = '0°';
    renderCanvas();
  }

  function setAspectRatio(ratio) {
    state.aspectRatio = ratio;
    document.querySelectorAll('.mb-ratio-btn').forEach(b => {
      if (b.getAttribute('data-ratio') === ratio) {
        b.className = 'mb-ratio-btn flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold bg-white text-amber-800 shadow-xs';
      } else {
        b.className = 'mb-ratio-btn flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors';
      }
    });

    const badge = document.getElementById('mb-cropper-ratio-badge');
    if (badge) {
      badge.textContent = ratio === '3:4' ? '3:4 Arch/Portret' : (ratio === '1:1' ? '1:1 Lingkaran/Kotak' : '4:5 Standar');
    }
    renderCanvas();
  }

  /**
   * Hitung dimensi viewport box crop di dalam canvas preview
   */
  function getCropBoxDimensions() {
    const cw = state.canvasEl.width;
    const ch = state.canvasEl.height;
    const padding = 24;

    let targetW, targetH;
    if (state.aspectRatio === '1:1') {
      const size = Math.min(cw, ch) - (padding * 2);
      targetW = size;
      targetH = size;
    } else if (state.aspectRatio === '3:4') {
      targetH = ch - (padding * 2);
      targetW = Math.round(targetH * (3 / 4));
    } else if (state.aspectRatio === '4:5') {
      targetH = ch - (padding * 2);
      targetW = Math.round(targetH * (4 / 5));
    } else {
      targetW = cw - (padding * 2);
      targetH = ch - (padding * 2);
    }

    const x = Math.round((cw - targetW) / 2);
    const y = Math.round((ch - targetH) / 2);

    return { x, y, width: targetW, height: targetH };
  }

  /**
   * Render Canvas Preview Interaktif
   */
  function renderCanvas() {
    const { ctx, canvasEl, img } = state;
    if (!ctx || !canvasEl) return;

    const cw = canvasEl.width;
    const ch = canvasEl.height;

    // Bersihkan canvas
    ctx.clearRect(0, 0, cw, ch);

    // Latar belakang gelap di luar foto
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, cw, ch);

    if (!img) return;

    const cropBox = getCropBoxDimensions();

    // 1. Gambar foto dengan transformasi Pan, Zoom, Rotasi & Flip
    ctx.save();

    // Transformasi berada di tengah crop box
    const centerX = cropBox.x + (cropBox.width / 2);
    const centerY = cropBox.y + (cropBox.height / 2);

    ctx.translate(centerX + state.panX, centerY + state.panY);
    ctx.rotate((state.rotation * Math.PI) / 180);
    ctx.scale(state.flipH ? -state.zoom : state.zoom, state.zoom);

    // Skala dasar gambar agar pas di dalam cropBox
    const imgRatio = img.width / img.height;
    const boxRatio = cropBox.width / cropBox.height;
    let drawW, drawH;

    if (imgRatio > boxRatio) {
      drawH = cropBox.height;
      drawW = drawH * imgRatio;
    } else {
      drawW = cropBox.width;
      drawH = drawW / imgRatio;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // 2. Gambar Mask Gelap Semi-Transparan di Luar Crop Area
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';

    // Path mask luar
    ctx.beginPath();
    ctx.rect(0, 0, cw, ch);

    // Lubang cropBox (counter-clockwise)
    if (state.aspectRatio === '1:1' && (state.shapeGuide === 'circle' || state.targetType !== 'cover')) {
      // Lingkaran untuk foto profil
      const radius = cropBox.width / 2;
      ctx.arc(cropBox.x + radius, cropBox.y + radius, radius, 0, Math.PI * 2, true);
    } else if (state.aspectRatio === '3:4') {
      // Arch Kubah Melengkung di atas
      const radius = cropBox.width / 2;
      ctx.moveTo(cropBox.x, cropBox.y + cropBox.height);
      ctx.lineTo(cropBox.x + cropBox.width, cropBox.y + cropBox.height);
      ctx.lineTo(cropBox.x + cropBox.width, cropBox.y + radius);
      ctx.arc(cropBox.x + radius, cropBox.y + radius, radius, 0, Math.PI, true);
      ctx.lineTo(cropBox.x, cropBox.y + cropBox.height);
    } else {
      // Persegi / rounded rect
      ctx.rect(cropBox.x + cropBox.width, cropBox.y, -cropBox.width, cropBox.height);
    }

    ctx.fill('evenodd');
    ctx.restore();

    // 3. Gambar Garis Bingkai Emas & Grid Sepertiga (Rule of Thirds)
    ctx.save();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);

    if (state.aspectRatio === '1:1' && (state.shapeGuide === 'circle' || state.targetType !== 'cover')) {
      const radius = cropBox.width / 2;
      ctx.beginPath();
      ctx.arc(cropBox.x + radius, cropBox.y + radius, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (state.aspectRatio === '3:4') {
      const radius = cropBox.width / 2;
      ctx.beginPath();
      ctx.moveTo(cropBox.x, cropBox.y + cropBox.height);
      ctx.lineTo(cropBox.x + cropBox.width, cropBox.y + cropBox.height);
      ctx.lineTo(cropBox.x + cropBox.width, cropBox.y + radius);
      ctx.arc(cropBox.x + radius, cropBox.y + radius, radius, 0, Math.PI, true);
      ctx.lineTo(cropBox.x, cropBox.y + cropBox.height);
      ctx.stroke();
    } else {
      ctx.strokeRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);
    }

    // Grid garis bantu halus
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);

    const stepX = cropBox.width / 3;
    const stepY = cropBox.height / 3;

    ctx.beginPath();
    ctx.moveTo(cropBox.x + stepX, cropBox.y);
    ctx.lineTo(cropBox.x + stepX, cropBox.y + cropBox.height);
    ctx.moveTo(cropBox.x + stepX * 2, cropBox.y);
    ctx.lineTo(cropBox.x + stepX * 2, cropBox.y + cropBox.height);

    ctx.moveTo(cropBox.x, cropBox.y + stepY);
    ctx.lineTo(cropBox.x + cropBox.width, cropBox.y + stepY);
    ctx.moveTo(cropBox.x, cropBox.y + stepY * 2);
    ctx.lineTo(cropBox.x + cropBox.width, cropBox.y + stepY * 2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Potong dan ekspor gambar canvas ke resolusi tinggi lalu kompres WebP & Upload
   */
  async function handleApplyAndUpload() {
    if (state.isProcessing || !state.img) return;
    state.isProcessing = true;

    const applyBtn = document.getElementById('mb-cropper-btn-apply');
    const applyText = document.getElementById('mb-cropper-apply-text');
    const originalText = applyText.textContent;

    applyBtn.disabled = true;
    applyText.textContent = 'Memproses & Mengompresi...';

    try {
      const cropBox = getCropBoxDimensions();

      // Buat High-Resolution Output Canvas
      const outputCanvas = document.createElement('canvas');
      const maxOutputDim = 1000;

      let outW, outH;
      if (state.aspectRatio === '1:1') {
        outW = 900;
        outH = 900;
      } else if (state.aspectRatio === '3:4') {
        outW = 750;
        outH = 1000;
      } else if (state.aspectRatio === '4:5') {
        outW = 800;
        outH = 1000;
      } else {
        outW = 900;
        outH = Math.round(900 * (cropBox.height / cropBox.width));
      }

      outputCanvas.width = outW;
      outputCanvas.height = outH;
      const outCtx = outputCanvas.getContext('2d');

      // Faktor rasio dari preview canvas ke output canvas
      const scaleFactor = outW / cropBox.width;

      // Transformasi di output canvas
      outCtx.save();
      outCtx.translate((outW / 2) + (state.panX * scaleFactor), (outH / 2) + (state.panY * scaleFactor));
      outCtx.rotate((state.rotation * Math.PI) / 180);
      outCtx.scale(state.flipH ? -state.zoom : state.zoom, state.zoom);

      // Ukuran gambar proporsional terhadap cropBox dikalikan scaleFactor
      const imgRatio = state.img.width / state.img.height;
      const boxRatio = cropBox.width / cropBox.height;
      let drawW, drawH;

      if (imgRatio > boxRatio) {
        drawH = cropBox.height * scaleFactor;
        drawW = drawH * imgRatio;
      } else {
        drawW = cropBox.width * scaleFactor;
        drawH = drawW / imgRatio;
      }

      outCtx.drawImage(state.img, -drawW / 2, -drawH / 2, drawW, drawH);
      outCtx.restore();

      // Ekspor canvas ke WebP Blob (dengan fallback JPEG & DataURL)
      let blob = null;
      try {
        blob = await new Promise((resolve) => {
          outputCanvas.toBlob((b) => {
            if (b) resolve(b);
            else {
              outputCanvas.toBlob(resolve, 'image/jpeg', 0.85);
            }
          }, 'image/webp', 0.82);
        });
      } catch (blobErr) {
        console.warn('outputCanvas toBlob error:', blobErr);
      }

      let dataUrl = null;
      try {
        dataUrl = outputCanvas.toDataURL('image/webp', 0.82);
      } catch (dataErr) {
        console.warn('outputCanvas toDataURL error:', dataErr);
      }

      if (!blob && !dataUrl) {
        throw new Error('Gagal menghasilkan file gambar dari kanvas.');
      }

      applyText.textContent = 'Menyimpan ke Storage...';

      // Upload langsung WebP blob ke Supabase Storage bucket 'wedding-media'
      let finalUrl = null;
      let infoText = 'WebP Cropped (Tersimpan)';
      const client = window.supabaseClient;

      let userId = 'guest';
      try {
        if (typeof window.getCurrentUser === 'function') {
          const u = window.getCurrentUser();
          if (u?.id) userId = u.id;
        }
      } catch (e) {}

      const cleanTarget = (state.targetType || 'crop').replace(/[^a-z0-9_-]/gi, '');
      const timestamp = Date.now();
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const filePath = `users/${userId}/${cleanTarget}_${timestamp}_${randomSuffix}.webp`;

      if (blob && client && client.storage) {
        try {
          const { data, error } = await client.storage
            .from('wedding-media')
            .upload(filePath, blob, {
              contentType: 'image/webp',
              upsert: true
            });

          if (!error) {
            const { data: publicData } = client.storage
              .from('wedding-media')
              .getPublicUrl(filePath);

            if (publicData?.publicUrl) {
              finalUrl = publicData.publicUrl;
              infoText = `WebP Cropped: ${Math.round(blob.size / 1024)}KB`;
            }
          } else {
            console.warn('Supabase storage upload error in cropper:', error);
          }
        } catch (uploadErr) {
          console.warn('Cropper storage upload failed, using DataURL fallback:', uploadErr);
        }
      }

      if (!finalUrl) {
        finalUrl = dataUrl;
      }

      // Simpan referensi callback sebelum closeModal membersihkan state
      const callback = state.onComplete;
      closeModal();

      if (typeof callback === 'function') {
        callback({
          success: true,
          url: finalUrl,
          publicUrl: finalUrl,
          dataUrl: dataUrl || finalUrl,
          infoText: infoText,
          targetType: state.targetType
        });
      }

    } catch (err) {
      console.error('Image crop & upload error:', err);
      alert('Gagal memproses foto: ' + (err.message || 'Terjadi kesalahan sistem.'));
    } finally {
      state.isProcessing = false;
      applyBtn.disabled = false;
      applyText.textContent = originalText;
    }
  }

  /**
   * Unggah langsung file foto asli tanpa potong / crop
   */
  async function handleDirectUploadFromModal() {
    if (state.isProcessing) return;
    const directBtn = document.getElementById('mb-cropper-btn-direct');
    const originalText = directBtn ? directBtn.textContent : '';
    if (directBtn) {
      directBtn.disabled = true;
      directBtn.textContent = 'Mengunggah...';
    }
    state.isProcessing = true;

    try {
      let uploadResult = null;
      if (state.originalFile && typeof window.uploadWeddingImage === 'function') {
        uploadResult = await window.uploadWeddingImage(
          state.originalFile, 
          state.targetType, 
          state.targetType === 'cover' ? 1000 : 600, 
          0.82
        );
      } else if (state.img) {
        const simpleCanvas = document.createElement('canvas');
        simpleCanvas.width = Math.min(1000, state.img.width || 800);
        simpleCanvas.height = Math.round((state.img.height || 800) * (simpleCanvas.width / (state.img.width || 800)));
        const sCtx = simpleCanvas.getContext('2d');
        sCtx.drawImage(state.img, 0, 0, simpleCanvas.width, simpleCanvas.height);

        const blob = await new Promise(r => simpleCanvas.toBlob(r, 'image/webp', 0.82));
        if (blob && typeof window.uploadWeddingImage === 'function') {
          const directFile = new File([blob], `${state.targetType}_${Date.now()}.webp`, { type: 'image/webp' });
          uploadResult = await window.uploadWeddingImage(directFile, state.targetType, 1000, 0.82);
        } else {
          const dataUrl = simpleCanvas.toDataURL('image/webp', 0.82);
          uploadResult = {
            success: true,
            url: dataUrl,
            publicUrl: dataUrl,
            dataUrl: dataUrl,
            infoText: 'WebP Langsung'
          };
        }
      }

      // Simpan referensi callback sebelum closeModal membersihkan state
      const callback = state.onComplete;
      closeModal();

      if (uploadResult && typeof callback === 'function') {
        callback({
          success: true,
          url: uploadResult.publicUrl || uploadResult.url || uploadResult.dataUrl,
          dataUrl: uploadResult.dataUrl,
          infoText: uploadResult.infoText,
          targetType: state.targetType
        });
      }
    } catch (err) {
      console.error('Direct upload error:', err);
      alert('Gagal mengunggah foto langsung: ' + (err.message || 'Terjadi kesalahan sistem.'));
    } finally {
      state.isProcessing = false;
      if (directBtn) {
        directBtn.disabled = false;
        directBtn.textContent = originalText;
      }
    }
  }

  function closeModal() {
    if (state.modalEl) {
      state.modalEl.classList.add('hidden');
      state.modalEl.classList.remove('flex');
    }
    state.img = null;
    state.originalFile = null;
    state.onComplete = null;
  }

  /**
   * Buka Modal Cropper Interaktif
   * @param {Object} options
   * @param {File|Blob|string} options.source - File objek atau URL gambar
   * @param {string} options.targetType - 'cover' | 'groom' | 'bride' | 'gallery'
   * @param {string} options.aspectRatio - '1:1' | '3:4' | '4:5'
   * @param {string} options.title - Judul modal kustom
   * @param {Function} options.onComplete - Callback sukses ({ url, infoText })
   */
  function openImageCropper(options = {}) {
    ensureModalInDOM();

    state.targetType = options.targetType || 'cover';
    state.aspectRatio = options.aspectRatio || (state.targetType === 'cover' ? '3:4' : (state.targetType === 'gallery' ? '4:5' : '1:1'));
    state.onComplete = options.onComplete || null;
    state.shapeGuide = state.targetType === 'cover' ? 'arch' : 'circle';

    // Set judul modal
    const titleEl = document.getElementById('mb-cropper-title');
    if (titleEl) {
      if (options.title) {
        titleEl.textContent = options.title;
      } else if (state.targetType === 'cover') {
        titleEl.textContent = 'Sesuaikan Foto Sampul Depan';
      } else if (state.targetType === 'groom') {
        titleEl.textContent = 'Sesuaikan Foto Mempelai Pria (CPP)';
      } else if (state.targetType === 'bride') {
        titleEl.textContent = 'Sesuaikan Foto Mempelai Wanita (CPW)';
      } else {
        titleEl.textContent = 'Sesuaikan & Potong Foto';
      }
    }

    setAspectRatio(state.aspectRatio);
    resetTransforms();

    const source = options.source || options.file;
    if (!source) {
      console.warn('openImageCropper dipanggil tanpa sumber gambar.');
      return;
    }

    const loadImg = (srcUrl) => {
      const img = new Image();
      if (!srcUrl.startsWith('data:') && !srcUrl.startsWith('blob:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        state.img = img;
        if (state.modalEl) {
          state.modalEl.classList.remove('hidden');
          state.modalEl.classList.add('flex');
        }
        renderCanvas();
      };
      img.onerror = (e) => {
        console.warn('Gagal memuat gambar untuk proses crop:', e);
        closeModal();
        if (typeof options.onError === 'function') {
          options.onError(e);
        } else {
          alert('Gagal memuat gambar untuk proses crop.');
        }
      };
      img.src = srcUrl;
    };

    if (source instanceof File || source instanceof Blob) {
      state.originalFile = source;
      const reader = new FileReader();
      reader.onload = (e) => loadImg(e.target.result);
      reader.readAsDataURL(source);
    } else if (typeof source === 'string') {
      if (source.startsWith('http://') || source.startsWith('https://')) {
        // Fetch as blob untuk menjamin canvas tidak tainted dan aman dari cache CORS
        const fetchUrl = source + (source.includes('?') ? '&' : '?') + 'cb=' + Date.now();
        fetch(fetchUrl, { mode: 'cors' })
          .then(res => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.blob();
          })
          .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            loadImg(blobUrl);
          })
          .catch(err => {
            console.warn('Fetch image as blob failed, using direct url:', err);
            loadImg(source);
          });
      } else {
        loadImg(source);
      }
    }
  }

  // Ekspor ke window global
  window.openImageCropper = openImageCropper;
  window.closeImageCropper = closeModal;

})();
