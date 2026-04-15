# 🌐 KURULUM VE YAPILANDIRMA KILAVUZU

## ⚠️ SUNUCU EŞLEŞTİRMESİ

Sistem entegrasyonunun sağlanması için URL yapısı dinamik olarak doğrulanmalıdır:

> URL başındaki **Subdomain**, firmanın **DİA Sunucu Kodu** ile
> 
> <u>BİREBİR AYNI OLMALIDIR</u>.
> 
> Örnek: `https://[SUNUCU-KODU].fiyatgor.panunet.com.tr`

---

## MARKA GÖRSELLERİN GÜNCELLENMESİ

###### Kurumsal kimliğin yansıtılması için aşağıdaki dosyaları değiştirin:

* `favicon.jpeg`  -> Tarayıcı sekme ikonu
  
  > Eğer farklı uzantılı ikon yüklemek isterseniz index.html'den 
  > 
  > `<link rel="icon" href="/favicon.jpeg" />` href kısmındaki uzantıyı değiştirebilirsiniz
* `company.png`  -> Marka logosu
