const Agent = require('../models/Agent');

let agents = [];
let nextId = 1;

const agentController = {
  getAllAgents: (req, res) => {
    res.json(agents);
  },

  getAgentById: (req, res) => {
    const agent = agents.find(a => a.id === parseInt(req.params.id));
    if (!agent) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }
    res.json(agent);
  },

  createAgent: (req, res) => {
    const { name, description, tokenLimit } = req.body;
    
    const errors = Agent.validate({ name, description, tokenLimit });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const agent = new Agent(nextId++, name.trim(), description.trim(), parseInt(tokenLimit));
    agents.push(agent);
    
    res.status(201).json(agent);
  },

  updateAgent: (req, res) => {
    const agentIndex = agents.findIndex(a => a.id === parseInt(req.params.id));
    if (agentIndex === -1) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }

    const { name, description, tokenLimit } = req.body;
    const errors = Agent.validate({ name, description, tokenLimit });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    agents[agentIndex] = {
      ...agents[agentIndex],
      name: name.trim(),
      description: description.trim(),
      tokenLimit: parseInt(tokenLimit)
    };

    res.json(agents[agentIndex]);
  },

  deleteAgent: (req, res) => {
    const agentIndex = agents.findIndex(a => a.id === parseInt(req.params.id));
    if (agentIndex === -1) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }

    agents.splice(agentIndex, 1);
    res.status(204).send();
  }
};

module.exports = agentController;