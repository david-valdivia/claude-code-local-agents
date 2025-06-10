const crypto = require('crypto');

class HashGenerator {
  static generateHash(agentId, inputText) {
    const data = `${agentId}:${inputText.trim()}`;
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
  }

  static generateUniqueId() {
    return crypto.randomBytes(16).toString('hex');
  }

  static validateHash(hash) {
    return hash && typeof hash === 'string' && hash.length === 64;
  }
}

module.exports = HashGenerator;