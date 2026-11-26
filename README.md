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

## V8.3 – Kart bakiyesi ve ekstre harcama analizi
- Kartın toplam kullanılan bakiyesi, ekstre dönem borcundan ayrıldı. Ekstrede limit ve kullanılabilir limit birlikte okunursa toplam kullanım `limit - kullanılabilir limit` olarak kaydedilir; dönem borcu ayrı `statementAmount` alanında tutulur.
- Kart ödemesi toplam kullanılan bakiyeyi ödeme tutarı kadar azaltır ve bilinen kullanılabilir limiti aynı tutarda artırır. Örneğin 221.000 TL limit, 57.000 TL kullanılabilir limit ve 61.000 TL ödeme sonrası 118.000 TL kullanılabilir limit / 103.000 TL kullanım hesaplanır.
- Kart düzenleme ekranında kullanılabilir limit bankadaki güncel değere göre düzeltilebilir; kartın geçmiş ödeme kayıtları korunur.
- Ekstre sınıfları sağlık, market, akaryakıt, online alışveriş, giyim, yeme-içme, ulaşım, ev/faturalar, elektronik, abonelik, eğlence, kişisel bakım, eğitim, seyahat, nakit çekim ve diğer olarak genişletildi.
- Tanınmayan işlemler “Diğer” olarak işaretlenir ve kullanıcı kategori seçimini aktarım öncesinde düzeltebilir. Kullanıcının seçtiği işyeri-kategori eşleşmesi cihazdaki yerel ayarlarda öğrenilmiş kural olarak saklanır.
- Harcamalar ekranına aylık kategori pasta grafiği ve kategoriye dokununca ilgili işlemleri gösteren ayrıntı paneli eklendi.
- Ekstre dosyaları cihazda işlenir; sunucuya yüklenmez. Service worker önbellek sürümü `v8-shell-7` olarak artırıldı.


## V8.4 – Kredi kartı ödeme hesabı düzeltmesi (aday sürüm)
- Kartın kullanılan bakiyesi, limit ve kullanılabilir limit birlikte mevcutsa `limit - kullanılabilir limit` üzerinden esas alınır. Böylece ekstre dönem borcu (`statementAmount`) ile toplam kart kullanımı birbirine karıştırılmaz.
- Kart ödemesinde girilen gerçek tutar kaydedilir; ödeme tutarı ekstre borcunu aşsa bile toplam kullanılan bakiyeden düşülür. Kullanılabilir limit, ödeme tutarı kadar artırılır ve kart limitiyle sınırlandırılır.
- Ekstre borcu ayrı azaltılır; toplam kullanım sıfırlanmadıkça kartın tamamı ödenmiş sayılmaz. Kullanılan bakiyeyi aşan ödeme ayrıca `creditBalance` olarak izlenir.
- Son kart ödemesi düzenlenirken ödeme farkı kullanılabilir limite uygulanır; ödeme silinirken önceki kullanılabilir limit geri yüklenir.
- Kart hesabı için 30 ek aritmetik kontrol dahil toplam 42 test çalıştırıldı. Bunlar yardımcı fonksiyon ve mevcut özellik testleridir; gerçek iPhone arayüz testi, canlı banka ekstresiyle uçtan uca test ve Supabase senkronizasyon testi değildir.
- Service worker önbellek sürümü `v8-shell-8` olarak artırıldı.


## V8.5 – Aylık özet hesaplama motoru

- Aylık ödeme planı artık ayın ilk gününden son gününe kadar hesaplanır; ayın başında vadesi geçmiş ama henüz ödenmemiş düzenli/tek seferlik borçlar ay toplamından kaybolmaz.
- Borç planı, o ay kaydedilmiş borç ödemeleriyle karşılaştırılır. Kalan tutar sıfırın altına düşmez; fazla ödeme ayrıca gerçekleşen ödeme olarak korunur.
- Abonelikler aylık ortalama maliyet olarak değil, gerçek ödeme döngülerine göre seçilen ayın vadesine dahil edilir. Gelir-bütçe görünümünde ise aktif aboneliklerin aylık karşılığı ayrı gösterilmeye devam eder.
- Kart ekstresi dönem anahtarı olmayan eski kayıtlar tahmini olarak bir aya bağlanmaz; dönem eşleştirme uyarısı gösterilir. Ekstre Laboratuvarı kesim tarihini okuyabildiğinde `statementPeriodKey`, dönem tutarı ve son ödeme tarihi karta yazılır; kart ödemeleri de bu dönem anahtarını taşır.
- Hesaplamalar cihazda, yerel veriler üzerinden yapılır. Eski yedeklerde yeni alanların bulunması zorunlu değildir.
- Otomatik test paketi V8.5 aylık özet senaryolarıyla genişletildi; toplam 51/51 kontrol başarılı. Bu testler birim/aritmetik kontrolleridir; gerçek iPhone tarayıcısı, Supabase canlı senkronizasyonu ve takvim uygulaması testi değildir.
- Service worker önbellek sürümü `v8-shell-9` olarak artırıldı.
