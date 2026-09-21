import 'package:flutter/material.dart';

/// TEACHER OS — "My Intelligent Day" (يومي الذكي) Screen
class MyIntelligentDayScreen extends StatelessWidget {
  const MyIntelligentDayScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('⚡ يومي الذكي — Teacher OS'),
      ),
      body: Directionality(
        textDirection: TextDirection.rtl,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Priority Card
              _buildTopPriorityCard(context),
              const SizedBox(height: 16),

              // Quick Actions Bar
              _buildQuickActionsRow(context),
              const SizedBox(height: 16),

              // Cognitive Gap Radar Card
              _buildCognitiveGapCard(context),
              const SizedBox(height: 16),

              // Schedule Timeline
              _buildScheduleTimeline(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopPriorityCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF3C7),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFDE68A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEE2E2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'أولوية تعليمية عاجلة ⚡',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFDC2626),
                  ),
                ),
              ),
              const Text(
                'نسبة الثقة: 92%',
                style: TextStyle(fontSize: 12, color: Color(0xFF92400E)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            'مراجعة توصيل المقاومات على التوازي مع مجموعة السبت',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Color(0xFF78350F),
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'السبب: أظهر 66% من طلاب المجموعة خطأ متكرراً في حساب تجزئة التيار الكهربي.',
            style: TextStyle(fontSize: 13, color: Color(0xFF92400E)),
          ),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('تم تفعيل خطة المراجعة العلاجية بنجاح 🚀')),
              );
            },
            icon: const Icon(Icons.flash_on, size: 18),
            label: const Text('تفعيل خطة المراجعة السريعة (1-Click)'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF059669),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionsRow(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _buildActionBtn(context, Icons.quiz_outlined, 'إنشاء اختبار AI'),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildActionBtn(context, Icons.check_circle_outline, 'تسجيل الحضور'),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildActionBtn(context, Icons.mic_none, 'أمر صوتي'),
        ),
      ],
    );
  }

  Widget _buildActionBtn(BuildContext context, IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          Icon(icon, color: const Color(0xFF4338CA), size: 24),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  Widget _buildCognitiveGapCard(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '🔍 رادار الفجوات المفاهيمية',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            _buildGapItem('توصيل المقاومات وتجزئة التيار', 'نسبة الخطأ: 66%', Colors.red),
            _buildGapItem('قانون أوم والمقاومة النوعية', 'نسبة الإتقان: 94%', Colors.green),
          ],
        ),
      ),
    );
  }

  Widget _buildGapItem(String title, String subtitle, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
          Text(subtitle, style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildScheduleTimeline(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              '📅 جدول حصص اليوم',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text('• 4:00 م — مجموعة النخبة (فيزياء ثانوية عامة) — سنتر الأوائل'),
            SizedBox(height: 4),
            Text('• 6:30 م — مجموعة المتفوقين (فيزياء) — أونلاين'),
          ],
        ),
      ),
    );
  }
}
