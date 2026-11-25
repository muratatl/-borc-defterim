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


## V8.1 – Takvim ve borç dağılımı
- Takvimde gün seçimi: seçilen tarihin ödemeleri, hatırlatmaları ve günlük ödeme toplamı gösterilir. Kart kesim/son ödeme hatırlatmaları tutarı bilinmediği için günlük ödeme toplamına katılmaz.
- Ana ekranda kalan borç pasta grafiği: kredi kartları, ihtiyaç kredileri, taşıt kredileri, konut kredileri ve diğer borçlar ayrı gösterilir. Kategori altındaki kayıtlar ve bakiyeleri listelenir.
- Düzenli kira aylık ödeme yükünde ve takvimde kalır; toplam borç, borç simülasyonu ve borç geçmişi hesabına dahil edilmez. Birikmiş kira borcu ayrı, tek seferlik borç kaydı olarak girilirse toplam borca dahil edilir.
- Yeni borç kayıtlarında ihtiyaç, taşıt ve konut kredisi kategorileri seçilebilir.
- Service worker önbellek sürümü `v8-shell-6` olarak artırıldı.

## V8.2 – Ödeme durumu ve kategori etkileşimi
- Takvim günleri, ilgili ayda kaydedilmiş borç ödemelerine göre ödendi, kısmen ödendi veya bekliyor şeklinde renklendirilir.
- Seçilen günün borç ödemelerinde durum etiketi ve o ay kaydedilen ödeme tutarı gösterilir. Kart kesim/son ödeme tarihleri ve abonelikler hatırlatma olarak kalır; borç ödeme durumu hesabına karıştırılmaz.
- Borç dağılımı grafiğinde kategori seçildiğinde yalnızca seçilen kategorinin kayıtları ve kalan bakiyeleri ayrıntı panelinde gösterilir.
- Ödeme durumu eşleştirmesi, ödeme kaydının tarihi ve borç kaydının ayı üzerinden yapılır. Aynı ay içindeki birden fazla ödeme toplanır; tutar planlanan ödemeyi karşılıyorsa ödendi, bir kısmını karşılıyorsa kısmen ödendi gösterilir.
