/**
 * TEACHER OS — Unified API Gateway Server
 * Production HTTP Server hosting REST APIs and serving the client interface.
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const authController = require('./modules/auth/auth.controller');
const groupsController = require('./modules/groups/groups.controller');
const sessionsController = require('./modules/sessions/sessions.controller');
const aiController = require('./modules/ai/ai.controller');
const assessmentsController = require('./modules/assessments/assessments.controller');
const insightsController = require('./modules/insights/insights.controller');
const studentController = require('./modules/student/student.controller');
const parentController = require('./modules/parent/parent.controller');
const knowledgeController = require('./modules/knowledge/knowledge.controller');
const businessController = require('./modules/business/business.controller');
const ocrController = require('./modules/ocr/ocr.controller');
const twinController = require('./modules/twin/twin.controller');
const zoomController = require('./modules/zoom/zoom.controller');
const communityController = require('./modules/community/community.controller');
const brandingController = require('./modules/teacher/branding.controller');
const SecurityEngine = require('./core/security');

const PORT = process.env.PORT || 3000;

class APIGatewayServer {
  constructor() {
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
  }

  async handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Set CORS & Security Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Correlation-ID');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Correlation ID
    const correlationId = req.headers['x-correlation-id'] || 'req_' + Math.random().toString(36).substring(2, 9);
    res.setHeader('X-Correlation-ID', correlationId);

    // Parse JSON body if applicable
    let body = {};
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        body = await this._parseBody(req);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Malformed JSON payload' }));
        return;
      }
    }

    // Helper wrappers
    const reqWrapper = {
      body,
      query: parsedUrl.query,
      headers: req.headers,
      params: {},
      user: this._extractUser(req)
    };

    const resWrapper = {
      status: (code) => {
        res.statusCode = code;
        return {
          json: (data) => {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(data));
          }
        };
      }
    };

    try {
      // Health check
      if (pathname === '/api/v1/health') {
        resWrapper.status(200).json({ status: 'HEALTHY', timestamp: new Date().toISOString() });
        return;
      }

      // 1. Auth Routes
      if (pathname === '/api/v1/auth/register' && method === 'POST') return authController.register(reqWrapper, resWrapper);
      if (pathname === '/api/v1/auth/login' && method === 'POST') return authController.login(reqWrapper, resWrapper);
      if (pathname === '/api/v1/auth/phone-login' && method === 'POST') return authController.phoneLogin(reqWrapper, resWrapper);
      if (pathname === '/api/v1/auth/google-login' && method === 'POST') return authController.googleLogin(reqWrapper, resWrapper);
      if (pathname === '/api/v1/auth/student-login' && method === 'POST') return authController.studentLogin(reqWrapper, resWrapper);
      if (pathname === '/api/v1/auth/parent-login' && method === 'POST') return authController.parentLogin(reqWrapper, resWrapper);
      if (pathname === '/api/v1/auth/me' && method === 'GET') return authController.getMe(reqWrapper, resWrapper);

      // 2. Groups & Students Routes
      if (pathname === '/api/v1/groups' && method === 'POST') return groupsController.createGroup(reqWrapper, resWrapper);
      if (pathname === '/api/v1/groups' && method === 'GET') return groupsController.getGroups(reqWrapper, resWrapper);
      if (pathname === '/api/v1/students' && method === 'GET') return groupsController.getAllStudents(reqWrapper, resWrapper);
      
      const enrollMatch = pathname.match(/^\/api\/v1\/groups\/([^\/]+)\/students$/);
      if (enrollMatch && method === 'POST') {
        reqWrapper.params.groupId = enrollMatch[1];
        return groupsController.enrollStudent(reqWrapper, resWrapper);
      }
      if (enrollMatch && method === 'GET') {
        reqWrapper.params.groupId = enrollMatch[1];
        return groupsController.getGroupStudents(reqWrapper, resWrapper);
      }

      // 3. Sessions Routes
      if (pathname === '/api/v1/sessions' && method === 'POST') return sessionsController.scheduleSession(reqWrapper, resWrapper);
      const attendMatch = pathname.match(/^\/api\/v1\/sessions\/([^\/]+)\/attendance$/);
      if (attendMatch && method === 'POST') {
        reqWrapper.params.sessionId = attendMatch[1];
        return sessionsController.markAttendance(reqWrapper, resWrapper);
      }
      if (attendMatch && method === 'GET') {
        reqWrapper.params.sessionId = attendMatch[1];
        return sessionsController.getSessionAttendance(reqWrapper, resWrapper);
      }

      // 4. AI Studio Routes
      if (pathname === '/api/v1/ai/generate-lesson' && method === 'POST') return aiController.generateLesson(reqWrapper, resWrapper);
      if (pathname === '/api/v1/ai/generate-assessment' && method === 'POST') return aiController.generateAssessment(reqWrapper, resWrapper);
      if (pathname === '/api/v1/ai/voice-command' && method === 'POST') return aiController.processVoiceCommand(reqWrapper, resWrapper);

      // 5. Assessments Routes
      if (pathname === '/api/v1/assessments' && method === 'POST') return assessmentsController.createAssessment(reqWrapper, resWrapper);
      const submitMatch = pathname.match(/^\/api\/v1\/assessments\/([^\/]+)\/submit$/);
      if (submitMatch && method === 'POST') {
        reqWrapper.params.assessmentId = submitMatch[1];
        return assessmentsController.submitAttempt(reqWrapper, resWrapper);
      }
      const overviewMatch = pathname.match(/^\/api\/v1\/assessments\/([^\/]+)\/overview$/);
      if (overviewMatch && method === 'GET') {
        reqWrapper.params.assessmentId = overviewMatch[1];
        return assessmentsController.getOverview(reqWrapper, resWrapper);
      }

      // 6. Insights & My Intelligent Day
      if (pathname === '/api/v1/insights/my-day' && method === 'GET') return insightsController.getMyIntelligentDay(reqWrapper, resWrapper);
      if (pathname === '/api/v1/insights/learning-gaps' && method === 'GET') return insightsController.getLearningGaps(reqWrapper, resWrapper);
      if (pathname === '/api/v1/insights/remediation' && method === 'POST') return insightsController.triggerRemediation(reqWrapper, resWrapper);

      // 7. Student Routes
      if (pathname === '/api/v1/student/my-day' && method === 'GET') return studentController.getMyDay(reqWrapper, resWrapper);
      if (pathname === '/api/v1/student/ask-coach' && method === 'POST') return studentController.askCoach(reqWrapper, resWrapper);

      // 8. Parent Routes
      if (pathname === '/api/v1/parent/link-student' && method === 'POST') return parentController.linkStudent(reqWrapper, resWrapper);
      if (pathname === '/api/v1/parent/children' && method === 'GET') return parentController.getChildren(reqWrapper, resWrapper);
      if (pathname === '/api/v1/parent/teacher-showcase' && method === 'GET') return parentController.getTeacherShowcase(reqWrapper, resWrapper);
      const parentShowcaseMatch = pathname.match(/^\/api\/v1\/parent\/teacher-showcase\/([^\/]+)$/);
      if (parentShowcaseMatch && method === 'GET') {
        reqWrapper.params.teacherId = parentShowcaseMatch[1];
        return parentController.getTeacherShowcase(reqWrapper, resWrapper);
      }
      if (pathname === '/api/v1/parent/pulse' && method === 'GET') {
        reqWrapper.params.studentId = reqWrapper.query.studentId || 'stu-demo-1';
        return parentController.getPulse(reqWrapper, resWrapper);
      }
      const parentPulseMatch = pathname.match(/^\/api\/v1\/parent\/child-pulse\/([^\/]+)$/);
      if (parentPulseMatch && method === 'GET') {
        reqWrapper.params.studentId = parentPulseMatch[1];
        return parentController.getPulse(reqWrapper, resWrapper);
      }
      const parentCardMatch = pathname.match(/^\/api\/v1\/parent\/whatsapp-card\/([^\/]+)$/);
      if (parentCardMatch && method === 'GET') {
        reqWrapper.params.studentId = parentCardMatch[1];
        return parentController.getWhatsAppCard(reqWrapper, resWrapper);
      }

      // Teacher Branding & Theme Routes
      if (pathname === '/api/v1/teacher/branding' && method === 'GET') return brandingController.getBranding(reqWrapper, resWrapper);
      if (pathname === '/api/v1/teacher/branding' && method === 'POST') return brandingController.updateBranding(reqWrapper, resWrapper);

      // 9. Knowledge Vault (RAG) Routes
      if (pathname === '/api/v1/knowledge/upload' && method === 'POST') return knowledgeController.uploadDocument(reqWrapper, resWrapper);
      if (pathname === '/api/v1/knowledge/documents' && method === 'GET') return knowledgeController.listDocuments(reqWrapper, resWrapper);
      if (pathname === '/api/v1/knowledge/search' && method === 'POST') return knowledgeController.search(reqWrapper, resWrapper);
      if (pathname === '/api/v1/knowledge/generate' && method === 'POST') return knowledgeController.generateFromVault(reqWrapper, resWrapper);
      
      const docDelMatch = pathname.match(/^\/api\/v1\/knowledge\/documents\/([^\/]+)$/);
      if (docDelMatch && method === 'DELETE') {
        reqWrapper.params.docId = docDelMatch[1];
        return knowledgeController.deleteDocument(reqWrapper, resWrapper);
      }

      // 10. Business OS Routes
      if (pathname === '/api/v1/business/subscriptions' && method === 'POST') return businessController.createSubscription(reqWrapper, resWrapper);
      if (pathname === '/api/v1/business/payments' && method === 'POST') return businessController.recordPayment(reqWrapper, resWrapper);
      if (pathname === '/api/v1/business/overview' && method === 'GET') return businessController.getOverview(reqWrapper, resWrapper);
      if (pathname === '/api/v1/business/tiers' && method === 'GET') return businessController.getSaaSTiers(reqWrapper, resWrapper);
      if (pathname === '/api/v1/business/teacher-tier' && method === 'GET') return businessController.getTeacherSaaSPlan(reqWrapper, resWrapper);
      if (pathname === '/api/v1/business/upgrade-tier' && method === 'POST') return businessController.upgradeSaaSPlan(reqWrapper, resWrapper);
      if (pathname === '/api/v1/business/redeem-promo' && method === 'POST') return businessController.redeemPromo(reqWrapper, resWrapper);
      if (pathname === '/api/v1/business/promo-eligibility' && method === 'GET') return businessController.checkPromoEligibility(reqWrapper, resWrapper);

      const dunningRemindMatch = pathname.match(/^\/api\/v1\/business\/dunning\/remind\/([^\/]+)$/);
      if (dunningRemindMatch && method === 'GET') {
        reqWrapper.params.studentId = dunningRemindMatch[1];
        return businessController.sendDunningReminder(reqWrapper, resWrapper);
      }

      const accessCheckMatch = pathname.match(/^\/api\/v1\/business\/student-access\/([^\/]+)$/);
      if (accessCheckMatch && method === 'GET') {
        reqWrapper.params.studentId = accessCheckMatch[1];
        return businessController.getStudentAccess(reqWrapper, resWrapper);
      }

      // 11. OCR Exam Scanner Routes
      if (pathname === '/api/v1/ocr/scan-paper' && method === 'POST') return ocrController.scanPaper(reqWrapper, resWrapper);

      // 12. Teaching Digital Twin Routes
      if (pathname === '/api/v1/twin/ask' && method === 'POST') return twinController.askTwin(reqWrapper, resWrapper);

      // 13. Zoom Live Online Meetings Routes
      if (pathname === '/api/v1/zoom/meetings' && method === 'POST') return zoomController.createMeeting(reqWrapper, resWrapper);
      if (pathname === '/api/v1/zoom/meetings' && method === 'GET') return zoomController.getMeetings(reqWrapper, resWrapper);
      
      const zoomMatch = pathname.match(/^\/api\/v1\/zoom\/meetings\/([^\/]+)$/);
      if (zoomMatch && method === 'GET') {
        reqWrapper.params.meetingId = zoomMatch[1];
        return zoomController.getMeetingById(reqWrapper, resWrapper);
      }

      const zoomJoinMatch = pathname.match(/^\/api\/v1\/zoom\/meetings\/([^\/]+)\/join$/);
      if (zoomJoinMatch && method === 'POST') {
        reqWrapper.params.meetingId = zoomJoinMatch[1];
        return zoomController.joinMeeting(reqWrapper, resWrapper);
      }

      const zoomEndMatch = pathname.match(/^\/api\/v1\/zoom\/meetings\/([^\/]+)\/end$/);
      if (zoomEndMatch && method === 'POST') {
        reqWrapper.params.meetingId = zoomEndMatch[1];
        return zoomController.endMeeting(reqWrapper, resWrapper);
      }

      const zoomInviteMatch = pathname.match(/^\/api\/v1\/zoom\/meetings\/([^\/]+)\/whatsapp-invite$/);
      if (zoomInviteMatch && method === 'GET') {
        reqWrapper.params.meetingId = zoomInviteMatch[1];
        return zoomController.getWhatsAppInvite(reqWrapper, resWrapper);
      }

      // 14. EduSocial Community & Multi-Teacher Network Routes
      if (pathname === '/api/v1/community/feed' && method === 'GET') return communityController.getFeed(reqWrapper, resWrapper);
      if (pathname === '/api/v1/community/posts' && method === 'POST') return communityController.createPost(reqWrapper, resWrapper);
      
      const communityInteractMatch = pathname.match(/^\/api\/v1\/community\/posts\/([^\/]+)\/interact$/);
      if (communityInteractMatch && method === 'POST') {
        reqWrapper.params.postId = communityInteractMatch[1];
        return communityController.interactPost(reqWrapper, resWrapper);
      }

      const communityCommentMatch = pathname.match(/^\/api\/v1\/community\/posts\/([^\/]+)\/comments$/);
      if (communityCommentMatch && method === 'POST') {
        reqWrapper.params.postId = communityCommentMatch[1];
        return communityController.addComment(reqWrapper, resWrapper);
      }

      if (pathname === '/api/v1/community/teachers' && method === 'GET') return communityController.getTeacherDirectory(reqWrapper, resWrapper);
      if (pathname === '/api/v1/community/follow' && method === 'POST') return communityController.followTeacher(reqWrapper, resWrapper);
      if (pathname === '/api/v1/community/enroll' && method === 'POST') return communityController.enrollStudent(reqWrapper, resWrapper);

      // Static Client Files
      return this._serveStatic(pathname, res);

    } catch (err) {
      resWrapper.status(500).json({ success: false, error: err.message });
    }
  }

  _parseBody(req) {
    return new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => {
        if (!data) return resolve({});
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  _extractUser(req) {
    const authHeader = req.headers['authorization'] || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        return SecurityEngine.verifyToken(token);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  _serveStatic(pathname, res) {
    let filePath = path.join(__dirname, '../../client', pathname === '/' ? 'index.html' : pathname);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: 'Endpoint or asset not found' }));
      return;
    }

    const ext = path.extname(filePath);
    let contentType = 'text/html; charset=utf-8';
    if (ext === '.js') contentType = 'application/javascript; charset=utf-8';
    if (ext === '.css') contentType = 'text/css; charset=utf-8';
    if (ext === '.json') contentType = 'application/json; charset=utf-8';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  }

  start(port = PORT) {
    return new Promise(resolve => {
      this.server.listen(port, () => {
        console.log(`🚀 [Teacher OS Gateway] Live on http://localhost:${port}`);
        resolve(this.server);
      });
    });
  }
}

if (require.main === module) {
  const server = new APIGatewayServer();
  server.start();
}

module.exports = APIGatewayServer;
