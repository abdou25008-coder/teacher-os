/**
 * TEACHER OS — AI Prompt Registry & Versioned Schemas
 */

const PROMPT_REGISTRY = {
  LESSON_GENERATOR_V1: {
    id: 'LESSON_GENERATOR_V1',
    version: '1.0.0',
    description: 'Generates structured, time-allocated lesson plans aligned with Egyptian curriculum standards.',
    systemPrompt: `You are an elite master pedagogy architect specializing in Egyptian secondary and preparatory education.
Generate a structured, time-allocated, highly engaging lesson plan.
Output MUST strictly follow the JSON schema provided.
Do NOT include markdown formatting outside the JSON object.`,
    schema: {
      title: 'string',
      subject: 'string',
      gradeLevel: 'string',
      totalDurationMins: 'number',
      learningObjectives: 'array',
      timeAllocation: 'array', // [{ phase: 'string', durationMins: 'number', description: 'string' }]
      commonMisconceptions: 'array',
      interactiveActivity: 'object',
      exitTicket: 'object'
    }
  },

  ASSESSMENT_GENERATOR_V1: {
    id: 'ASSESSMENT_GENERATOR_V1',
    version: '1.0.0',
    description: 'Generates balanced assessments (MCQ, T/F, Problem Solving) with concept mappings and answer keys.',
    systemPrompt: `You are a senior assessment design expert for Egyptian Thanaweya Amma and preparatory curricula.
Generate a balanced assessment respecting Bloom's taxonomy:
- 30% Conceptual Recall & Understanding (Easy)
- 50% Application & Multi-Step Analysis (Medium)
- 20% Problem Solving & Critical Evaluation (Hard)
Map every question to its discrete concept ID.
Output strictly in valid JSON format.`,
    schema: {
      title: 'string',
      lessonId: 'string',
      totalMarks: 'number',
      blueprintSummary: 'object',
      questions: 'array' // [{ conceptId, questionType, prompt, options, correctAnswer, explanation, marks, difficulty }]
    }
  },

  VOICE_INTENT_PARSER_V1: {
    id: 'VOICE_INTENT_PARSER_V1',
    version: '1.0.0',
    description: 'Parses Egyptian Arabic voice commands into structured executable intent objects.',
    systemPrompt: `You are an intelligent Egyptian Arabic voice assistant for teachers.
Detect user intent, extract entities (student names, group names, dates, subject topics), and specify the required confirmation level.
Output strictly in JSON.`,
    schema: {
      intent: 'string', // MARK_ATTENDANCE, CREATE_QUIZ, SEND_PARENT_BROADCAST, QUERY_STUDENT_STATUS
      entities: 'object',
      confirmationRequired: 'boolean',
      previewMessageAr: 'string'
    }
  }
};

module.exports = PROMPT_REGISTRY;
