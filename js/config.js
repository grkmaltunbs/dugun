// ============================================================
//  DÜĞÜN SİTESİ AYARLARI
//  Bu dosyadaki değerleri kendi bilgilerinizle değiştirin.
// ============================================================

window.WEDDING_CONFIG = {
  // ---- Gelin & Damat ----
  bride: "Gülten",
  groom: "Bülent",
  brideFamily: "Yılmaz Ailesi",      // Gelin tarafı aile adı
  groomFamily: "Altunbaş Ailesi",       // Damat tarafı aile adı
  brideParents: "Ali & Fatma Yılmaz",
  groomParents: "Ali & Döndü Altunbaş",

  // ---- Tarih & Saat ----
  // ISO formatında (YYYY-MM-DDTHH:MM:SS) - geri sayım için kullanılır
  datetime: "2026-08-15T19:00:00",
  dateText: "15 Ağustos 2026 Cumartesi",
  timeText: "19:00",

  // ---- Mekan ----
  venueName: "Gül Bahçesi Düğün Salonu",
  venueAddress: "Atatürk Cad. No:123, Beşiktaş / İstanbul",
  // Google Maps embed bağlantısı (Paylaş > Haritayı yerleştir > iframe src'sini buraya koy)
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d12243.006832315108!2d32.84414060959235!3d39.902191007083886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1str!2str!4v1775679659142!5m2!1str!2str",
  // Normal Google Maps linki (butondan açılır)
  mapLink: "https://maps.app.goo.gl/ccK9zH7gRVhYEHxe8",

  // ---- Hikâye / Mesaj ----
  welcomeMessage: "En özel günümüzde sizleri de aramızda görmekten mutluluk duyarız.",
  story: "Bir bakışla başlayan, bir ömre uzanan yolculuğumuzun en güzel gününde yanımızda olmanızı dileriz.",

  // ---- Fotoğraf Galerisi ----
  // img/ klasörüne fotoğrafları atın ve buraya dosya adlarını yazın
  gallery: [
    "img/foto1.jpg",
    "img/foto2.jpg",
  ],

  // ---- WhatsApp Bildirim ----
  // CallMeBot API anahtarları (ücretsiz).
  // Kurulum: Her numaranın telefonundan +34 644 78 33 97 numarasına WhatsApp'tan
  // şu mesajı gönderin:  I allow callmebot to send me messages
  // Birkaç dakika sonra size apikey ile birlikte bir onay mesajı gelir.
  // Bu numarayı ve apikey'i aşağıya ekleyin.
  whatsappRecipients: [
     { phone: "905399653673", apikey: "3678070" },
    // { phone: "905554445566", apikey: "7654321" }
  ],

  // ---- Firebase Ayarları ----
  // https://console.firebase.google.com adresinden proje oluşturduktan sonra
  // Project Settings > General > Your apps > Web app > Config bölümünden alın.
  firebase: {
  apiKey: "AIzaSyAOSJMf5qWWOAJuuBJuZNRy__8iEhr7qbg",
  authDomain: "dugun-sitesi.firebaseapp.com",
  projectId: "dugun-sitesi",
  storageBucket: "dugun-sitesi.firebasestorage.app",
  messagingSenderId: "949237681694",
  appId: "1:949237681694:web:cc3b53913a855ed3f2e80f"
  }
};
