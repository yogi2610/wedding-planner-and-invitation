/**
 * webp-compressor.js - Client-Side WebP Image Compressor & Supabase Storage Uploader
 * Platform Nikah - All-in-One Wedding Planner & Digital Invitation Platform
 */

/**
 * Format bytes to human readable string (KB, MB)
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Mengompresi file foto di browser menggunakan HTML5 Canvas menjadi format WebP
 * @param {File} file - File objek dari input file
 * @param {number} maxWidth - Maksimal lebar gambar (default: 1000px, 500px untuk profil)
 * @param {number} quality - Kualitas kompresi WebP (0.0 - 1.0, default: 0.78)
 * @returns {Promise<{blob: Blob, dataUrl: string, originalSize: number, compressedSize: number, originalSizeFormatted: string, compressedSizeFormatted: string, compressionRatio: string, infoText: string}>}
 */
function compressImageToWebP(file, maxWidth = 1000, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const isImage = (file && file.type && file.type.startsWith('image/')) || 
      (file && file.name && /\.(jpe?g|png|webp|gif|bmp|heic|heif|svg)$/i.test(file.name));

    if (!file || !isImage) {
      return reject(new Error('File yang dipilih bukan gambar valid.'));
    }

    const originalSize = file.size;
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Skala proporsional jika melebihi maxWidth
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = Math.round(height * ratio);
        }

        // Buat canvas untuk rendering
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas 2D context tidak didukung di browser ini.'));
        }

        // Gambar ke canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Ekspor ke WebP (dengan fallback JPEG jika WebP tidak didukung)
        let mimeType = 'image/webp';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback to jpeg jika webp toBlob null
              mimeType = 'image/jpeg';
              canvas.toBlob(
                (jpegBlob) => {
                  if (!jpegBlob) return reject(new Error('Gagal mengompresi gambar.'));
                  finishCompression(jpegBlob, canvas.toDataURL(mimeType, quality));
                },
                mimeType,
                quality
              );
              return;
            }
            finishCompression(blob, canvas.toDataURL(mimeType, quality));
          },
          mimeType,
          quality
        );

        function finishCompression(compressedBlob, dataUrl) {
          const compressedSize = compressedBlob.size;
          const ratioNum = originalSize > 0 
            ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
            : 0;
          const compressionRatio = `Hemat ${ratioNum}%`;
          const infoText = `Asli: ${formatBytes(originalSize)} → WebP: ${formatBytes(compressedSize)} (${compressionRatio})`;

          resolve({
            blob: compressedBlob,
            dataUrl: dataUrl,
            originalSize,
            compressedSize,
            originalSizeFormatted: formatBytes(originalSize),
            compressedSizeFormatted: formatBytes(compressedSize),
            compressionRatio,
            infoText
          });
        }
      };

      img.onerror = () => reject(new Error('Gagal membaca gambar dari file.'));
      img.src = event.target.result;
    };

    reader.onerror = () => reject(new Error('Gagal membaca file dari disk.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Mengompresi dan mengunggah foto ke Supabase Storage bucket 'wedding-media'
 * Dilengkapi Fallback Anti-Gagal: jika Storage bucket bermasalah, otomatis gunakan Base64 WebP.
 * @param {File} file - File objek foto
 * @param {string} folderPath - Nama folder/kategori (misal: 'profile', 'gallery')
 * @param {number} maxWidth - Maksimal lebar dimensi gambar
 * @param {number} quality - Kualitas kompresi WebP
 * @returns {Promise<{success: boolean, url: string, publicUrl: string, dataUrl: string, originalSize: number, compressedSize: number, infoText: string, isFallback: boolean}>}
 */
async function uploadWeddingImage(file, folderPath = 'gallery', maxWidth = 1000, quality = 0.78) {
  try {
    // 1. Kompresi gambar di browser
    const compressed = await compressImageToWebP(file, maxWidth, quality);

    // Dapatkan ID user untuk struktur folder
    let userId = 'anon';
    if (typeof getCurrentUser === 'function') {
      const user = getCurrentUser();
      if (user?.id) userId = user.id;
    }

    const cleanFolder = (folderPath || 'media').replace(/[^a-z0-9_-]/gi, '');
    const timestamp = Date.now();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const fileName = `users/${userId}/${cleanFolder}_${timestamp}_${randomSuffix}.webp`;

    // 2. Upload blob ke Supabase Storage bucket 'wedding-media'
    const client = window.supabaseClient;
    if (!client || !client.storage) {
      console.warn('Supabase Storage client tidak tersedia. Menggunakan fallback dataUrl.');
      return {
        success: true,
        url: compressed.dataUrl,
        publicUrl: compressed.dataUrl,
        dataUrl: compressed.dataUrl,
        originalSize: compressed.originalSize,
        compressedSize: compressed.compressedSize,
        infoText: compressed.infoText,
        isFallback: true
      };
    }

    const { data, error } = await client.storage
      .from('wedding-media')
      .upload(fileName, compressed.blob, {
        contentType: 'image/webp',
        upsert: true
      });

    if (error) {
      console.warn('Upload Supabase Storage gagal:', error.message, '- Mengaktifkan fallback dataUrl (Anti-Gagal).');
      return {
        success: true,
        url: compressed.dataUrl,
        publicUrl: compressed.dataUrl,
        dataUrl: compressed.dataUrl,
        originalSize: compressed.originalSize,
        compressedSize: compressed.compressedSize,
        infoText: compressed.infoText + ' (Fallback Local Base64)',
        isFallback: true
      };
    }

    // 3. Dapatkan public URL
    const { data: publicUrlData } = client.storage
      .from('wedding-media')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData?.publicUrl || compressed.dataUrl;

    return {
      success: true,
      url: publicUrl,
      publicUrl: publicUrl,
      dataUrl: compressed.dataUrl,
      originalSize: compressed.originalSize,
      compressedSize: compressed.compressedSize,
      infoText: compressed.infoText,
      isFallback: false
    };

  } catch (err) {
    console.error('Error saat uploadWeddingImage:', err);
    throw err;
  }
}

// Ekspor ke window global
window.compressImageToWebP = compressImageToWebP;
window.uploadWeddingImage = uploadWeddingImage;
window.formatBytes = formatBytes;
