/**
 * cover-thumbnail.js — Renderer Thumbnail Cover Statis Otomatis (Portrait 5:8)
 * Menghasilkan pratinjau statis (tanpa gerakan/animasi) langsung dari pengaturan cover template
 * untuk Katalog Master Admin & Katalog Landing Page.
 */
(function (global) {
  'use strict';

  const DEFAULT_COVER_PHOTO = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80';
  const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const VIRTUAL_W = 360;
  const VIRTUAL_H = 576; // Portrait 5:8
  let thumbCounter = 0;
  let fontsInjected = false;
  let stylesInjected = false;
  let resizeObserver = null;

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function hexToRgbTuple(hex, fallback) {
    const clean = String(hex || '').trim().replace('#', '');
    if (!/^[0-9a-fA-F]{3,8}$/.test(clean)) return fallback || '255, 255, 255';
    let full = clean;
    if (clean.length === 3 || clean.length === 4) {
      full = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
    }
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return fallback || '255, 255, 255';
    return `${r}, ${g}, ${b}`;
  }

  function formatDateIndoStatic(dateStr) {
    if (!dateStr) return 'Minggu, 24 Oktober 2027';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return String(dateStr);
    return `${DAYS_ID[d.getDay()]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
  }

  function ensureGoogleFontsLoaded() {
    if (fontsInjected || typeof document === 'undefined') return;
    fontsInjected = true;
    const existing = document.querySelector('link[href*="Alex+Brush"]');
    if (existing) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@400;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Great+Vibes&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Montserrat:wght@300;400;500;600;700&family=Nunito:wght@300;400;600;700&family=Philosopher:ital,wght@0,400;0,700;1,400&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap';
    document.head.appendChild(link);
  }

  function ensureStylesInjected() {
    if (stylesInjected || typeof document === 'undefined') return;
    stylesInjected = true;
    const style = document.createElement('style');
    style.id = 'mb-cover-thumbnail-styles';
    style.textContent = `
      .mb-cover-thumb-viewport {
        position: relative;
        width: 100%;
        aspect-ratio: 5 / 8;
        overflow: hidden;
        user-select: none;
      }
      .mb-cover-thumb-stage {
        position: absolute;
        top: 0;
        left: 0;
        width: ${VIRTUAL_W}px;
        height: ${VIRTUAL_H}px;
        transform-origin: top left;
        overflow: hidden;
        pointer-events: none;
      }
      .mb-cover-thumb-stage *,
      .mb-cover-thumb-stage *::before,
      .mb-cover-thumb-stage *::after {
        animation: none !important;
        transition: none !important;
      }
      .mb-ct-corner {
        position: absolute;
        width: 82px;
        height: 82px;
        pointer-events: none;
      }
      .mb-ct-corner img, .mb-ct-corner svg {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }
      .mb-ct-logo-wrap {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        margin: 0 auto 4px auto;
      }
      .mb-ct-logo-original {
        max-height: 44px;
        max-width: 120px;
      }
      .mb-ct-logo-original img {
        max-height: 42px;
        width: auto;
        object-fit: contain;
      }
      .mb-ct-logo-circle {
        width: 44px;
        height: 44px;
        border-radius: 9999px;
      }
      .mb-ct-logo-rounded_square {
        width: 44px;
        height: 44px;
        border-radius: 8px;
      }
      .mb-ct-logo-arch {
        width: 40px;
        height: 48px;
        border-radius: 9999px 9999px 6px 6px;
      }
      .mb-ct-logo-octagon {
        width: 44px;
        height: 44px;
        clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
      }
      .mb-ct-logo-diamond {
        width: 44px;
        height: 44px;
        clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
      }
      .mb-ct-logo-wrap:not(.mb-ct-logo-original) img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .mb-ct-frame-grand_arch {
        width: 152px;
        height: 202px;
        border-radius: 9999px 9999px 18px 18px;
      }
      .mb-ct-frame-classic_oval {
        width: 150px;
        height: 200px;
        border-radius: 50%;
      }
      .mb-ct-frame-circle_royal {
        width: 162px;
        height: 162px;
        border-radius: 9999px;
      }
      .mb-ct-frame-octagon_heritage {
        width: 162px;
        height: 162px;
        clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
      }
      .mb-ct-frame-teardrop_botanical {
        width: 152px;
        height: 202px;
        border-radius: 9999px 24px 9999px 24px;
      }
      .mb-ct-frame-rounded_rect {
        width: 152px;
        height: 202px;
        border-radius: 22px;
      }
      .mb-ct-frame-polaroid {
        width: 154px;
        height: 192px;
        border-radius: 10px;
        padding: 8px 8px 24px 8px;
        background-color: #ffffff;
      }
      .mb-ct-frame-none {
        width: 152px;
        height: 202px;
        border-radius: 16px;
      }
    `;
    document.head.appendChild(style);
  }

  function getStaticCornerPreset(slug) {
    const map = {
      'minimalist-sage': `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 C25 15, 50 35, 80 75" stroke="#5A7D66" stroke-width="1.8" stroke-linecap="round"/><path d="M18 12 C12 6, 26 2, 32 8 C36 14, 28 18, 18 12 Z" fill="#6B8E78" opacity="0.9"/><path d="M36 26 C30 18, 44 14, 50 20 C54 26, 46 32, 36 26 Z" fill="#6B8E78" opacity="0.9"/><path d="M56 46 C48 38, 62 34, 68 40 C72 46, 64 52, 56 46 Z" fill="#6B8E78" opacity="0.9"/><path d="M10 20 C4 18, 8 32, 16 28 C22 24, 16 18, 10 20 Z" fill="#8EA89D" opacity="0.85"/><path d="M26 36 C18 32, 24 48, 32 44 C38 40, 32 34, 26 36 Z" fill="#8EA89D" opacity="0.85"/><circle cx="30" cy="14" r="2.8" fill="#FFFFFF"/><circle cx="30" cy="14" r="1.2" fill="#E2B170"/><circle cx="48" cy="32" r="2.8" fill="#FFFFFF"/><circle cx="48" cy="32" r="1.2" fill="#E2B170"/></svg>`,
      'cozy-terracotta': `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 C20 30, 45 45, 80 50" stroke="#C66B4E" stroke-width="1.5"/><path d="M0 0 C30 20, 50 35, 75 70" stroke="#C66B4E" stroke-width="1.5"/><path d="M30 20 Q45 28 65 24 Q50 34 30 20 Z" fill="#E2B170" opacity="0.75"/><path d="M45 40 Q65 48 85 40 Q68 55 45 40 Z" fill="#D98A6C" opacity="0.8"/><circle cx="35" cy="35" r="9" fill="#C66B4E" opacity="0.9"/><circle cx="33" cy="33" r="5" fill="#8C432A"/><circle cx="35" cy="34" r="2.5" fill="#E2B170"/></svg>`,
      'javanese-royal': `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 C30 5, 55 25, 75 55 C65 58, 55 50, 48 40 C40 30, 25 20, 0 20 Z" fill="#D4AF37" opacity="0.85"/><path d="M5 5 Q35 15 50 35 Q30 30 5 5 Z" fill="#F3E5AB" opacity="0.9"/><circle cx="48" cy="40" r="3" fill="#FFFFFF"/><circle cx="48" cy="40" r="1.2" fill="#D4AF37"/><circle cx="62" cy="54" r="3" fill="#FFFFFF"/><circle cx="62" cy="54" r="1.2" fill="#D4AF37"/></svg>`,
      'romantic-blush': `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 25 C2 15, 20 5, 28 15 C34 22, 22 30, 10 25 Z" fill="#5E7D63" opacity="0.85"/><path d="M25 45 C15 38, 30 25, 40 32 C45 40, 35 48, 25 45 Z" fill="#5E7D63" opacity="0.85"/><circle cx="36" cy="32" r="14" fill="#F4B6CD" opacity="0.85"/><circle cx="38" cy="30" r="10" fill="#D9779B" opacity="0.85"/><circle cx="39" cy="28" r="6" fill="#AA4D70"/><circle cx="60" cy="48" r="7" fill="#F4B6CD" opacity="0.9"/></svg>`,
      'luxury-midnight': `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 L40 0 L0 40 Z" fill="#CA8A04" opacity="0.4"/><path d="M5 5 L60 5 L5 60 Z" stroke="#EAB308" stroke-width="1.5" fill="none"/><path d="M12 12 L45 12 L12 45 Z" stroke="#FDE047" stroke-width="1.2" fill="none"/><polygon points="45,20 60,10 65,25 50,30" fill="#FDE047" opacity="0.85"/><polygon points="20,45 10,60 25,65 30,50" fill="#FDE047" opacity="0.85"/></svg>`,
      'modern-monochrome': `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 45 C45 45, 45 0, 45 0" stroke="#18181B" stroke-width="2"/><path d="M0 65 C65 65, 65 0, 65 0" stroke="#71717A" stroke-width="1.2"/><path d="M25 25 C15 35, 30 50, 45 40 C40 30, 30 20, 25 25 Z" fill="#27272A" opacity="0.85"/><circle cx="36" cy="34" r="2.5" fill="#D4AF37"/></svg>`,
      'rustic-woodland': `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0 C25 20, 50 35, 80 60" stroke="#8B5E3C" stroke-width="2" stroke-linecap="round"/><path d="M20 15 L32 8 M20 15 L30 18 M20 15 L22 28" stroke="#4A6B53" stroke-width="1.5"/><path d="M15 35 C5 45, 25 55, 35 45 C40 38, 25 30, 15 35 Z" fill="#2D4A3E" opacity="0.85"/><circle cx="48" cy="46" r="3.2" fill="#FEF08A"/></svg>`,
      'whimsical-fairy': `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 0 Q30 25 25 60 Q20 80 15 95" stroke="#7C3AED" stroke-width="1.5"/><circle cx="26" cy="30" r="4.5" fill="#C4B5FD" opacity="0.9"/><circle cx="24" cy="42" r="4" fill="#A78BFA" opacity="0.9"/><circle cx="21" cy="54" r="3.5" fill="#8B5CF6"/><polygon points="50,15 53,22 60,25 53,28 50,35 47,28 40,25 47,22" fill="#FFFFFF"/></svg>`
    };
    return map[slug] || map['minimalist-sage'];
  }

  function renderCornerOrnamentsHtml(template, cfg, uid) {
    const orn = cfg.ornaments || {};
    const slug = template?.slug || 'minimalist-sage';
    const mode = orn.mode || (orn.corner_master_png ? 'master' : (orn.corner_tl_png ? 'detail' : 'preset'));
    const preset = orn.preset || 'auto';
    const cornerSize = Math.max(56, Math.min(110, Math.round((orn.corner_size || 112) * 0.72)));

    let tl = '', tr = '', bl = '', br = '';

    if (mode === 'master' && orn.corner_master_png) {
      const src = escapeHtml(orn.corner_master_png);
      tl = `<img src="${src}" alt="">`;
      tr = `<img src="${src}" alt="" style="transform:scaleX(-1);">`;
      bl = `<img src="${src}" alt="" style="transform:scaleY(-1);">`;
      br = `<img src="${src}" alt="" style="transform:scale(-1);">`;
    } else if (mode === 'detail') {
      if (orn.corner_tl_png) tl = `<img src="${escapeHtml(orn.corner_tl_png)}" alt="">`;
      if (orn.corner_tr_png) tr = `<img src="${escapeHtml(orn.corner_tr_png)}" alt="">`;
      if (orn.corner_bl_png) bl = `<img src="${escapeHtml(orn.corner_bl_png)}" alt="">`;
      if (orn.corner_br_png) br = `<img src="${escapeHtml(orn.corner_br_png)}" alt="">`;
    } else if (preset !== 'none') {
      const targetSlug = (preset && preset !== 'auto') ? preset : slug;
      const svg = getStaticCornerPreset(targetSlug);
      tl = svg;
      tr = `<div style="width:100%;height:100%;transform:scaleX(-1);">${svg}</div>`;
      bl = `<div style="width:100%;height:100%;transform:scaleY(-1);">${svg}</div>`;
      br = `<div style="width:100%;height:100%;transform:scale(-1);">${svg}</div>`;
    }

    let gununganHtml = '';
    if (slug === 'javanese-royal' && mode === 'preset' && preset !== 'none') {
      const gidL = `mbGoldL_${uid}`;
      const gidR = `mbGoldR_${uid}`;
      gununganHtml = `
        <div style="position:absolute;top:0;bottom:0;left:0;width:42%;display:flex;align-items:center;justify-content:flex-start;opacity:0.35;pointer-events:none;z-index:8;">
          <svg style="width:120px;height:230px;" viewBox="0 0 180 340" fill="none">
            <defs><linearGradient id="${gidL}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FDE047"/><stop offset="50%" stop-color="#D4AF37"/><stop offset="100%" stop-color="#996515"/></linearGradient></defs>
            <path d="M175 10 C165 40, 140 80, 110 110 C80 140, 40 170, 20 210 C5 240, 5 280, 10 320 L175 320 Z" fill="url(#${gidL})"/>
          </svg>
        </div>
        <div style="position:absolute;top:0;bottom:0;right:0;width:42%;display:flex;align-items:center;justify-content:flex-end;opacity:0.35;pointer-events:none;z-index:8;">
          <svg style="width:120px;height:230px;transform:scaleX(-1);" viewBox="0 0 180 340" fill="none">
            <defs><linearGradient id="${gidR}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FDE047"/><stop offset="50%" stop-color="#D4AF37"/><stop offset="100%" stop-color="#996515"/></linearGradient></defs>
            <path d="M175 10 C165 40, 140 80, 110 110 C80 140, 40 170, 20 210 C5 240, 5 280, 10 320 L175 320 Z" fill="url(#${gidR})"/>
          </svg>
        </div>
      `;
    }

    return `
      ${gununganHtml}
      <div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:15;">
        <div class="mb-ct-corner" style="top:-2px;left:-2px;width:${cornerSize}px;height:${cornerSize}px;">${tl}</div>
        <div class="mb-ct-corner" style="top:-2px;right:-2px;width:${cornerSize}px;height:${cornerSize}px;">${tr}</div>
        <div class="mb-ct-corner" style="bottom:-2px;left:-2px;width:${cornerSize}px;height:${cornerSize}px;">${bl}</div>
        <div class="mb-ct-corner" style="bottom:-2px;right:-2px;width:${cornerSize}px;height:${cornerSize}px;">${br}</div>
      </div>
    `;
  }

  function renderLogoHtml(orn, cfg, accent, cardBg) {
    const logoUrl = orn.cover_header_png;
    if (!logoUrl) return '';
    const shape = cfg.cover_logo_shape || 'original';
    const borderStyle = shape === 'original' ? '' : `border:2px solid ${escapeHtml(accent)};background-color:${escapeHtml(cardBg)};`;
    return `
      <div class="mb-ct-logo-wrap mb-ct-logo-${escapeHtml(shape)}" style="${borderStyle}">
        <img src="${escapeHtml(logoUrl)}" alt="Logo">
      </div>
    `;
  }

  function renderFrameOrnamentHtml(cfg, accent) {
    const customPng = cfg.ornaments?.custom_cover_frame_png;
    if (customPng) {
      return `<img src="${escapeHtml(customPng)}" alt="" style="width:100%;height:100%;object-fit:contain;">`;
    }
    const kind = cfg.cover_frame_ornament || 'floral_wreath';
    if (kind === 'floral_wreath') {
      return `
        <svg style="width:100%;height:100%;color:${escapeHtml(accent)};" viewBox="0 0 200 240" fill="none" stroke="currentColor">
          <ellipse cx="100" cy="120" rx="94" ry="114" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.75"/>
          <circle cx="100" cy="8" r="4" fill="currentColor"/>
          <circle cx="100" cy="232" r="4" fill="currentColor"/>
          <circle cx="8" cy="120" r="4" fill="currentColor"/>
          <circle cx="192" cy="120" r="4" fill="currentColor"/>
        </svg>
      `;
    }
    if (kind === 'twin_gold_lines') {
      return `<div style="width:100%;height:100%;border:1px solid ${escapeHtml(accent)};opacity:0.55;border-radius:10px;transform:scale(1.05);"></div>`;
    }
    return '';
  }

  function renderStaticBackgroundHtml(cfg, colors, coverPhoto, coverBgMode, dimLevel) {
    const accent = colors.accent || '#B48342';
    const bgMain = colors.bg || '#FCFBF9';

    // 1. Foto Sampul Fullscreen (Mode photo)
    if (coverBgMode === 'photo' && coverPhoto) {
      const baseAlpha = (dimLevel / 100).toFixed(2);
      const edgeAlpha = Math.min(0.92, (dimLevel + 15) / 100).toFixed(2);
      return `
        <div style="position:absolute;inset:0;z-index:4;overflow:hidden;">
          <img src="${escapeHtml(coverPhoto)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">
          <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,${edgeAlpha}),rgba(0,0,0,${baseAlpha}),rgba(0,0,0,${edgeAlpha}));"></div>
        </div>
      `;
    }

    // 2. Default Tema Admin (theme_default: Video frame statis atau Gambar statis)
    if (coverBgMode === 'theme_default') {
      const themeVideo = cfg.cover_default_bg_video_url || (cfg.bg_type === 'video' ? cfg.bg_video_url : null);
      const themeImage = cfg.cover_default_bg_image_url || (cfg.bg_type === 'image' ? cfg.bg_image_url : null);
      const bgBlur = Number(cfg.bg_blur ?? 0);
      const blurStyle = bgBlur > 0 ? `filter:blur(${bgBlur}px);` : '';

      if (themeVideo) {
        return `
          <div style="position:absolute;inset:0;z-index:3;overflow:hidden;background-color:${escapeHtml(bgMain)};">
            <video src="${escapeHtml(themeVideo)}#t=0.35" muted playsinline preload="metadata" onloadeddata="try{this.pause();}catch(e){}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;${blurStyle}"></video>
            <div style="position:absolute;inset:0;background:rgba(0,0,0,${(dimLevel / 100).toFixed(2)});"></div>
          </div>
        `;
      }
      if (themeImage) {
        return `
          <div style="position:absolute;inset:0;z-index:3;overflow:hidden;background-color:${escapeHtml(bgMain)};">
            <div style="position:absolute;inset:0;background-image:url('${escapeHtml(themeImage)}');background-size:cover;background-position:center;${blurStyle}"></div>
            <div style="position:absolute;inset:0;background:rgba(0,0,0,${(dimLevel / 100).toFixed(2)});"></div>
          </div>
        `;
      }
    }

    // 3. Default Static Ambient Tint (Pengganti Lava Lamp tanpa gerakan)
    return `
      <div style="position:absolute;inset:0;z-index:2;overflow:hidden;background-color:${escapeHtml(bgMain)};">
        <div style="position:absolute;top:-55px;left:-55px;width:210px;height:210px;border-radius:9999px;background:${escapeHtml(accent)};opacity:0.24;filter:blur(48px);"></div>
        <div style="position:absolute;bottom:-60px;right:-50px;width:230px;height:230px;border-radius:9999px;background:${escapeHtml(accent)};opacity:0.20;filter:blur(52px);"></div>
      </div>
    `;
  }

  /**
   * Menghasilkan HTML string untuk kartu thumbnail cover statis (5:8)
   */
  function renderCoverThumbnail(template) {
    ensureGoogleFontsLoaded();
    ensureStylesInjected();

    const uid = ++thumbCounter;
    const t = template || {};
    const c = t.default_colors_json || {};
    const cfg = t.config_json || {};
    const pd = cfg.placeholder_data || {};
    const orn = cfg.ornaments || {};

    const bgMain = c.bg || '#FCFBF9';
    const cardBg = c.card || '#FFFFFF';
    const accent = c.accent || '#B48342';
    const textMain = c.text || '#2C352E';
    const textSec = c.text_secondary || '#4D5850';
    const textTert = c.text_tertiary || '#7D8A80';
    const cardOpacity = cfg.card_opacity !== undefined ? Number(cfg.card_opacity) : 95;
    const cardAlpha = (Math.max(10, Math.min(100, cardOpacity)) / 100).toFixed(2);
    const cardSurface = `rgba(${hexToRgbTuple(cardBg, '255, 255, 255')}, ${cardAlpha})`;
    const bgMainRgb = hexToRgbTuple(bgMain, '252, 251, 249');

    const fontHeading = cfg.typography?.font_heading || "'Cormorant Garamond', Georgia, serif";
    const fontBody = cfg.typography?.font_body || "'Plus Jakarta Sans', system-ui, sans-serif";

    const groomNick = pd.groom_nickname || 'Yoga';
    const brideNick = pd.bride_nickname || 'Anin';
    const coupleName = `${groomNick} & ${brideNick}`;
    const weddingDate = formatDateIndoStatic(pd.akad_date || '2027-10-24');
    const guestName = pd.sample_guest_name || 'Bapak/Ibu Tamu';

    const coverStyle = cfg.cover_style || 'classic';
    const legacyPhotoAsBg = Boolean(cfg.cover_photo_as_bg);
    const coverBgMode = cfg.cover_bg_mode || (legacyPhotoAsBg ? 'photo' : 'lava_lamp');
    const coverPhoto =
      cfg.default_cover_photo ||
      (coverStyle === 'collage_scroll' ? cfg.cover_default_bg_image_url : null) ||
      (Array.isArray(pd.gallery_json) && pd.gallery_json[0]) ||
      DEFAULT_COVER_PHOTO;

    const frameShape = cfg.cover_frame_shape || 'grand_arch';
    const coverShowFrame = (cfg.cover_show_frame !== undefined ? Boolean(cfg.cover_show_frame) : (frameShape !== 'none')) && frameShape !== 'none';
    const dimLevel = cfg.cover_bg_dim !== undefined ? Math.max(0, Math.min(85, Number(cfg.cover_bg_dim) || 0)) : 45;
    const coverPhotoAsBg = (coverBgMode === 'photo' && coverStyle !== 'collage_scroll');

    const logoHtml = renderLogoHtml(orn, cfg, accent, cardBg);
    const cornersHtml = renderCornerOrnamentsHtml(t, cfg, uid);

    let bodyHtml = '';

    if (coverStyle === 'collage_scroll') {
      // Variant B: 1 Foto Transisi Blur -> Solid (Tanpa Card Nama Tamu)
      bodyHtml = `
        <div style="position:relative;width:100%;height:100%;background-color:${escapeHtml(bgMain)};display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;">
          <div style="position:absolute;left:0;right:0;top:0;height:72%;overflow:hidden;z-index:1;">
            <img src="${escapeHtml(coverPhoto)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">
            <div style="position:absolute;left:0;right:0;bottom:0;height:130px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);-webkit-mask-image:linear-gradient(to bottom,rgba(0,0,0,0) 0%,rgba(0,0,0,0.8) 55%,rgba(0,0,0,1) 100%);mask-image:linear-gradient(to bottom,rgba(0,0,0,0) 0%,rgba(0,0,0,0.8) 55%,rgba(0,0,0,1) 100%);z-index:2;"></div>
            <div style="position:absolute;left:0;right:0;bottom:0;height:165px;background:linear-gradient(to bottom,rgba(${bgMainRgb},0) 0%,rgba(${bgMainRgb},0.45) 38%,rgba(${bgMainRgb},0.92) 72%,rgba(${bgMainRgb},1) 100%);z-index:3;"></div>
          </div>
          ${cornersHtml}
          <div style="position:relative;z-index:20;padding:24px 20px 22px 20px;text-align:center;">
            ${logoHtml}
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:0.28em;color:${escapeHtml(accent)};font-weight:700;margin-bottom:3px;">The Wedding Of</div>
            <div style="font-family:${escapeHtml(fontHeading)};font-size:30px;font-weight:700;color:${escapeHtml(textMain)};line-height:1.12;margin-bottom:3px;">${escapeHtml(coupleName)}</div>
            <div style="font-family:${escapeHtml(fontHeading)};font-style:italic;font-size:11px;color:${escapeHtml(textSec)};margin-bottom:10px;">${escapeHtml(weddingDate)}</div>
            <div style="padding-top:6px;">
              <div style="font-size:9px;text-transform:uppercase;letter-spacing:0.18em;color:${escapeHtml(textTert)};margin-bottom:2px;">Kepada Yth. Bapak/Ibu/Saudara/i:</div>
              <div style="font-family:${escapeHtml(fontHeading)};font-size:19px;font-weight:700;color:${escapeHtml(textMain)};line-height:1.2;">${escapeHtml(guestName)}</div>
            </div>
            <div style="margin-top:10px;display:inline-flex;flex-direction:column;align-items:center;gap:2px;color:${escapeHtml(accent)};">
              <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;">Scroll ke bawah</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m7 6 5 5 5-5"/><path d="m7 13 5 5 5-5"/></svg>
            </div>
          </div>
        </div>
      `;
    } else if (coverStyle === 'envelope') {
      // Variant C: Amplop Surat Mewah Statis
      const bgHtml = renderStaticBackgroundHtml(cfg, c, coverPhoto, coverBgMode, dimLevel);
      bodyHtml = `
        <div style="position:relative;width:100%;height:100%;background-color:${escapeHtml(bgMain)};overflow:hidden;">
          ${bgHtml}
          ${cornersHtml}
          <!-- Flap Atas -->
          <div style="position:absolute;left:0;right:0;top:0;height:56%;z-index:20;filter:drop-shadow(0 8px 16px rgba(0,0,0,0.18));">
            <div style="width:100%;height:100%;clip-path:polygon(0 0,100% 0,100% 62%,50% 100%,0 62%);background-color:${escapeHtml(cardBg)};padding:34px 18px 0 18px;text-align:center;">
              ${logoHtml}
              <div style="font-size:9px;text-transform:uppercase;letter-spacing:0.28em;color:${escapeHtml(accent)};font-weight:700;margin-bottom:4px;">Wedding Invitation</div>
              <div style="font-family:${escapeHtml(fontHeading)};font-size:28px;font-weight:700;color:${escapeHtml(textMain)};line-height:1.15;margin-bottom:3px;">${escapeHtml(coupleName)}</div>
              <div style="font-family:${escapeHtml(fontHeading)};font-style:italic;font-size:11px;color:${escapeHtml(textSec)};">${escapeHtml(weddingDate)}</div>
            </div>
            <svg style="position:absolute;inset:0;width:100%;height:100%;" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline points="0,62 50,100 100,62" fill="none" stroke="${escapeHtml(accent)}" stroke-width="0.9" stroke-opacity="0.7"/>
            </svg>
          </div>
          <!-- Pocket Bawah -->
          <div style="position:absolute;left:0;right:0;bottom:0;height:55%;z-index:10;filter:drop-shadow(0 -6px 14px rgba(0,0,0,0.14));">
            <div style="width:100%;height:100%;clip-path:polygon(0 28%,50% 0,100% 28%,100% 100%,0 100%);background-color:${escapeHtml(bgMain)};display:flex;flex-direction:column;justify-content:flex-end;padding:0 22px 24px 22px;text-align:center;">
              <div style="border:1px solid ${escapeHtml(accent)};border-radius:8px;padding:10px 12px;background-color:${cardSurface};margin-bottom:10px;">
                <div style="font-size:9px;text-transform:uppercase;letter-spacing:0.14em;color:${escapeHtml(textTert)};margin-bottom:2px;">Kepada Yth. Bapak/Ibu/Saudara/i:</div>
                <div style="font-family:${escapeHtml(fontHeading)};font-size:17px;font-weight:700;color:${escapeHtml(textMain)};">${escapeHtml(guestName)}</div>
                <div style="font-size:9px;color:${escapeHtml(textSec)};margin-top:2px;">Ketuk segel surat untuk membuka undangan</div>
              </div>
              <div style="font-size:8px;text-transform:uppercase;letter-spacing:0.12em;color:${escapeHtml(textTert)};">MenikahBersama Digital Invitation</div>
            </div>
          </div>
          <!-- Center Wax Seal -->
          <div style="position:absolute;top:52%;left:50%;transform:translate(-50%,-50%);z-index:30;width:62px;height:62px;border-radius:9999px;background:linear-gradient(135deg,${escapeHtml(accent)} 0%,#d4af37 50%,${escapeHtml(accent)} 100%);border:2px solid rgba(255,255,255,0.7);box-shadow:0 10px 22px rgba(0,0,0,0.28);display:flex;align-items:center;justify-content:center;color:#ffffff;font-family:${escapeHtml(fontHeading)};font-weight:700;font-size:13px;">
            Buka
          </div>
        </div>
      `;
    } else {
      // Variant A: Classic
      const bgHtml = renderStaticBackgroundHtml(cfg, c, coverPhoto, coverBgMode, dimLevel);
      const topLabelColor = coverPhotoAsBg ? '#FFFFFF' : accent;
      const topTitleColor = coverPhotoAsBg ? '#FFFFFF' : textMain;
      const topDateColor = coverPhotoAsBg ? 'rgba(255,255,255,0.88)' : textSec;
      const topShadow = coverPhotoAsBg ? 'text-shadow:0 2px 12px rgba(0,0,0,0.7);' : '';
      const bottomBrandColor = coverPhotoAsBg ? 'rgba(255,255,255,0.82)' : textTert;

      let centerFrameHtml = '<div style="flex:1;"></div>';
      if (coverShowFrame && coverPhoto) {
        const frameOrnHtml = renderFrameOrnamentHtml(cfg, accent);
        const polaroidInner = frameShape === 'polaroid'
          ? `padding:8px 8px 24px 8px;background:#fff;border:1px solid #e7e5e4;`
          : `border:3px solid ${escapeHtml(accent)};background:#1c1917;`;
        centerFrameHtml = `
          <div style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:6px 0;">
            <div style="position:relative;display:flex;align-items:center;justify-content:center;">
              <div style="position:absolute;inset:-10px;z-index:20;display:flex;align-items:center;justify-content:center;">${frameOrnHtml}</div>
              <div class="mb-ct-frame-${escapeHtml(frameShape)}" style="overflow:hidden;position:relative;box-shadow:0 14px 30px -6px rgba(0,0,0,0.38);${polaroidInner}">
                <img src="${escapeHtml(coverPhoto)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;${frameShape === 'polaroid' ? 'border-radius:4px;' : ''}">
              </div>
            </div>
          </div>
        `;
      }

      bodyHtml = `
        <div style="position:relative;width:100%;height:100%;background-color:${escapeHtml(bgMain)};overflow:hidden;">
          ${bgHtml}
          ${cornersHtml}
          <div style="position:relative;z-index:20;width:100%;height:100%;display:flex;flex-direction:column;justify-content:space-between;padding:18px 18px 14px 18px;text-align:center;">
            <div style="padding-top:6px;">
              ${logoHtml}
              <div style="font-size:9px;text-transform:uppercase;letter-spacing:0.28em;color:${escapeHtml(topLabelColor)};font-weight:700;${topShadow}">The Wedding Of</div>
              <div style="font-family:${escapeHtml(fontHeading)};font-size:29px;font-weight:700;color:${escapeHtml(topTitleColor)};line-height:1.12;margin-top:2px;${topShadow}">${escapeHtml(coupleName)}</div>
              <div style="font-family:${escapeHtml(fontHeading)};font-style:italic;font-size:11px;color:${escapeHtml(topDateColor)};margin-top:2px;${topShadow}">${escapeHtml(weddingDate)}</div>
            </div>
            ${centerFrameHtml}
            <div style="width:100%;">
              <div style="background-color:${cardSurface};color:${escapeHtml(textMain)};border:1px solid rgba(0,0,0,0.08);border-radius:10px;padding:12px 14px;box-shadow:0 12px 26px -6px rgba(0,0,0,0.16);backdrop-filter:blur(8px);">
                <div style="font-size:9.5px;color:${escapeHtml(textSec)};">Kepada Yth. Bapak/Ibu/Saudara/i:</div>
                <div style="font-family:${escapeHtml(fontHeading)};font-size:18px;font-weight:700;color:${escapeHtml(textMain)};margin-top:2px;line-height:1.18;">${escapeHtml(guestName)}</div>
                <div style="font-size:9px;color:${escapeHtml(textSec)};margin-top:3px;line-height:1.35;">Tanpa mengurangi rasa hormat, kami mengundang Anda hadir memberikan doa restu.</div>
                <div style="margin-top:8px;padding:8px 12px;border-radius:8px;background:linear-gradient(135deg,#e2b170 0%,#d4af37 50%,#b48342 100%);color:#0f172a;font-size:10.5px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 6px 14px rgba(180,131,66,0.28);">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></svg>
                  <span>Buka Undangan</span>
                </div>
              </div>
              <div style="margin-top:6px;font-size:8px;letter-spacing:0.1em;text-transform:uppercase;color:${escapeHtml(bottomBrandColor)};font-family:monospace;">MenikahBersama Digital Invitation</div>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="mb-cover-thumb-viewport" data-mb-cover-thumb="1" style="background-color:${escapeHtml(bgMain)};font-family:${escapeHtml(fontBody)};">
        <div class="mb-cover-thumb-stage">
          ${bodyHtml}
        </div>
      </div>
    `;
  }

  function fitSingleViewport(vp) {
    const stage = vp.firstElementChild;
    if (!stage) return;
    const w = vp.clientWidth;
    if (!w) return;
    const scale = w / VIRTUAL_W;
    stage.style.transform = `scale(${scale.toFixed(4)})`;
  }

  function fitCoverThumbnails(root) {
    ensureStylesInjected();
    const scope = root || document;
    const viewports = scope.querySelectorAll('.mb-cover-thumb-viewport');
    if (!viewports.length) return;

    if (!resizeObserver && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          fitSingleViewport(entry.target);
        }
      });
    }

    viewports.forEach((vp) => {
      fitSingleViewport(vp);
      if (resizeObserver && !vp.dataset.mbObserved) {
        vp.dataset.mbObserved = '1';
        resizeObserver.observe(vp);
      }
    });
  }

  global.renderStaticCoverThumbnail = renderCoverThumbnail;
  global.fitCoverThumbnails = fitCoverThumbnails;

  if (typeof global.addEventListener === 'function') {
    global.addEventListener('resize', () => fitCoverThumbnails(document));
  }
})(window);
