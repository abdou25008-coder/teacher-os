import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'core/theme/app_theme.dart';
import 'features/teacher_home/presentation/my_intelligent_day_screen.dart';

void main() {
  runApp(const TeacherOSApp());
}

/// TEACHER OS — Main Flutter Application
class TeacherOSApp extends StatelessWidget {
  const TeacherOSApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Teacher OS — نظام تشغيل المعلم الذكي',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      locale: const Locale('ar', 'EG'),
      supportedLocales: const [
        Locale('ar', 'EG'),
        Locale('en', 'US'),
      ],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      home: const MyIntelligentDayScreen(),
    );
  }
}
