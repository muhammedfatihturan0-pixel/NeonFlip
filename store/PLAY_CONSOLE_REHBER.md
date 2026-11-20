# ZYPHOR (com.mfturan.neonflip) — Play Console rehberi

## Dosyalar
| Ne | Nerede |
|---|---|
| İmzalı paket | `D:\Projeler\NeonFlip\store\ZYPHOR-1.1-vc10.aab` (sürüm kodu 10, adı 1.1, targetSdk 36) |
| Yükleme anahtarı | `D:\Android\anahtar\` (jks + ANAHTAR_BILGI.txt + upload_certificate.pem) — USB/Drive'a yedekle |
| Simge 512x512 | `D:\Projeler\NeonFlip\public\pwa-512x512.png` |
| Özellik grafiği 1024x500 | `store\ozellik_grafigi_1024x500.png` |
| Ekran görüntüleri 1080x1920 | `store\ekran_1_menu.png`, `ekran_2_oyun.png`, `ekran_3_liderlik.png`, `ekran_4_magaza.png` |
| Gizlilik politikası URL | https://zyphor-4379d.web.app/privacy.html |

## 0. Önce: yükleme anahtarını sıfırla
Test ve yayınla → Uygulama bütünlüğü → Uygulama imzalama → **Yükleme anahtarını sıfırlamayı iste** → sebep "kaybettim" → `upload_certificate.pem` yükle.
Onay gelince (1-2 gün) .aab'yi **Kapalı test** kanalına yeni sürüm olarak yükle. Sürüm notu örneği:
> Canlı küresel liderlik tablosu, yeni uygulama simgesi ve açılış ekranı, performans iyileştirmeleri.

Sonraki her güncellemede `android/app/build.gradle` içindeki `versionCode` 1 artırılır (11, 12, …).

## 1. Gizlilik politikası
Politika → Uygulama içeriği → Gizlilik politikası → `https://zyphor-4379d.web.app/privacy.html`

## 2. Reklamlar
Uygulama içeriği → Reklamlar → **Evet, uygulamam reklam içeriyor**
(Şu anki sürümde reklamlar simülasyon; AdMob eklendiğinde de cevap aynı kalır. Şimdiden "Evet" demek sorun değil.)

## 3. Hedef kitle ve içerik
- Hedef yaş grubu: **13-15, 16-17, 18+** seç. **13 yaş altını seçme** — seçersen "Aileler" politikası ve AdMob için ek kurallar devreye girer.
- "Uygulama çocukların ilgisini çekebilir mi?" → Hayır (neon refleks oyunu, çocuk karakter yok).

## 4. Veri güvenliği (Data safety)
**Veri toplanıyor mu?** Evet. **Aktarımda şifreleniyor mu?** Evet. **Kullanıcı silme isteyebilir mi?** Evet (politikadaki e-posta yolu).
**Hesap oluşturma:** Yok (anonim giriş, kullanıcı hesap açmıyor).

| Veri türü | Toplanıyor | Paylaşılıyor | Zorunlu mu | Amaç |
|---|---|---|---|---|
| Uygulama etkinliği → **Diğer kullanıcı içerikleri** (takma ad, skor) | Evet | Hayır* | İsteğe bağlı | Uygulama işlevselliği |
| Kimlikler → **Kullanıcı kimlikleri** (Firebase anonim kimlik) | Evet | Hayır | Zorunlu | Uygulama işlevselliği, Dolandırıcılık önleme |
| Cihaz veya diğer kimlikler → **Reklam kimliği** | AdMob eklenince Evet | AdMob eklenince Evet (Google) | Zorunlu | Reklam veya pazarlama, Analiz, Dolandırıcılık önleme |

\* Liderlik tablosunda diğer oyunculara görünmesi "paylaşım" sayılmaz; Firebase "hizmet sağlayıcı" olduğu için de paylaşım değildir.
**Şu anki sürümde AdMob yok** → reklam kimliği satırını AdMob'lu sürümü yüklerken ekle (ve o sürümde manifest'e AD_ID izni gelir).

## 5. İçerik derecelendirmesi (IARC)
Kategori: **Oyun**. Cevaplar:
- Şiddet: Hayır (soyut engeller, karakter ölmüyor/kan yok) · Korku: Hayır · Cinsellik/çıplaklık: Hayır · Küfür: Hayır
- Uyuşturucu/alkol/tütün: Hayır · Kumar: **Hayır** — *"Günlük çark" gerçek para ile oynanmıyor, ödül yalnızca oyun içi altın; "simüle kumar" sorusuna Hayır.*
- Kullanıcılar etkileşim kurabilir mi / içerik paylaşabilir mi? **Evet** — oyuncu takma adları liderlik tablosunda herkese görünüyor. (Sohbet yok.)
- Konum paylaşımı: Hayır · Dijital ürün satın alma: şu an Hayır (gerçek para ile satın alma yok)
Beklenen sonuç: PEGI 3 / Herkes, "Kullanıcılar etkileşim kurar" notuyla.

## 6. Mağaza sayfası
- Uygulama adı: **ZYPHOR - Gravity Shift**
- Kısa açıklama (≤80): `Tek dokunuşla yerçekimini çevir, engellerden kaç, dünya sıralamasında zirveye çık!`
- Tam açıklama örneği:
```
ZYPHOR'da tek bir dokunuşla yerçekimini tersine çevir! Tavanla zemin arasında gidip gelerek dikenlerden, lazerlerden ve dönen testerelerden kaç.

⚡ Tek dokunuş, saf refleks: öğrenmesi 5 saniye, ustalaşması haftalar.
🏆 Canlı küresel liderlik tablosu: takma adını seç, dünyadaki oyuncularla yarış.
🔥 Kombo serileri ve "kıl payı" bonusları ile skoru katla.
🛡️ Güçlendirmeler: kalkan, mıknatıs, ağır çekim.
🎨 Açılabilen neon görünümler ve günlük şans çarkı.
📅 Günlük görevlerle her gün yeni hedefler.

Skorumu geçebilir misin?
```
- Kategori: Oyun → **Arcade** · Etiketler: Hiper gündelik, Refleks, Tek dokunuş

## 7. Kapalı test → Üretim
12 test kullanıcısı 14 gün kesintisiz kayıtlı kalmalı. Yeni .aab yüklemek bu süreyi sıfırlamaz.
