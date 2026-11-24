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

Service worker uygulama giriş sayfasını, manifesti ve ikonları önbelleğe alır. Daha önce çevrimiçi açılmış uygulama kabuğu internet yokken yeniden açılabilir. Cihazdaki yerel kayıtlar uygulama içinde kullanılmaya devam eder. Supabase oturum açma, hesap doğrulama, bulut yedekleme ve ekstre dosyaları için kullanılan harici analiz kütüphaneleri internet gerektirir.

Uygulama kabuğu veya çevrimdışı kaynaklar değiştiğinde `sw.js` içindeki `CACHE_NAME` sürümünü artırın. Yeni service worker kurulduğunda eski Borç Defterim V8 önbelleği otomatik temizlenir; diğer sitelerin önbelleklerine dokunulmaz.

## Güvenlik notu

Ön yüz içinde yalnızca Supabase publishable/anon anahtarı bulunmalıdır. Service role anahtarı istemci dosyalarına eklenmemelidir. `borc_defterim_backup` tablosunda kullanıcı kimliği bazlı RLS politikaları ayrıca etkinleştirilmeli ve gerçek iki ayrı hesapla doğrulanmalıdır. Bu paketleme aşamasındaki testler gerçek Supabase RLS doğrulamasının yerine geçmez.
