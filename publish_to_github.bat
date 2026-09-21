@echo off
chcp 65001 >nul
title Teacher OS - النشر المباشر على GitHub
color 0B

echo ====================================================================
echo          منصة TEACHER OS - أداة النشر السحابي على GitHub
echo ====================================================================
echo.

:: البحث عن Git (في النظام أو النسخة المحمولة المدمجة)
set GIT_CMD=git
where git >nul 2>nul
if %errorlevel% neq 0 (
    if exist "..\tools\mingit\cmd\git.exe" (
        set "GIT_CMD=..\tools\mingit\cmd\git.exe"
    ) else if exist "tools\mingit\cmd\git.exe" (
        set "GIT_CMD=tools\mingit\cmd\git.exe"
    ) else (
        echo [!] خطأ: لم يتم العثور على Git. جاري استخدام مسار الأدوات...
    )
)

echo [*] التحقق من Git...
%GIT_CMD% --version
if %errorlevel% neq 0 (
    echo [X] تعذر تشغيل Git. يرجى التأكد من تثبيته أو تحميل النسخة المحمولة.
    pause
    exit /b 1
)

echo.
echo [*] فحص مستودع Git المحلي...
if not exist ".git" (
    echo [*] تهيئة مستودع جديد (git init)...
    %GIT_CMD% init -b main
) else (
    echo [OK] مستودع Git موجود بالفعل.
)

:: إعداد هوية الكوميت الافتراضية إذا لم تكن موجودة
%GIT_CMD% config user.name >nul 2>nul
if %errorlevel% neq 0 (
    %GIT_CMD% config user.name "TeacherOS Developer"
    %GIT_CMD% config user.email "dev@teacheros.local"
)

echo.
echo [*] تجهيز الملفات وتحديث التغييرات...
%GIT_CMD% add .

echo [*] حفظ النسخة البرمجية (Commit)...
%GIT_CMD% commit -m "feat: Teacher OS Complete Platform - SRMS Dashboard, EduSocial & Mobile PWA" >nul 2>nul
echo [OK] تم تجهيز وحفظ كافة ملفات المنصة بنجاح.

echo.
echo ====================================================================
echo                 خطوة ربط مستودع GitHub الخاص بك
echo ====================================================================
echo.
echo 1. افتح موقع GitHub في متصفحك: https://github.com/new
echo 2. أنشئ مستودعاً جديداً باسم: teacher-os
echo 3. انسخ رابط المستودع (مثال: https://github.com/your-username/teacher-os.git)
echo.
set /p REPO_URL=">> الصق رابط المستودع هنا واضغط Enter: "

if "%REPO_URL%"=="" (
    echo [!] لم يتم إدخال رابط. تم إلغاء عملية الرفع.
    pause
    exit /b 0
)

echo.
echo [*] ربط المستودع بالرابط: %REPO_URL%
%GIT_CMD% remote remove origin >nul 2>nul
%GIT_CMD% remote add origin %REPO_URL%
%GIT_CMD% branch -M main

echo [*] جاري رفع الكود إلى GitHub...
echo (ملاحظة: إذا طلب منك GitHub تسجيل الدخول، سجّل الدخول بحسابك في النافذة المنبثقة)
echo.
%GIT_CMD% push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ====================================================================
    echo   مبروك! تم رفع المشروع بنجاح ورابطك الدائم جاهز الآن على GitHub!
    echo ====================================================================
    echo.
    echo 1. رابط المستودع الدائم: %REPO_URL%
    echo 2. لتفعيل رابط المعاينة السحابي المجاني (GitHub Pages):
    echo    - ادخل على إعدادات المستودع (Settings) ➔ Pages
    echo    - من Build and deployment اختر: GitHub Actions
    echo    - سيتم نشر الرابط فورياً ليكون: https://^<username^>.github.io/teacher-os/
    echo.
    echo 3. لتحميل تطبيق أندرويد (APK):
    echo    - ادخل على تبويب Actions في المستودع وستجد الـ APK تم بناؤه تلقائياً!
    echo ====================================================================
) else (
    echo.
    echo [!] حدث خطأ أثناء الرفع. تأكد من صحة الرابط وصلاحيات حسابك على GitHub.
)

echo.
pause
