/**
 * TEACHER OS — Sessions Controller
 */

const sessionsService = require('./sessions.service');

class SessionsController {
  async scheduleSession(req, res) {
    try {
      const teacherId = req.user.profileId;
      const result = await sessionsService.scheduleSession(teacherId, req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Session scheduled successfully'
      });
    } catch (err) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  async markAttendance(req, res) {
    try {
      const teacherId = req.user.profileId;
      const { sessionId } = req.params;
      const { attendanceList } = req.body;
      const result = await sessionsService.markAttendance(teacherId, sessionId, attendanceList);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Attendance recorded successfully'
      });
    } catch (err) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  async getSessionAttendance(req, res) {
    try {
      const teacherId = req.user.profileId;
      const { sessionId } = req.params;
      const result = await sessionsService.getSessionAttendance(teacherId, sessionId);
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

module.exports = new SessionsController();
