/**
 * TEACHER OS — Teacher Visual Branding & Theme Customization Controller
 */

const db = require('../../core/db');
const eventBus = require('../../core/events');

class BrandingController {
  async getBranding(req, res) {
    try {
      const teacherId = req.query.teacherId || 'tch-tarek-001';
      const teacher = db.findById('teachers', teacherId) || db.find('teachers')[0];
      if (!teacher) {
        return res.status(404).json({ success: false, error: 'Teacher not found' });
      }

      const branding = teacher.branding || {
        academy_name: 'أكاديمية أ/ طارق الشناوي للفيزياء',
        tagline: 'رواد تدريس وتبسيط الفيزياء للثانوية العامة',
        logo_icon: '⚡',
        primary_color: '#2563EB',
        accent_color: '#059669',
        theme_preset: 'ACADEMIC_ROYAL_BLUE',
        cover_gradient: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)'
      };

      res.status(200).json({
        success: true,
        data: branding
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async updateBranding(req, res) {
    try {
      const teacherId = req.body.teacherId || req.query.teacherId || 'tch-tarek-001';
      const teacher = db.findById('teachers', teacherId) || db.find('teachers')[0];
      if (!teacher) {
        return res.status(404).json({ success: false, error: 'Teacher not found' });
      }

      const { academy_name, tagline, logo_icon, primary_color, accent_color, theme_preset, cover_gradient } = req.body;

      const currentBranding = teacher.branding || {};
      const updatedBranding = {
        academy_name: academy_name || currentBranding.academy_name || `أكاديمية ${teacher.full_name}`,
        tagline: tagline !== undefined ? tagline : (currentBranding.tagline || 'نظام التعليم والمتابعة الذكي'),
        logo_icon: logo_icon || currentBranding.logo_icon || '⚡',
        primary_color: primary_color || currentBranding.primary_color || '#2563EB',
        accent_color: accent_color || currentBranding.accent_color || '#059669',
        theme_preset: theme_preset || currentBranding.theme_preset || 'CUSTOM',
        cover_gradient: cover_gradient || currentBranding.cover_gradient || 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)'
      };

      db.update('teachers', teacher.id, {
        branding: updatedBranding
      });

      eventBus.emit('TEACHER_BRANDING_UPDATED', {
        teacherId: teacher.id,
        branding: updatedBranding
      });

      res.status(200).json({
        success: true,
        data: updatedBranding,
        message: 'تم تحديث وتعميم الهوية البصرية بنجاح 🎨'
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}

module.exports = new BrandingController();
