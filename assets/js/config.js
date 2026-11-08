/**
 * config.js - Supabase Client, Session Management & Utility Helpers
 * Platform Nikah - All-in-One Wedding Planner & Digital Invitation
 */

// 1. Kredensial Supabase
const SUPABASE_URL = 'https://zjrqjneeyiymazyizlyw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_95FRogiLuqPP_K0kTuKtew_NBH8l6ZM';

// Inisialisasi client Supabase v2
let supabaseClient = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.warn('Supabase JS SDK v2 belum dimuat. Pastikan script cdn supabase-js disertakan sebelum config.js');
}

// 2. Kunci LocalStorage
const STORAGE_KEYS = {
  USER: 'platform_nikah_user',
  TOKEN: 'platform_nikah_token',
  WEDDING: 'platform_nikah_wedding'
};

// 3. Helper Manajemen Session
function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Gagal membaca data user dari localStorage:', e);
    return null;
  }
}

function setCurrentUser(userData) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
  } catch (e) {
    console.error('Gagal menyimpan data user ke localStorage:', e);
  }
}

function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.WEDDING);
}

function logout() {
  clearCurrentUser();
  showToast('Berhasil keluar dari akun', 'info');
  setTimeout(() => {
    window.location.href = '/login.html';
  }, 600);
}

/**
 * Route Guard untuk proteksi halaman
 * @param {string|null} requiredRole - 'admin' | 'user' | null (asal login)
 */
function requireAuth(requiredRole = null) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    if (user.role === 'admin') {
      window.location.href = '/admin/tokens.html';
    } else {
      window.location.href = '/dashboard/index.html';
    }
    return null;
  }

  return user;
}

// 4. Sistem Notifikasi Toast Modern
function ensureToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Tampilkan notifikasi toast
 * @param {string} message - Pesan notifikasi
 * @param {'success'|'error'|'warning'|'info'} type - Tipe toast
 * @param {number} duration - Durasi muncul dalam ms
 */
function showToast(message, type = 'info', duration = 3500) {
  const container = ensureToastContainer();
  const toast = document.createElement('div');

  const icons = {
    success: `<svg class="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    error: `<svg class="w-5 h-5 text-rose-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    warning: `<svg class="w-5 h-5 text-amber-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`,
    info: `<svg class="w-5 h-5 text-sky-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
  };

  const borderColors = {
    success: 'border-emerald-200 bg-white/95 text-slate-800',
    error: 'border-rose-200 bg-white/95 text-slate-800',
    warning: 'border-amber-200 bg-white/95 text-slate-800',
    info: 'border-sky-200 bg-white/95 text-slate-800'
  };

  toast.className = `toast border ${borderColors[type] || borderColors.info}`;
  toast.innerHTML = `
    ${icons[type] || icons.info}
    <div class="flex-1 text-sm font-medium leading-relaxed">${message}</div>
    <button class="ml-2 text-slate-400 hover:text-slate-600 focus:outline-none" onclick="this.parentElement.remove()">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// 5. Utility Formatting
function formatRupiah(number) {
  if (number === null || number === undefined || isNaN(number)) return 'Rp 0';
  return 'Rp ' + Number(number).toLocaleString('id-ID');
}

function formatDateIndo(dateStr) {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

function getDaysUntil(targetDateStr) {
  if (!targetDateStr) return { days: 0, isPast: false, text: '-' };
  const target = new Date(targetDateStr);
  const now = new Date();
  
  // Normalisasi ke jam 00:00:00
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return { days: diffDays, isPast: false, text: `${diffDays} Hari Lagi` };
  } else if (diffDays === 0) {
    return { days: 0, isPast: false, text: 'Hari Ini (D-Day)!' };
  } else {
    return { days: Math.abs(diffDays), isPast: true, text: `${Math.abs(diffDays)} Hari Lalu` };
  }
}

/**
 * Hitung Mundur Real-Time Detik demi Detik (Target Pukul 08:00:00 waktu setempat)
 */
function parseTargetDateTime(targetDateStr, timeStr = '08:00:00') {
  if (!targetDateStr) return null;
  let datePart = targetDateStr;
  if (targetDateStr.includes('T')) {
    datePart = targetDateStr.split('T')[0];
  }
  const cleanTime = (timeStr || '08:00:00').length === 5 ? `${timeStr}:00` : (timeStr || '08:00:00');
  const [hours, minutes, seconds] = cleanTime.split(':').map(Number);
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day, hours || 8, minutes || 0, seconds || 0);
}

function getCountdownDetailed(targetDateStr, timeStr = '08:00:00') {
  const target = parseTargetDateTime(targetDateStr, timeStr);
  if (!target || isNaN(target.getTime())) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, text: '-', fullText: '-' };
  }
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    const absDiff = Math.abs(diff);
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);
    return {
      days,
      hours,
      minutes,
      seconds,
      isPast: true,
      text: `${days} Hari Lalu`,
      fullText: `${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik Lalu`
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
    text: `${days} Hari Lagi`,
    fullText: `${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik`
  };
}

function startLiveCountdown(targetDateStr, callback, timeStr = '08:00:00') {
  const tick = () => {
    const data = getCountdownDetailed(targetDateStr, timeStr);
    if (typeof callback === 'function') callback(data);
  };
  tick();
  return setInterval(tick, 1000);
}

// 6. Helper Handle RLS Error
function checkRlsError(error) {
  if (error && (error.code === '42501' || (error.message && error.message.includes('row-level security')))) {
    showToast(
      'RLS Supabase Masih Aktif! Jalankan "ALTER TABLE [nama_tabel] DISABLE ROW LEVEL SECURITY;" di SQL Editor Supabase agar data tersimpan.',
      'error',
      6000
    );
    return true;
  }
  return false;
}

// Ekspor ke window global
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
window.supabaseClient = supabaseClient;
window.getCurrentUser = getCurrentUser;
window.setCurrentUser = setCurrentUser;
window.clearCurrentUser = clearCurrentUser;
window.requireAuth = requireAuth;
window.logout = logout;
window.showToast = showToast;
window.formatRupiah = formatRupiah;
window.formatDateIndo = formatDateIndo;
window.getDaysUntil = getDaysUntil;
window.getCountdownDetailed = getCountdownDetailed;
window.startLiveCountdown = startLiveCountdown;
window.checkRlsError = checkRlsError;

