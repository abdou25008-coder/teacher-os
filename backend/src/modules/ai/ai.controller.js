/**
 * TEACHER OS — AI Controller
 */

const aiService = require('./ai.service');

class AIController {
  async generateLesson(req, res) {
    try {
      const teacherId = req.user.profileId;
      const result = await aiService.generateLessonPlan(teacherId, req.body);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Lesson plan generated successfully'
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  async generateAssessment(req, res) {
    try {
      const teacherId = req.user.profileId;
      const result = await aiService.generateAssessment(teacherId, req.body);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Assessment generated successfully'
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  async processVoiceCommand(req, res) {
    try {
      const teacherId = req.user.profileId;
      const result = await aiService.parseVoiceCommand(teacherId, req.body);
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

module.exports = new AIController();
