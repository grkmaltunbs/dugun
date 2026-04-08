# 💍 Düğün Davetiyesi Sitesi — Kurulum Kılavuzu

Bu site tamamen **ücretsiz** çalışır. Sunucu kiralamanıza gerek yok, kredi kartı istemez.

**Kullanılan Servisler (hepsi bedava):**
- **GitHub Pages** — Site barındırma (hosting)
- **Firebase Firestore** — RSVP verilerinin saklanması (Spark/ücretsiz plan)
- **Firebase Authentication** — Admin paneli girişi
- **CallMeBot API** — WhatsApp bildirimleri
- **Chart.js** — Admin panelindeki grafikler

---

## 📁 Dosya Yapısı

```
dugun-sitesi/
├── index.html          → Ana davetiye sayfası
├── admin.html          → Admin paneli
├── firestore.rules     → Güvenlik kuralları
├── css/
│   └── style.css       → Site tasarımı
├── js/
│   ├── config.js       → ⚠️ TÜM BİLGİLERİ BURAYA YAZACAKSINIZ
│   ├── main.js         → Ana sayfa mantığı
│   └── admin.js        → Admin paneli mantığı
└── img/
    └── foto1.jpg ...   → Fotoğrafları buraya koyun
```

---

## 1️⃣ Adım — Firebase Projesi Oluşturma

1. https://console.firebase.google.com adresine gidin (Google hesabınızla girin).
2. **"Proje ekle"** tıklayın. Proje adı örn: `dugun-sitesi`. Analytics'i **kapatabilirsiniz** (gerekli değil).
3. Proje açıldıktan sonra sol menüden **Build > Firestore Database** seçin.
4. **"Veritabanı oluştur"** → **"Üretim modunda başlat"** → konum olarak **europe-west3** (Frankfurt) seçin.
5. Oluşturulduktan sonra üstteki **"Rules"** sekmesine gelin. `firestore.rules` dosyasındaki tüm içeriği buraya yapıştırıp **"Yayınla"** butonuna basın.
6. Sol menüden **Build > Authentication** seçin → **"Başlayın"** → **Sign-in method** sekmesi → **"E-posta/Şifre"**'yi etkinleştirin.
7. **Users** sekmesine geçin → **"Kullanıcı ekle"** → kendiniz için bir e-posta + güçlü bir şifre girin. Admin paneline bu bilgilerle gireceksiniz.
8. Sol menüden ⚙️ **Project settings** → **General** sekmesi en alta kaydırın → **"Your apps"** bölümünde **`</>`** (Web) simgesine tıklayın → bir takma ad verin (örn: `site`) → **"Kaydet"**.
9. Size gösterilen `firebaseConfig = { ... }` objesini kopyalayın. (Sonra kullanacaksınız.)

---

## 2️⃣ Adım — Bilgileri Doldurma (`js/config.js`)

`js/config.js` dosyasını bir metin editörüyle açın ve TÜM alanları kendi bilgilerinizle değiştirin:

```js
bride: "Gelin Adı",
groom: "Damat Adı",
brideFamily: "Yılmaz Ailesi",
groomFamily: "Demir Ailesi",
brideParents: "Anne & Baba İsimleri",
groomParents: "Anne & Baba İsimleri",

datetime: "2026-08-15T19:00:00",   // ISO format - geri sayım için
dateText: "15 Ağustos 2026 Cumartesi",
timeText: "19:00",

venueName: "Mekan Adı",
venueAddress: "Adres bilgisi",
mapEmbedUrl: "...",   // Google Maps'ten alınacak (aşağıda anlatılıyor)
mapLink: "https://maps.google.com/?q=Mekan+Adı",
```

### Google Maps konumunu alma
1. https://www.google.com/maps adresine gidin.
2. Mekanı arayın.
3. **Paylaş** → **Haritayı yerleştir** → **HTML'yi kopyala**.
4. Kopyaladığınız iframe kodunun içindeki `src="..."` kısmını alın ve `mapEmbedUrl` alanına yapıştırın.
5. Normal paylaşım linkini de `mapLink` alanına yapıştırın.

### Firebase config'i yapıştırma
1. Adım'da kopyaladığınız `firebaseConfig` objesini `config.js` içindeki `firebase: { ... }` bölümüne yapıştırın.

---

## 3️⃣ Adım — WhatsApp Bildirimleri (CallMeBot)

**Her bildirim almak istediğiniz kişi** için şu adımları uygulayın:

1. O kişinin telefonundan WhatsApp'ı açın.
2. **+34 644 78 33 97** numarasına şu mesajı gönderin (boşluklara dikkat):
   ```
   I allow callmebot to send me messages
   ```
3. Birkaç dakika içinde şöyle bir yanıt gelecek:
   > API Activated for your phone number. Your APIKEY is **1234567**
4. O kişinin numarasını (ülke kodu ile, `+` ve boşluk olmadan) ve apikey'i not edin.
5. `config.js` dosyasındaki `whatsappRecipients` dizisine ekleyin:

```js
whatsappRecipients: [
  { phone: "905551112233", apikey: "1234567" },
  { phone: "905554445566", apikey: "7654321" }
],
```

