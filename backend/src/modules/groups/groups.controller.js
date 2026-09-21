/**
 * TEACHER OS — Groups Controller
 */

const groupsService = require('./groups.service');
const db = require('../../core/db');

class GroupsController {
  async createGroup(req, res) {
    try {
      const teacherId = req.user ? req.user.profileId : db.find('teachers')[0]?.id;
      const result = await groupsService.createGroup(teacherId, req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Group created successfully'
      });
    } catch (err) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  async getGroups(req, res) {
    try {
      const teacherId = req.user ? req.user.profileId : db.find('teachers')[0]?.id;
      const result = await groupsService.getTeacherGroups(teacherId);
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

  async enrollStudent(req, res) {
    try {
      const teacherId = req.user ? req.user.profileId : db.find('teachers')[0]?.id;
      const { groupId } = req.params;
      const result = await groupsService.enrollStudent(teacherId, groupId, req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Student enrolled successfully'
      });
    } catch (err) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  async getGroupStudents(req, res) {
    try {
      const teacherId = req.user ? req.user.profileId : db.find('teachers')[0]?.id;
      const { groupId } = req.params;
      const result = await groupsService.getGroupStudents(teacherId, groupId);
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

  async getAllStudents(req, res) {
    try {
      const teacherId = req.user ? req.user.profileId : db.find('teachers')[0]?.id;
      const result = await groupsService.getAllTeacherStudents(teacherId);
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

module.exports = new GroupsController();
