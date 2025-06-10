const { spawn } = require('child_process');
const path = require('path');
const HashGenerator = require('../utils/hashGenerator');
const cacheController = require('./cacheController');

const processController = {
  processText: async (req, res) => {
    try {
      const { agentId, text, bypassCache = false } = req.body;

      if (!agentId || !text) {
        return res.status(400).json({ error: 'AgentId y texto son requeridos' });
      }

      const agentController = require('./agentController');
      
      let agents = [];
      const mockReq = {};
      const mockRes = {
        json: (data) => { agents = data; }
      };
      
      agentController.getAllAgents(mockReq, mockRes);
      const selectedAgent = agents.find(a => a.id === parseInt(agentId));

      if (!selectedAgent) {
        return res.status(404).json({ error: 'Agente no encontrado' });
      }

      const hash = HashGenerator.generateHash(agentId, text);

      if (!bypassCache) {
        const cachedEntry = cacheController.getByHash(hash);
        if (cachedEntry) {
          console.log(`Cache hit for hash: ${hash}`);
          return res.json({ 
            processedText: cachedEntry.response,
            agent: selectedAgent.name,
            fromCache: true,
            hash: hash,
            cacheInfo: {
              createdAt: cachedEntry.createdAt,
              accessCount: cachedEntry.accessCount
            }
          });
        }
      }

      console.log(`Processing new request with hash: ${hash}`);

      const processedText = await processWithClaude(
        selectedAgent.name,
        selectedAgent.description,
        text,
        selectedAgent.tokenLimit
      );
      
      cacheController.set(hash, agentId, text, processedText);
      
      res.json({ 
        processedText,
        agent: selectedAgent.name,
        fromCache: false,
        hash: hash
      });

    } catch (error) {
      console.error('Error procesando texto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  clearCache: (req, res) => {
    try {
      const { agentId, text } = req.body;
      
      if (agentId && text) {
        const deleted = cacheController.deleteByAgentAndText(agentId, text);
        res.json({ 
          success: true, 
          deleted,
          message: deleted ? 'Cache eliminado para esta consulta' : 'No se encontró cache para esta consulta'
        });
      } else {
        cacheController.clear();
        res.json({ 
          success: true, 
          message: 'Toda la cache ha sido eliminada' 
        });
      }
    } catch (error) {
      console.error('Error limpiando cache:', error);
      res.status(500).json({ error: 'Error al limpiar cache' });
    }
  },

  getCacheStats: (req, res) => {
    try {
      const stats = cacheController.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error obteniendo estadísticas de cache:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }
};

async function processWithClaude(agentName, agentDescription, inputText, tokenLimit) {
  return new Promise((resolve, reject) => {
    // Preparar el prompt de contexto para Claude
    const contextPrompt = `Actúa como: ${agentName}. ${agentDescription}. Responde desde tu especialización y rol específico. Límite aproximado: ${tokenLimit} tokens.`;

    console.log('Ejecutando Claude con contexto:', agentName);
    
    // Usar echo para pasar el inputText por pipe a claude -p
    const command = `echo ${JSON.stringify(inputText)} | claude -p ${JSON.stringify(contextPrompt)}`;
    
    const claudeProcess = spawn('bash', ['-c', command], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    claudeProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    claudeProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    claudeProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Claude response received successfully');
        resolve(output.trim());
      } else {
        console.error('Claude process error:', errorOutput);
        reject(new Error(`Claude process failed with code ${code}: ${errorOutput}`));
      }
    });

    claudeProcess.on('error', (error) => {
      console.error('Failed to start Claude process:', error);
      reject(new Error('No se pudo iniciar Claude. Asegúrate de que Claude CLI esté instalado y disponible en PATH.'));
    });

    // Timeout después de 60 segundos
    setTimeout(() => {
      if (!claudeProcess.killed) {
        claudeProcess.kill();
        reject(new Error('Timeout: Claude no respondió en 60 segundos'));
      }
    }, 60000);
  });
}

module.exports = processController;