**Önemli:** Telefon numarası **ülke kodu ile başlamalı**, başında `+` veya boşluk olmamalı. Türkiye için `90` ile başlar.

💡 CallMeBot tamamen ücretsizdir ve sınırsız mesaj göndermenizi sağlar.

---

## 4️⃣ Adım — Fotoğrafları Ekleme

1. `img/` klasörüne düğün/nişan fotoğraflarınızı kopyalayın. (JPG veya PNG)
2. `config.js` dosyasındaki `gallery` dizisinde dosya adlarını güncelleyin:

```js
gallery: [
  "img/nisani.jpg",
  "img/beraber1.jpg",
  "img/beraber2.jpg",
],
```

💡 Fotoğrafları yüklemeden önce [tinypng.com](https://tinypng.com) gibi bir araçla sıkıştırın ki site hızlı açılsın.

---

## 5️⃣ Adım — GitHub Pages'e Yükleme (Ücretsiz Hosting)

1. https://github.com adresine gidin, hesabınız yoksa oluşturun (ücretsiz).
2. Sağ üstteki **+** → **New repository**.
3. Repository adı: `dugun` (veya dilediğiniz bir ad). **Public** seçin. **"Add README"** işaretleyin. **Create**.
4. Oluşan sayfada **"Add file" → "Upload files"**.
5. Tüm proje dosyalarını (index.html, admin.html, css/, js/, img/ klasörleri dahil) sürükle-bırak ile yükleyin.
6. En alta inin → **"Commit changes"**.
7. Yüklendikten sonra üstten **Settings** sekmesine tıklayın.
8. Sol menüden **Pages** seçin.
9. **Source** altında **Branch: main** ve klasör olarak **/ (root)** seçin → **Save**.
10. 1–2 dakika bekleyin. Sayfanın üstünde siteniz şu formatta görünecek:
    ```
    https://kullaniciadiniz.github.io/dugun/
    ```
11. Admin paneline gitmek için: `https://kullaniciadiniz.github.io/dugun/admin.html`

### Kendi alan adınızı kullanmak isterseniz (opsiyonel)
GitHub Pages **bedava olarak** kendi alan adınızı (örn: `aysemehmet.com`) destekler. Settings > Pages > Custom domain alanına alan adınızı yazıp kaydedin, sonra alan adınızın DNS ayarlarında bir CNAME kaydı oluşturun.

---

## 6️⃣ Adım — Admin Paneline Giriş

1. `https://.../admin.html` adresine gidin.
2. Firebase Authentication'da oluşturduğunuz **e-posta ve şifre ile** giriş yapın.
3. Dashboard'da göreceğiniz özellikler:
   - 📊 **İstatistik Kartları:** Toplam cevap, katılacak, katılamayacak, toplam misafir sayısı
   - 📈 **Grafikler:** Katılım pastası, taraf dağılımı, zaman çizelgesi
   - 📋 **Misafir Tablosu:** Arama, filtreleme, sıralama
   - 📥 **CSV İndirme:** Excel'de açabileceğiniz dosya
   - 🗑️ **Silme:** Hatalı kayıtları silebilirsiniz

---

## 🔐 Güvenlik Notları

- **Firebase ayarları** (`config.js` içindeki apiKey vb.) herkese açık olabilir — bu bir sorun değil. Asıl güvenlik **Firestore Rules** ile sağlanıyor (firestore.rules dosyası bunu yapar).
- **Admin paneli** sadece Firebase Authentication'da eklediğiniz hesaplarla açılır.
- **Tek seferlik RSVP** iki aşamada garantileniyor: (1) doküman ID'si telefon numarası olduğu için Firestore aynı ID'ye ikinci kez veri yazmaya izin vermez, (2) tarayıcı `localStorage` ile aynı cihazdan tekrar göndermeyi de engeller.
- **CallMeBot apikey**'leri tarayıcıda görünür olur. Bu sadece "WhatsApp'a mesaj yollama" yetkisi verir, başka bir zarar oluşturmaz.

---

## ❓ Sorun Giderme

| Sorun | Çözüm |
|---|---|
| "Sistem bağlantısı kurulamadı" | `config.js` içindeki `firebase: {...}` alanlarını kontrol edin |
| RSVP gönderilemiyor (permission denied) | Firestore Rules'un doğru yapıştırıldığından emin olun |
| Admin paneline giriş yapamıyorum | Firebase > Authentication > Users'da kullanıcı ekli mi? |
| Fotoğraflar görünmüyor | `img/` klasöründe dosya var mı? `config.js` içindeki dosya adları eşleşiyor mu? |
| WhatsApp mesajı gelmiyor | CallMeBot etkinleştirme mesajı gönderildi mi? Numara başında ülke kodu (90) var mı? |
| Harita görünmüyor | `mapEmbedUrl` iframe'den alınan **src** bağlantısı mı? (Tam iframe kodu değil!) |

---

## 💰 Maliyet

**Sıfır TL.** Firebase Spark planı, GitHub Pages ve CallMeBot küçük ölçekli kullanım için tamamen ücretsizdir. Binlerce RSVP alsa bile hiçbir ücret çıkmayacaktır.

Babana ve eşine en güzel günlerinde sağlık ve mutluluklar! 💐
