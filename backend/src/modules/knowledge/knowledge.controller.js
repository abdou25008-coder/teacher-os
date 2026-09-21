/**
 * TEACHER OS — Knowledge Vault Controller
 */

const knowledgeService = require('./knowledge.service');
const db = require('../../core/db');

class KnowledgeController {
  async uploadDocument(req, res) {
    try {
      const teacherId = req.user ? req.user.profileId : db.find('teachers')[0]?.id;
      const result = await knowledgeService.ingestDocument(teacherId, req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Document ingested and indexed into knowledge vault successfully'
      });
    } catch (err) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: err.message
      });
    }
  }

  async search(req, res) {
    try {
      const teacherId = req.user ? req.user.profileId : db.find('teachers')[0]?.id;
      const { query, topK } = req.body;
      const result = await knowledgeService.searchVault(teacherId, { query, topK });
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

  async generateFromVault(req, res) {
    try {
      const teacherId = req.user ? req.user.profileId : db.find('teachers')[0]?.id;
      const result = await knowledgeService.generateAssessmentFromVault(teacherId, req.body);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Assessment generated from teacher knowledge vault successfully'
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  async listDocuments(req, res) {
    try {
      const teacherId = req.user ? req.user.profileId : db.find('teachers')[0]?.id;
      const result = await knowledgeService.listDocuments(teacherId);
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

  async deleteDocument(req, res) {
    try {
      const teacherId = req.user ? req.user.profileId : db.find('teachers')[0]?.id;
      const { docId } = req.params;
      const result = await knowledgeService.deleteDocument(teacherId, docId);
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

module.exports = new KnowledgeController();
