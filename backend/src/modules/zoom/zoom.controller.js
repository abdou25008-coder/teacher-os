/**
 * TEACHER OS — Zoom Controller
 */

const zoomService = require('./zoom.service');
const db = require('../../core/db');

class ZoomController {
  async createMeeting(req, res) {
    try {
      const teacherId = req.user ? req.user.profileId : db.find('teachers')[0]?.id;
      const meeting = await zoomService.createMeeting(teacherId, req.body);
      res.status(201).json({
        success: true,
        data: meeting,
        message: 'Zoom live session created successfully'
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  async getMeetings(req, res) {
    try {
      const teacherId = req.user ? req.user.profileId : db.find('teachers')[0]?.id;
      const status = req.query ? req.query.status : null;
      const meetings = await zoomService.getMeetings(teacherId, { status });
      res.status(200).json({
        success: true,
        data: meetings
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  async getMeetingById(req, res) {
    try {
      const { meetingId } = req.params;
      const meeting = await zoomService.getMeetingById(meetingId);
      res.status(200).json({
        success: true,
        data: meeting
      });
    } catch (err) {
      res.status(404).json({
        success: false,
        error: err.message
      });
    }
  }

  async joinMeeting(req, res) {
    try {
      const { meetingId } = req.params;
      const { studentId, studentName } = req.body;
      const result = await zoomService.joinMeeting(meetingId, { studentId, studentName });
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

  async endMeeting(req, res) {
    try {
      const teacherId = req.user ? req.user.profileId : db.find('teachers')[0]?.id;
      const { meetingId } = req.params;
      const result = await zoomService.endMeeting(teacherId, meetingId);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Meeting ended successfully'
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  async getWhatsAppInvite(req, res) {
    try {
      const { meetingId } = req.params;
      const result = await zoomService.generateWhatsAppInvite(meetingId);
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

module.exports = new ZoomController();
