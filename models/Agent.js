class Agent {
  constructor(id, name, description, tokenLimit) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.tokenLimit = tokenLimit;
    this.createdAt = new Date();
  }

  static validate(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('El nombre es requerido');
    }
    
    if (!data.description || data.description.trim().length === 0) {
      errors.push('La descripción es requerida');
    }
    
    if (!data.tokenLimit || isNaN(data.tokenLimit) || data.tokenLimit <= 0) {
      errors.push('El límite de tokens debe ser un número positivo');
    }
    
    return errors;
  }
}

module.exports = Agent;