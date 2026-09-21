/**
 * TEACHER OS — Parent Controller
 */

const parentService = require('./parent.service');

class ParentController {
  async getPulse(req, res) {
    try {
      const { studentId } = req.params;
      const parentPhone = req.query.parentPhone || null;
      const result = await parentService.getChildPulse(studentId, parentPhone);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  async getChildren(req, res) {
    try {
      const parentPhone = req.query.parentPhone || req.query.phone || '';
      const result = await parentService.getChildrenForParent(parentPhone);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  async linkStudent(req, res) {
    try {
      const result = await parentService.linkChildWithDualKey(req.body);
      res.status(200).json({
        success: true,
        data: result,
        message: result.message
      });
    } catch (err) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  async getTeacherShowcase(req, res) {
    try {
      const { teacherId } = req.params;
      const result = await parentService.getTeacherShowcase(teacherId);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  async getWhatsAppCard(req, res) {
    try {
      const { studentId } = req.params;
      const result = await parentService.generateWhatsAppCard(studentId);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }
}

module.exports = new ParentController();
