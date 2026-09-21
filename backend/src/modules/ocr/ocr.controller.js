/**
 * TEACHER OS — OCR Controller
 */

const ocrService = require('./ocr.service');

class OCRController {
  async scanPaper(req, res) {
    try {
      const teacherId = req.user.profileId;
      const result = await ocrService.scanAndGradePaper(teacherId, req.body);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Exam paper scanned, recognized, and graded successfully via OCR'
      });
    } catch (err) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }
}

module.exports = new OCRController();
