class CacheEntry {
  constructor(hash, agentId, inputText, response) {
    this.hash = hash;
    this.agentId = agentId;
    this.inputText = inputText;
    this.response = response;
    this.createdAt = new Date();
    this.lastAccessed = new Date();
    this.accessCount = 1;
  }

  updateAccess() {
    this.lastAccessed = new Date();
    this.accessCount++;
  }

  static validate(data) {
    const errors = [];
    
    if (!data.hash || data.hash.trim().length === 0) {
      errors.push('El hash es requerido');
    }
    
    if (!data.agentId) {
      errors.push('El ID del agente es requerido');
    }
    
    if (!data.inputText || data.inputText.trim().length === 0) {
      errors.push('El texto de entrada es requerido');
    }
    
    if (!data.response || data.response.trim().length === 0) {
      errors.push('La respuesta es requerida');
    }
    
    return errors;
  }
}

module.exports = CacheEntry;