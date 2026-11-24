# Borç Defterim V8

## GitHub Pages dağıtımı

Yayımlanacak kök dizine şu öğeleri yerleştirin:

- `index.html`
- `manifest.json`
- `sw.js`
- `icons/` klasörünün tamamı (maskable ikon dâhil)

Dosyaların aynı dizin yapısında bulunması gerekir. GitHub Pages HTTPS üzerinden yayımlandığında uygulama PWA olarak kurulabilir.

### Telefona kurulum

- **iPhone:** Safari'de yayımlanan adresi açın → Paylaş → Ana Ekrana Ekle.
- **Android:** Destekleyen tarayıcıda menü → Uygulamayı yükle / Ana ekrana ekle.

İlk kurulum ve ilk çevrimdışı önbellek için internet bağlantısı gerekir.

## Çevrimdışı kullanım sınırı

Service worker uygulama giriş sayfasını, manifesti ve ikonları önbelleğe alır. Daha önce çevrimiçi açılmış uygulama kabuğu internet yokken yeniden açılabilir. Cihazdaki yerel kayıtlar uygulama içinde kullanılmaya devam eder. Supabase oturum açma, hesap doğrulama ve bulut yedekleme internet gerektirir. Ekstre PDF/Excel analizinde kullanılan PDF.js, SheetJS ve OCR (Tesseract.js + tur/eng dil verisi) ilk kullanımda CDN üzerinden indirilir; dosyanın metin çıkarma/OCR işlemi tarayıcıda cihaz üzerinde yapılır ve ekstre dosyası analiz için uygulama sunucusuna yüklenmez. Bu nedenle OCR kütüphaneleri ve dil verisi daha önce indirilmemişse ilk analiz internet bağlantısı ister; tam çevrimdışı ilk kullanım bu sürümde garanti edilmez.

Uygulama kabuğu veya çevrimdışı kaynaklar değiştiğinde `sw.js` içindeki `CACHE_NAME` sürümünü artırın. Yeni service worker kurulduğunda eski Borç Defterim V8 önbelleği otomatik temizlenir; diğer sitelerin önbelleklerine dokunulmaz.

## Güvenlik notu

Ön yüz içinde yalnızca Supabase publishable/anon anahtarı bulunmalıdır. Service role anahtarı istemci dosyalarına eklenmemelidir. `borc_defterim_backup` tablosunda kullanıcı kimliği bazlı RLS politikaları ayrıca etkinleştirilmeli ve gerçek iki ayrı hesapla doğrulanmalıdır. Bu paketleme aşamasındaki testler gerçek Supabase RLS doğrulamasının yerine geçmez.

## V8.1 arayüz geliştirmeleri
- Takvimde gün seçimi: seçilen tarihin borç/abonelik ödemeleri ve günlük toplamı gösterilir. Kredi kartı son ödeme ve ekstre kesim hatırlatmaları ayrıca listelenir; tutarsız biçimde sıfır tutarlı hatırlatmalar ödeme toplamına eklenmez.
- Ana ekranda kalan borç pasta grafiği: kredi kartları, ihtiyaç kredileri, taşıt/araç kredileri, konut kredileri ve diğer borçlar ayrı gösterilir. Kategori altındaki kayıtlar ve bakiyeleri de listelenir.
- Yeni borç kaydında ihtiyaç, taşıt ve konut kredisi türleri seçilebilir. Eski “Kredi” kayıtları ihtiyaç/kredi finansmanı grubunda değerlendirilir.
