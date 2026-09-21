/**
 * TEACHER OS — AI Studio Service
 */

const aiProvider = require('./ai.provider');
const PROMPT_REGISTRY = require('./ai.prompts');
const eventBus = require('../../core/events');

class AIService {
  async generateLessonPlan(teacherId, params) {
    const result = await aiProvider.generateStructuredOutput(PROMPT_REGISTRY.LESSON_GENERATOR_V1, params);
    eventBus.emit('AI_LESSON_GENERATED', { teacherId, topic: params.topic });
    return result;
  }

  async generateAssessment(teacherId, params) {
    const result = await aiProvider.generateStructuredOutput(PROMPT_REGISTRY.ASSESSMENT_GENERATOR_V1, params);
    eventBus.emit('AI_ASSESSMENT_GENERATED', { teacherId, title: params.title });
    return result;
  }

  async parseVoiceCommand(teacherId, { transcript }) {
    const result = await aiProvider.generateStructuredOutput(PROMPT_REGISTRY.VOICE_INTENT_PARSER_V1, { transcript });
    eventBus.emit('AI_VOICE_COMMAND_PARSED', { teacherId, intent: result.intent });
    return result;
  }
}

module.exports = new AIService();
