/**
 * TEACHER OS — EduSocial Community & Multi-Teacher Controller
 */

const communityService = require('./community.service');

class CommunityController {
  async getFeed(req, res) {
    try {
      const { subject, userId, userRole } = req.query;
      const feed = await communityService.getFeed({
        userId: userId || (req.user ? req.user.userId : null),
        userRole: userRole || (req.user ? req.user.role : null),
        subject
      });
      return res.status(200).json({ success: true, count: feed.length, feed });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async createPost(req, res) {
    try {
      const { teacherId, title, content, postType, pollOptions, audioUrl, subject } = req.body;
      const post = await communityService.createPost({
        teacherId: teacherId || (req.user ? req.user.profileId : null),
        title,
        content,
        postType,
        pollOptions,
        audioUrl,
        subject
      });
      return res.status(201).json({ success: true, post });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async interactPost(req, res) {
    try {
      const { postId } = req.params;
      const { userId, userType, interactionType, metadata } = req.body;
      const result = await communityService.interactPost({
        postId,
        userId: userId || (req.user ? req.user.userId : 'anonymous-user'),
        userType: userType || (req.user ? req.user.role : 'STUDENT'),
        interactionType,
        metadata
      });
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async addComment(req, res) {
    try {
      const { postId } = req.params;
      const { userId, userName, userType, content } = req.body;
      const comment = await communityService.addComment({
        postId,
        userId: userId || (req.user ? req.user.userId : 'usr-demo'),
        userName: userName || 'طالب متميز',
        userType: userType || (req.user ? req.user.role : 'STUDENT'),
        content
      });
      return res.status(201).json({ success: true, comment });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async getTeacherDirectory(req, res) {
    try {
      const { studentId, gradeLevel, subject } = req.query;
      const directory = await communityService.getTeacherDirectory({
        studentId: studentId || (req.user && req.user.role === 'STUDENT' ? req.user.profileId : null),
        gradeLevel,
        subject
      });
      return res.status(200).json({ success: true, count: directory.length, teachers: directory });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async followTeacher(req, res) {
    try {
      const { studentId, teacherId, action } = req.body;
      if (action === 'UNFOLLOW') {
        const result = await communityService.unfollowTeacher({ studentId, teacherId });
        return res.status(200).json({ success: true, ...result });
      } else {
        const result = await communityService.followTeacher({ studentId, teacherId });
        return res.status(200).json({ success: true, ...result });
      }
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async enrollStudent(req, res) {
    try {
      const { studentId, teacherId, groupId } = req.body;
      const result = await communityService.enrollStudent({ studentId, teacherId, groupId });
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
}

module.exports = new CommunityController();
