# مدير موسوعة البُردة — النسخة المحسّنة

## التشغيل
افتح `index.html` مباشرة في Chrome أو Edge. المدير محلي ولا يحتاج Node أو PHP أو قاعدة بيانات.

## البيانات
- تحفظ محليًا في LocalStorage.
- استخدم `استيراد JSON` و`نسخة احتياطية JSON` لنقل المشروع بين الأجهزة.

## التحسينات الجديدة
- نظام Undo/Redo (Ctrl+Z / Ctrl+Y)
- سجل إصدارات (آخر 10 نسخ)
- إشعارات Toast بدلاً من alert
- ضغط الصور تلقائيًا عند التصدير
- Lazy loading للصور
- تحسينات SEO (Schema.org, sitemap, robots.txt)
- تحسينات إمكانية الوصول
- ملفات أمان (_headers)

## التصدير
من «التصدير / النسخ الاحتياطي» اختر «تصدير الموقع Static». سيُحمّل ملف `burdah-static-site.zip`.
بعد فك الضغط ارفع محتويات المجلد إلى Cloudflare Pages أو أي استضافة Static.

## Supabase / Online
- شغّل `supabase/schema.sql` داخل Supabase SQL Editor.
- انسخ `supabase/config.example.js` إلى `supabase/config.js` وضع `url` و`anonKey` العامة فقط.
- لا تضع `service_role` key داخل Browser.

## النشر على Cloudflare Pages
1. ارفع مجلد `modular` إلى GitHub
2. في Cloudflare Pages، أنشئ مشروع جديد واربطه بالمستودع
3. اجعل مجلد البناء هو `modular`
4. لا تحتاج إعدادات بناء (Build command فارغ، Build output فارغ)
5. انشر!

## ملفات المشروع
- `index.html` — نقطة الدخول (يعرض app.html)
- `app.html` — واجهة المدير
- `assets/css/manager.css` — تنسيق المدير
- `assets/css/site.css` — تنسيق الموقع العام
- `assets/js/manager.js` — منطق المدير
- `assets/js/libs.min.js` — مكتبات خارجية (JSZip)
- `supabase/` — إعدادات Supabase
- `pages/` — صفحات إعادة توجيه
- `_headers` — ترويسات Cloudflare
- `robots.txt` — ملف robots
- `sitemap.xml` — خريطة الموقع
- `404.html` — صفحة الخطأ
