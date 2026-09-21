/**
 * TEACHER OS — Parent Controller
 */

const parentService = require('./parent.service');

class ParentController {
  async getPulse(req, res) {
    try {
      const { studentId } = req.params;
      const result = await parentService.getChildPulse(studentId);
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
