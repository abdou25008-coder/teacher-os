/**
 * TEACHER OS — Assessments Controller
 */

const assessmentsService = require('./assessments.service');

class AssessmentsController {
  async createAssessment(req, res) {
    try {
      const teacherId = req.user.profileId;
      const result = await assessmentsService.createAssessment(teacherId, req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Assessment created and published successfully'
      });
    } catch (err) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  async submitAttempt(req, res) {
    try {
      const studentId = req.user.profileId || req.body.studentId;
      const { assessmentId } = req.params;
      const result = await assessmentsService.submitAttempt(studentId, assessmentId, req.body);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Assessment attempt scored successfully'
      });
    } catch (err) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  async getOverview(req, res) {
    try {
      const teacherId = req.user.profileId;
      const { assessmentId } = req.params;
      const result = await assessmentsService.getAssessmentOverview(teacherId, assessmentId);
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

module.exports = new AssessmentsController();
