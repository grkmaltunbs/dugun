// ============================================================
//  ANA DAVETİYE SAYFASI
// ============================================================

const CFG = window.WEDDING_CONFIG;

// -------- Firebase başlat --------
let db = null;
try {
  firebase.initializeApp(CFG.firebase);
  db = firebase.firestore();
} catch (e) {
  console.warn("Firebase başlatılamadı:", e);
}

// -------- Telefon numarasını normalize et --------
function normalizePhone(raw) {
  let p = (raw || "").replace(/\D/g, "");
  if (p.startsWith("0")) p = p.substring(1);
  if (p.startsWith("90")) p = p.substring(2);
  return p; // 10 haneli Türkiye formatı: 5XXXXXXXXX
}

// -------- İçeriği doldur --------
function fillContent() {
  const names = `${CFG.bride} & ${CFG.groom}`;
  document.getElementById("heroNames").textContent = names;
  document.getElementById("footerNames").textContent = names;
  document.title = `${names} Düğün Davetiyesi`;

  document.getElementById("heroDate").textContent = `${CFG.dateText} • ${CFG.timeText}`;
  document.getElementById("footerDate").textContent = `${CFG.dateText}`;

  document.getElementById("brideFamily").textContent = CFG.brideFamily;
  document.getElementById("brideParents").textContent = CFG.brideParents;
  document.getElementById("groomFamily").textContent = CFG.groomFamily;
  document.getElementById("groomParents").textContent = CFG.groomParents;

  document.getElementById("welcomeMessage").textContent = CFG.welcomeMessage;
  document.getElementById("storyText").textContent = `"${CFG.story}"`;

  document.getElementById("venueName").textContent = CFG.venueName;
  document.getElementById("venueAddress").textContent = CFG.venueAddress;
  document.getElementById("venueDate").textContent = CFG.dateText;
  document.getElementById("venueTime").textContent = CFG.timeText;
  document.getElementById("mapFrame").src = CFG.mapEmbedUrl;
  document.getElementById("mapLink").href = CFG.mapLink;

  // Galeri
  const grid = document.getElementById("galleryGrid");
  grid.innerHTML = "";
  (CFG.gallery || []).forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Foto";
    img.loading = "lazy";
    img.onerror = () => {
      const ph = document.createElement("div");
      ph.className = "ph";
      ph.textContent = "Fotoğraf yüklenemedi";
      img.replaceWith(ph);
    };
    img.onclick = () => {
      document.getElementById("lightboxImg").src = src;
      document.getElementById("lightbox").classList.remove("hidden");
    };
    grid.appendChild(img);
  });
}

// -------- Geri Sayım --------
function startCountdown() {
  const target = new Date(CFG.datetime).getTime();
  function tick() {
    const now = Date.now();
    let diff = Math.max(0, target - now);
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000); diff -= h * 3600000;
    const m = Math.floor(diff / 60000); diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    document.getElementById("cd-days").textContent = String(d).padStart(2, "0");
    document.getElementById("cd-hours").textContent = String(h).padStart(2, "0");
    document.getElementById("cd-mins").textContent = String(m).padStart(2, "0");
    document.getElementById("cd-secs").textContent = String(s).padStart(2, "0");
  }
  tick();
  setInterval(tick, 1000);
}

// -------- Katılım sayısı göster/gizle --------
function toggleGuestCount() {
  const attending = document.querySelector('input[name="attending"]:checked');
  const row = document.getElementById("guestCountRow");
  row.style.display = attending && attending.value === "evet" ? "block" : "none";
}

