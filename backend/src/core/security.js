/**
 * TEACHER OS — Core Security & Cryptography Engine
 * Handles password hashing, JWT signing/verifying, RBAC validation, and input sanitization.
 */

const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'teacher-os-production-secret-key-egypt-2026';
const JWT_EXPIRES_IN_MS = 24 * 60 * 60 * 1000; // 24 hours

class SecurityEngine {
  /**
   * Hash password with PBKDF2 and random salt
   */
  static hashPassword(password) {
    if (!password || typeof password !== 'string' || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Verify password against stored salt:hash
   */
  static verifyPassword(password, storedHash) {
    if (!password || !storedHash || !storedHash.includes(':')) {
      return false;
    }
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(originalHash));
  }

  /**
   * Generate signed JWT token
   */
  static generateToken(payload) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const exp = Date.now() + JWT_EXPIRES_IN_MS;
    const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
    const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  /**
   * Verify and decode JWT token
   */
  static verifyToken(token) {
    if (!token || typeof token !== 'string' || !token.includes('.')) {
      throw new Error('Invalid token format');
    }
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Malformed token');
    }
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    
    if (signature !== expectedSig) {
      throw new Error('Invalid token signature');
    }

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) {
      throw new Error('Token has expired');
    }
    return payload;
  }

  /**
   * Normalize and validate Egyptian & international phone numbers
   * e.g. '01012345678' -> '+201012345678'
   */
  static normalizePhoneNumber(phone, countryCode = 'EGY') {
    if (!phone) return null;
    let clean = phone.replace(/[\s\-\(\)]/g, '');
    if (countryCode === 'EGY') {
      if (clean.startsWith('01') && clean.length === 11) {
        clean = '+20' + clean.substring(1);
      } else if (clean.startsWith('201') && clean.length === 12) {
        clean = '+' + clean;
      }
    }
    return clean;
  }

  /**
   * RBAC Guard: Verify user has required role
   */
  static authorizeRoles(userRole, allowedRoles) {
    if (!allowedRoles.includes(userRole)) {
      const err = new Error(`Access Forbidden: User role '${userRole}' is not authorized for this resource.`);
      err.statusCode = 403;
      throw err;
    }
  }
}

module.exports = SecurityEngine;
