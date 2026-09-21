/**
 * TEACHER OS — Insights Controller
 */

const insightsService = require('./insights.service');

class InsightsController {
  async getMyIntelligentDay(req, res) {
    try {
      const teacherId = req.user.profileId;
      const result = await insightsService.getMyIntelligentDay(teacherId);
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

  async getLearningGaps(req, res) {
    try {
      const teacherId = req.user.profileId;
      const { groupId } = req.query;
      const result = await insightsService.mineLearningGaps(teacherId, groupId);
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

  async triggerRemediation(req, res) {
    try {
      const teacherId = req.user.profileId;
      const result = await insightsService.triggerRemediation(teacherId, req.body);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Remediation dispatched successfully'
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }
}

module.exports = new InsightsController();
