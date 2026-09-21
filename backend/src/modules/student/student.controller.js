/**
 * TEACHER OS — Student Controller
 */

const studentService = require('./student.service');

class StudentController {
  async getMyDay(req, res) {
    try {
      const studentId = req.user.profileId;
      const result = await studentService.getMyLearningDay(studentId);
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

  async askCoach(req, res) {
    try {
      const studentId = req.user.profileId;
      const result = await studentService.askSocraticCoach(studentId, req.body);
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

module.exports = new StudentController();
