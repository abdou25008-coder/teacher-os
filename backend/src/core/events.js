/**
 * TEACHER OS — Event Bus & Audit Logging System
 * Decouples asynchronous event dispatching (notifications, audit trails, analytics) from transactional logic.
 */

const db = require('./db');

class EventBus {
  constructor() {
    this.subscribers = new Map();
  }

  on(eventName, handler) {
    if (!this.subscribers.has(eventName)) {
      this.subscribers.set(eventName, []);
    }
    this.subscribers.get(eventName).push(handler);
  }

  emit(eventName, payload) {
    const handlers = this.subscribers.get(eventName) || [];
    for (const handler of handlers) {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[EventBus Error] Error handling event ${eventName}:`, err);
      }
    }

    // Auto-record audit log for state mutating events
    if (payload && (payload.userId || payload.teacherId)) {
      db.insert('audit_logs', {
        user_id: payload.userId || payload.teacherId,
        action: eventName,
        payload_json: payload,
        timestamp: new Date().toISOString()
      });
    }
  }
}

const eventBus = new EventBus();
module.exports = eventBus;
