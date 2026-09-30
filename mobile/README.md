# Aplikasi Android SI-PINTAR SD

Pembungkus Android (Capacitor) yang membuka situs SI-PINTAR di dalam aplikasi, dengan izin kamera untuk scan.
Karena isinya situs yang sama, **database dan data selalu sama** dengan versi web; tidak ada data yang disimpan di HP.

## Membuat APK/AAB
GitHub → tab **Actions** → **Build Android** → **Run workflow**. Bawaannya satu aplikasi untuk semua sekolah (package `com.sipintarsd.app`, membuka halaman pilih sekolah). Kosongkan slug untuk itu; isi slug hanya kalau mau app khusus satu sekolah. Naikkan nomor versi tiap upload ke Play Store.
Hasil ada di **Artifacts**: `apk-debug-*` (install langsung di HP) dan `aab-release-*` (Play Store, hanya bila keystore diisi).

## Rilis Play Store (sekali setup)
1. Buat keystore: `keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias sipintar -keyalg RSA -keysize 2048 -validity 10000`
2. Simpan file dan passwordnya di tempat aman (hilang = tidak bisa update aplikasi).
3. GitHub → Settings → Secrets and variables → Actions, isi: `ANDROID_KEYSTORE_BASE64` (hasil `base64 -w0 release.keystore`), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.
4. Jalankan workflow lagi, unduh `.aab`, unggah ke Play Console.
