/**
 * TEACHER OS — Business OS Controller
 */

const businessService = require('./business.service');
const tieringService = require('./tiering.service');
const dunningService = require('./dunning.service');
const promoService = require('./promo.service');

class BusinessController {
  async createSubscription(req, res) {
    try {
      const teacherId = req.user.profileId;
      const result = await businessService.createSubscription(teacherId, req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Subscription created successfully'
      });
    } catch (err) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  async recordPayment(req, res) {
    try {
      const collectorUserId = req.user.userId;
      const teacherId = req.user.profileId || req.body.teacherId;
      const result = await businessService.recordPayment(collectorUserId, { ...req.body, teacherId });
      res.status(201).json({
        success: true,
        data: result,
        message: 'Payment recorded successfully'
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
      const userRole = req.user.role;
      const result = await businessService.getBusinessOverview(teacherId, userRole);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  async getSaaSTiers(req, res) {
    try {
      const tiers = tieringService.getAvailablePlans();
      res.status(200).json({
        success: true,
        data: tiers
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  async getTeacherSaaSPlan(req, res) {
    try {
      const teacherId = req.user?.profileId || req.query.teacherId;
      const plan = await tieringService.getTeacherTier(teacherId);
      res.status(200).json({
        success: true,
        data: plan
      });
    } catch (err) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  async upgradeSaaSPlan(req, res) {
    try {
      const teacherId = req.user?.profileId || req.body.teacherId;
      const { planCode, paymentMethod, referenceId } = req.body;
      const result = await tieringService.upgradePlan(teacherId, {
        newPlanId: planCode,
        paymentMethod,
        referenceId
      });
      res.status(200).json({
        success: true,
        data: result,
        message: result.message
      });
    } catch (err) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  async sendDunningReminder(req, res) {
    try {
      const { studentId } = req.params;
      const result = await dunningService.generatePaymentReminder(studentId);
      res.status(200).json({
        success: true,
        data: result,
        message: 'تم إعداد تذكير السداد بنجاح'
      });
    } catch (err) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  async getStudentAccess(req, res) {
    try {
      const { studentId } = req.params;
      const result = await dunningService.checkStudentAccess(studentId);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  async redeemPromo(req, res) {
    try {
      const teacherId = req.user?.profileId || req.body.teacherId;
      const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
      const result = await promoService.redeemPromo({
        teacherId,
        promoCode: req.body.promoCode,
        nationalId: req.body.nationalId,
        deviceFingerprint: req.body.deviceFingerprint,
        ipAddress
      });
      res.status(200).json({
        success: true,
        data: result,
        message: result.message
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  async checkPromoEligibility(req, res) {
    try {
      const teacherId = req.user?.profileId || req.query.teacherId;
      const { deviceFingerprint, nationalId } = req.query;
      const result = promoService.checkEligibility({ teacherId, deviceFingerprint, nationalId });
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

module.exports = new BusinessController();
