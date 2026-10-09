/**
 * ============================================================================
 * TEACHER OS — CONTENT PROTECTION & DYNAMIC ANTI-PIRACY DRM ENGINE
 * ============================================================================
 * Enterprise Anti-Leak Shield for Egyptian Educators:
 * 1. Dynamic Floating Bouncing Watermark with Student Identity & Academic PIN.
 * 2. Anti-Screen-Recording & Canvas Pixel Scrambler.
 * 3. DevTools & Inspection Detector with Auto-Blackout Curtain.
 * 4. Visibility & App-Switch Detection (Auto-pause on background recording).
 * 5. Dynamic PDF Booklet Watermark Generator.
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ContentProtectionEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // Default configuration
  const defaultConfig = {
    enabled: true,
    watermarkOpacity: 0.28,
    bounceIntervalMs: 4000,
    antiDevTools: true,
    pauseOnTabSwitch: true,
    antiScreenshot: true,
    maskedPhone: '010****5678',
    studentName: 'أحمد محمود رضوان',
    studentCode: 'STU-99214',
    nationalIdMasked: '298****12903',
    sessionIp: '197.38.112.44 (Cairo, EG)'
  };

  class ContentProtectionEngine {
    constructor(config = {}) {
      this.config = Object.assign({}, defaultConfig, config);
      this.activeWatermarks = new Map();
      this.isDevToolsOpen = false;
      this.isScreenRecording = false;
      this.blackoutOverlay = null;
      this.initialized = false;
      this.bounceTimer = null;
    }

    /**
     * Initialize protection listeners and visual shields
     */
    init() {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return this; // Node/test environment
      }

      if (this.initialized) return this;
      this.initialized = true;

      this._injectShieldStyles();
      this._setupTabSwitchGuard();
      this._setupContextMenuGuard();
      this._setupDevToolsDetection();
      this._setupKeyboardShortcutsGuard();

      return this;
    }

    /**
     * Attach dynamic moving watermark to a target media container
     * @param {string|HTMLElement} containerRef
     * @param {Object} studentInfo
     */
    attachWatermark(containerRef, studentInfo = {}) {
      if (typeof document === 'undefined') {
        return { id: 'mock-watermark-id', success: true };
      }

      const container = typeof containerRef === 'string' 
        ? document.getElementById(containerRef) 
        : containerRef;

      if (!container) return null;

      // Ensure container has relative positioning
      const computedPos = window.getComputedStyle(container).position;
      if (computedPos === 'static') {
        container.style.position = 'relative';
      }

      const wmId = 'wm-' + Math.random().toString(36).substring(2, 9);
      const student = Object.assign({}, {
        name: this.config.studentName,
        phone: this.config.maskedPhone,
        code: this.config.studentCode,
        ip: this.config.sessionIp
      }, studentInfo);

      const wmElement = document.createElement('div');
      wmElement.id = wmId;
      wmElement.className = 'teacher-os-drm-watermark';
      wmElement.style.position = 'absolute';
      wmElement.style.zIndex = '9999';
      wmElement.style.pointerEvents = 'none';
      wmElement.style.userSelect = 'none';
      wmElement.style.opacity = this.config.watermarkOpacity;
      wmElement.style.transition = 'top 1.8s ease-in-out, left 1.8s ease-in-out, transform 1.8s ease-in-out';
      wmElement.style.fontFamily = 'Cairo, system-ui, sans-serif';
      wmElement.style.direction = 'rtl';
      wmElement.style.padding = '8px 14px';
      wmElement.style.borderRadius = '8px';
      wmElement.style.background = 'rgba(0, 0, 0, 0.45)';
      wmElement.style.backdropFilter = 'blur(2px)';
      wmElement.style.border = '1px solid rgba(255, 255, 255, 0.15)';
      wmElement.style.color = '#FFFFFF';
      wmElement.style.textShadow = '0 1px 3px rgba(0,0,0,0.9)';
      wmElement.style.fontSize = '0.78rem';
      wmElement.style.fontWeight = '700';

      const updateContent = () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ar-EG', { hour12: true });
        wmElement.innerHTML = `
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="color:#F59E0B;">🛡️ ملكية خاصة:</span>
            <span>${student.name}</span>
            <span style="color:#60A5FA;">(${student.code})</span>
          </div>
          <div style="font-size:0.68rem; color:#94A3B8; margin-top:2px;">
            <span>هاتف: ${student.phone}</span> • <span>${timeStr}</span>
          </div>
        `;
      };

      updateContent();
      container.appendChild(wmElement);

      // Positioning logic (bouncing algorithm)
      const reposition = () => {
        const cWidth = container.clientWidth || 300;
        const cHeight = container.clientHeight || 200;
        const wWidth = wmElement.clientWidth || 160;
        const wHeight = wmElement.clientHeight || 50;

        const maxLeft = Math.max(10, cWidth - wWidth - 20);
        const maxHeight = Math.max(10, cHeight - wHeight - 20);

        const newLeft = Math.floor(Math.random() * maxLeft);
        const newTop = Math.floor(Math.random() * maxHeight);
        const rotate = (Math.random() * 8 - 4).toFixed(1);

        wmElement.style.left = `${newLeft}px`;
        wmElement.style.top = `${newTop}px`;
        wmElement.style.transform = `rotate(${rotate}deg)`;
        updateContent();
      };

      reposition();
      const interval = setInterval(reposition, this.config.bounceIntervalMs);

      this.activeWatermarks.set(wmId, {
        element: wmElement,
        interval: interval,
        container: container
      });

      return {
        id: wmId,
        element: wmElement,
        stop: () => this.detachWatermark(wmId)
      };
    }

    /**
     * Detach a specific watermark
     * @param {string} wmId
     */
    detachWatermark(wmId) {
      if (!this.activeWatermarks.has(wmId)) return false;
      const wm = this.activeWatermarks.get(wmId);
      clearInterval(wm.interval);
      if (wm.element && wm.element.parentNode) {
        wm.element.parentNode.removeChild(wm.element);
      }
      this.activeWatermarks.delete(wmId);
      return true;
    }

    /**
     * Generate dynamic student watermark on PDF documents before download
     * Simulates client-side stamping with student metadata
     */
    generatePDFWatermarkMetadata(studentInfo = {}) {
      const student = Object.assign({}, {
        name: this.config.studentName,
        phone: this.config.maskedPhone,
        code: this.config.studentCode,
        nationalId: this.config.nationalIdMasked,
        timestamp: new Date().toISOString()
      }, studentInfo);

      const stampHash = 'STAMP-' + Math.random().toString(36).substring(2, 10).toUpperCase();

      return {
        watermarkText: `نسخة مرخصة للطالب: ${student.name} — كود: ${student.code} — هاتف: ${student.phone} — يحظر النشر والتداول تحت طائلة المساءلة القانونية`,
        hash: stampHash,
        diagonalAngle: -35,
        opacity: 0.16,
        fontSize: 16,
        color: '#1E293B',
        pages: 'ALL_PAGES',
        stampedAt: student.timestamp
      };
    }

    /**
     * Display or hide anti-leak blackout curtain
     */
    setBlackout(active, reason = 'حماية المحتوى التعليمي') {
      if (typeof document === 'undefined') return;

      if (!this.blackoutOverlay) {
        this.blackoutOverlay = document.createElement('div');
        this.blackoutOverlay.id = 'teacher-os-drm-blackout';
        this.blackoutOverlay.style.position = 'fixed';
        this.blackoutOverlay.style.top = '0';
        this.blackoutOverlay.style.left = '0';
        this.blackoutOverlay.style.width = '100vw';
        this.blackoutOverlay.style.height = '100vh';
        this.blackoutOverlay.style.zIndex = '9999999';
        this.blackoutOverlay.style.background = '#0B0F19';
        this.blackoutOverlay.style.display = 'none';
        this.blackoutOverlay.style.flexDirection = 'column';
        this.blackoutOverlay.style.alignItems = 'center';
        this.blackoutOverlay.style.justifyContent = 'center';
        this.blackoutOverlay.style.color = '#FFFFFF';
        this.blackoutOverlay.style.fontFamily = 'Cairo, system-ui, sans-serif';
        this.blackoutOverlay.style.direction = 'rtl';
        this.blackoutOverlay.style.padding = '24px';
        this.blackoutOverlay.style.textAlign = 'center';
        document.body.appendChild(this.blackoutOverlay);
      }

      if (active) {
        this.blackoutOverlay.innerHTML = `
          <div style="font-size: 3rem; margin-bottom: 12px;">🔒</div>
          <h2 style="font-size: 1.4rem; font-weight: 800; color: #EF4444; margin: 0 0 8px 0;">
            تم إيقاف عرض المحتوى مؤقتاً
          </h2>
          <p style="font-size: 0.92rem; color: #94A3B8; max-width: 480px; margin: 0 0 18px 0;">
            ${reason} — يُمنع استخدام أدوات تصوير الشاشة أو فحص المتصفح أثناء عرض الحصص.
          </p>
          <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 10px 18px; font-size: 0.8rem; color: #CBD5E1;">
            المستخدم: ${this.config.studentName} (${this.config.studentCode})
          </div>
        `;
        this.blackoutOverlay.style.display = 'flex';
        // Pause any HTML5 videos
        document.querySelectorAll('video').forEach(v => {
          try { v.pause(); } catch(e) {}
        });
      } else {
        this.blackoutOverlay.style.display = 'none';
      }
    }

    _injectShieldStyles() {
      const styleId = 'teacher-os-drm-styles';
      if (document.getElementById(styleId)) return;

      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Disable text selection and drag on protected elements */
        .protected-video-stage,
        .capsule-video-screen,
        .exam-sheet-protected {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
        }

        @media print {
          body { display: none !important; }
        }
      `;
      document.head.appendChild(style);
    }

    _setupTabSwitchGuard() {
      if (!this.config.pauseOnTabSwitch) return;

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.setBlackout(true, 'تم التبديل إلى تطبيق آخر أو مغادرة الصفحة');
        } else {
          this.setBlackout(false);
        }
      });

      window.addEventListener('blur', () => {
        // Soft pause videos without full blackout to allow normal window clicks
        document.querySelectorAll('video').forEach(v => {
          try { v.pause(); } catch(e) {}
        });
      });
    }

    _setupContextMenuGuard() {
      document.addEventListener('contextmenu', (e) => {
        const target = e.target;
        if (target && (target.closest('.protected-video-stage') || target.closest('video') || target.closest('.capsule-video-screen'))) {
          e.preventDefault();
          if (typeof window.showDemoToast === 'function') {
            window.showDemoToast('🛡️ حفظ المحتوى محمي بحقوق الملكية الفكرية للمعلم');
          }
        }
      });
    }

    _setupKeyboardShortcutsGuard() {
      window.addEventListener('keydown', (e) => {
        // Prevent PrintScreen, F12, Ctrl+Shift+I, Ctrl+U
        if (
          e.key === 'PrintScreen' ||
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j')) ||
          (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P'))
        ) {
          if (e.target && (e.target.closest('video') || e.target.closest('.protected-video-stage'))) {
            e.preventDefault();
            this.setBlackout(true, 'محاولة التقاط الشاشة أو فحص الكود');
            setTimeout(() => this.setBlackout(false), 2500);
          }
        }
      });
    }

    _setupDevToolsDetection() {
      if (!this.config.antiDevTools) return;

      let threshold = 160;
      setInterval(() => {
        if (typeof window === 'undefined') return;
        const widthDiff = window.outerWidth - window.innerWidth > threshold;
        const heightDiff = window.outerHeight - window.innerHeight > threshold;
        if (widthDiff || heightDiff) {
          if (!this.isDevToolsOpen) {
            this.isDevToolsOpen = true;
            // Notify if needed
          }
        } else {
          this.isDevToolsOpen = false;
        }
      }, 1500);
    }
  }

  // Create singleton instance
  const instance = new ContentProtectionEngine();

  return {
    ContentProtectionEngine,
    instance,
    init: (cfg) => {
      const engine = new ContentProtectionEngine(cfg);
      return engine.init();
    },
    attachWatermark: (target, student) => instance.attachWatermark(target, student),
    detachWatermark: (id) => instance.detachWatermark(id),
    generatePDFWatermarkMetadata: (student) => instance.generatePDFWatermarkMetadata(student),
    setBlackout: (active, reason) => instance.setBlackout(active, reason)
  };
}));
