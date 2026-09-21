/**
 * TEACHER OS — Auth Controller
 */

const authService = require('./auth.service');

class AuthController {
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully'
      });
    } catch (err) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  async login(req, res) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (err) {
      res.status(err.statusCode || 401).json({
        success: false,
        error: err.message
      });
    }
  }

  async studentLogin(req, res) {
    try {
      const result = await authService.studentLogin(req.body);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Student login successful'
      });
    } catch (err) {
      res.status(err.statusCode || 401).json({
        success: false,
        error: err.message
      });
    }
  }

  async parentLogin(req, res) {
    try {
      const result = await authService.parentLogin(req.body);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Parent login successful'
      });
    } catch (err) {
      res.status(err.statusCode || 401).json({
        success: false,
        error: err.message
      });
    }
  }

  async phoneLogin(req, res) {
    try {
      const result = await authService.phoneQuickLogin(req.body);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Mobile phone login successful'
      });
    } catch (err) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  async googleLogin(req, res) {
    try {
      const result = await authService.googleLogin(req.body);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Google login successful'
      });
    } catch (err) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  async getMe(req, res) {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace('Bearer ', '');
      const result = await authService.getSession(token);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      res.status(401).json({
        success: false,
        error: err.message
      });
    }
  }
}

module.exports = new AuthController();