// -------- WhatsApp bildirimi (CallMeBot) --------
async function sendWhatsAppNotifications(rsvp) {
  const recipients = CFG.whatsappRecipients || [];
  if (recipients.length === 0) return;

  const statusText = rsvp.attending === "evet"
    ? `✓ KATILACAK (${rsvp.guestCount} kişi)`
    : "✗ KATILAMAYACAK";
  const side = rsvp.side === "gelin" ? "Gelin Tarafı"
             : rsvp.side === "damat" ? "Damat Tarafı" : "Her İkisi";

  const msg =
    `🎉 Yeni RSVP\n\n` +
    `👤 ${rsvp.name}\n` +
    `📞 ${rsvp.phone}\n` +
    `${statusText}\n` +
    `👥 ${side}\n` +
    (rsvp.note ? `💬 ${rsvp.note}\n` : "") +
    `\n${CFG.bride} & ${CFG.groom} Düğün Sitesi`;

  const encoded = encodeURIComponent(msg);

  // CallMeBot paralel çağrılar. Hata olursa sessizce geç.
  await Promise.allSettled(
    recipients.map((r) => {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${r.phone}&text=${encoded}&apikey=${r.apikey}`;
      // no-cors: taryıcıdan 3. parti API'ye istek. Yanıt okuyamayız ama gönderilir.
      return fetch(url, { method: "GET", mode: "no-cors" });
    })
  );
}

// -------- RSVP gönderimi --------
async function handleRsvpSubmit(e) {
  e.preventDefault();
  const msgBox = document.getElementById("rsvpMessage");
  const btn = document.getElementById("rsvpSubmit");
  msgBox.className = "rsvp-msg";
  msgBox.textContent = "";

  if (!db) {
    msgBox.className = "rsvp-msg error";
    msgBox.textContent = "Sistem bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin.";
    return;
  }

  const name = document.getElementById("guestName").value.trim();
  const phone = normalizePhone(document.getElementById("guestPhone").value);
  const attending = document.querySelector('input[name="attending"]:checked')?.value;
  const guestCount = parseInt(document.getElementById("guestCount").value, 10);
  const side = document.getElementById("guestSide").value;
  const note = document.getElementById("guestNote").value.trim();

  if (phone.length < 10) {
    msgBox.className = "rsvp-msg error";
    msgBox.textContent = "Lütfen geçerli bir telefon numarası girin.";
    return;
  }
  if (!attending) {
    msgBox.className = "rsvp-msg error";
    msgBox.textContent = "Lütfen katılım durumunuzu seçin.";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Gönderiliyor...";

  try {
    // Telefon numarasını doküman ID olarak kullan -> benzersizlik garanti
    const docRef = db.collection("rsvps").doc(phone);
    const existing = await docRef.get();

    if (existing.exists) {
      msgBox.className = "rsvp-msg info";
      msgBox.textContent = "Bu telefon numarası ile zaten bir cevap gönderilmiş. Teşekkür ederiz! ♥";
      btn.disabled = true;
      btn.textContent = "Zaten Gönderildi";
      // localStorage'a da işaretle
      localStorage.setItem("rsvp_sent", phone);
      return;
    }

    const rsvp = {
      name,
      phone,
      attending,
      guestCount: attending === "evet" ? guestCount : 0,
      side,
      note,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      userAgent: navigator.userAgent.substring(0, 200)
    };

    await docRef.set(rsvp);

    // WhatsApp bildirimi (fail-safe)
    try { await sendWhatsAppNotifications(rsvp); } catch (err) { console.warn("WA:", err); }

    msgBox.className = "rsvp-msg success";
    msgBox.textContent = attending === "evet"
      ? "Teşekkür ederiz! Sizi aramızda görmek için sabırsızlanıyoruz ♥"
      : "Cevabınız alındı. Bizi düşündüğünüz için teşekkür ederiz ♥";
    document.getElementById("rsvpForm").reset();
    btn.textContent = "Gönderildi ✓";
    localStorage.setItem("rsvp_sent", phone);
  } catch (err) {
    console.error("RSVP hatası:", err);
    msgBox.className = "rsvp-msg error";
    // Hatayı ayrıntılı göster - teşhis için
    let detail = err?.code || err?.message || "bilinmeyen hata";
    if (err?.code === "permission-denied") {
      detail = "İzin reddedildi — Firestore Rules yapıştırılmamış olabilir";
    } else if (err?.code === "unavailable") {
      detail = "Firestore bağlantısı kurulamadı — internet/konfigürasyon";
    } else if (err?.code === "not-found") {
      detail = "Firestore veritabanı bulunamadı — Firebase'de oluşturulmamış";
    }
    msgBox.textContent = "Hata: " + detail;
    btn.disabled = false;
    btn.textContent = "Gönder";
  }
}

// -------- Sayfa yüklenince --------
document.addEventListener("DOMContentLoaded", () => {
  fillContent();
  startCountdown();

  document.querySelectorAll('input[name="attending"]').forEach((r) =>
    r.addEventListener("change", toggleGuestCount)
  );

  document.getElementById("rsvpForm").addEventListener("submit", handleRsvpSubmit);

  // Daha önce gönderilmiş mi? (aynı cihazda)
  const sent = localStorage.getItem("rsvp_sent");
  if (sent) {
    const btn = document.getElementById("rsvpSubmit");
    const msg = document.getElementById("rsvpMessage");
    btn.disabled = true;
    btn.textContent = "Zaten Gönderildi ✓";
    msg.className = "rsvp-msg info";
    msg.textContent = "Bu cihazdan daha önce bir cevap gönderilmiş. Teşekkür ederiz! ♥";
  }
});
