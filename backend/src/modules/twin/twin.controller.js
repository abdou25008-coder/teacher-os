/**
 * TEACHER OS — Digital Twin Controller
 */

const twinService = require('./twin.service');

class TwinController {
  async askTwin(req, res) {
    try {
      const teacherId = req.user.profileId || req.body.teacherId;
      const result = await twinService.generateTwinResponse(teacherId, req.body);
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

module.exports = new TwinController();
