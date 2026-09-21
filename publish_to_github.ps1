# Teacher OS - GitHub Publisher Script
# ====================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "          منصة TEACHER OS - أداة النشر السحابي على GitHub          " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

$gitCmd = "git"
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    if (Test-Path "..\tools\mingit\cmd\git.exe") {
        $gitCmd = "..\tools\mingit\cmd\git.exe"
    } elseif (Test-Path "tools\mingit\cmd\git.exe") {
        $gitCmd = "tools\mingit\cmd\git.exe"
    } else {
        Write-Host "[!] تعذر العثور على Git. تأكد من تثبيته أولاً." -ForegroundColor Red
        Exit 1
    }
}

Write-Host "[*] التحقق من Git..." -ForegroundColor Gray
& $gitCmd --version

# Init repo if not exists
if (!(Test-Path ".git")) {
    Write-Host "[*] تهيئة مستودع جديد..." -ForegroundColor Green
    & $gitCmd init -b main
} else {
    Write-Host "[OK] مستودع Git جاهز." -ForegroundColor Green
}

# Config git user if needed
& $gitCmd config user.name "TeacherOS Developer"
& $gitCmd config user.email "dev@teacheros.local"

Write-Host "[*] إضافة الملفات وحفظ الـ Commit..." -ForegroundColor Gray
& $gitCmd add .
& $gitCmd commit -m "feat: Teacher OS Complete Platform - SRMS Dashboard, EduSocial & Mobile PWA"

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "                 خطوة ربط مستودع GitHub الخاص بك                     " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "1. افتح موقع GitHub: https://github.com/new"
Write-Host "2. اكتب اسم المستودع: teacher-os"
Write-Host "3. انسخ رابط المستودع الجديد"
Write-Host ""

$repoUrl = Read-Host ">> الصق رابط المستودع هنا (URL) واضغط Enter"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "[!] لم يتم إدخال رابط. تم الإلغاء." -ForegroundColor Yellow
    Exit 0
}

Write-Host "[*] ربط المستودع: $repoUrl" -ForegroundColor Cyan
& $gitCmd remote remove origin 2>$null
& $gitCmd remote add origin $repoUrl
& $gitCmd branch -M main

Write-Host "[*] جاري الرفع إلى GitHub..." -ForegroundColor Green
& $gitCmd push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "====================================================================" -ForegroundColor Green
    Write-Host "   تهانينا! تم رفع المشروع بنجاح ورابطك الدائم جاهز الآن على GitHub!  " -ForegroundColor Yellow
    Write-Host "====================================================================" -ForegroundColor Green
    Write-Host "1. رابط الكود الدائم: $repoUrl" -ForegroundColor White
    Write-Host "2. رابط المعاينة السحابي (GitHub Pages):" -ForegroundColor White
    Write-Host "   من Settings -> Pages -> اختر GitHub Actions وسيكون متاحاً على مدار الساعة!"
    Write-Host "3. تحميل APK أندرويد:" -ForegroundColor White
    Write-Host "   من تبويب Actions ستجد تطبيق APK يتم بناؤه وتنزيله فوراً!"
    Write-Host "====================================================================" -ForegroundColor Green
} else {
    Write-Host "[!] حدث خطأ أثناء الرفع. يرجى التحقق من صحة الرابط والحساب." -ForegroundColor Red
}
