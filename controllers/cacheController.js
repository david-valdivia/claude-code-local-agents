const CacheEntry = require('../models/CacheEntry');

let cache = new Map();

const cacheController = {
  getByHash: (hash) => {
    const entry = cache.get(hash);
    if (entry) {
      entry.updateAccess();
      return entry;
    }
    return null;
  },

  set: (hash, agentId, inputText, response) => {
    const errors = CacheEntry.validate({ hash, agentId, inputText, response });
    if (errors.length > 0) {
      throw new Error('Datos de cache inválidos: ' + errors.join(', '));
    }

    const entry = new CacheEntry(hash, agentId, inputText, response);
    cache.set(hash, entry);
    return entry;
  },

  deleteByHash: (hash) => {
    return cache.delete(hash);
  },

  clear: () => {
    cache.clear();
  },

  getStats: () => {
    const entries = Array.from(cache.values());
    return {
      totalEntries: entries.length,
      totalSize: JSON.stringify(Array.from(cache.entries())).length,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.createdAt.getTime())) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.createdAt.getTime())) : null,
      totalAccesses: entries.reduce((sum, e) => sum + e.accessCount, 0)
    };
  },

  getAllEntries: () => {
    return Array.from(cache.values()).map(entry => ({
      hash: entry.hash,
      agentId: entry.agentId,
      inputText: entry.inputText.substring(0, 100) + (entry.inputText.length > 100 ? '...' : ''),
      createdAt: entry.createdAt,
      lastAccessed: entry.lastAccessed,
      accessCount: entry.accessCount
    }));
  },

  cleanOldEntries: (maxAge = 24 * 60 * 60 * 1000) => {
    const now = Date.now();
    let deletedCount = 0;
    
    for (const [hash, entry] of cache.entries()) {
      if (now - entry.lastAccessed.getTime() > maxAge) {
        cache.delete(hash);
        deletedCount++;
      }
    }
    
    return deletedCount;
  },

  deleteByAgentAndText: (agentId, inputText) => {
    const HashGenerator = require('../utils/hashGenerator');
    const hash = HashGenerator.generateHash(agentId, inputText);
    return cache.delete(hash);
  }
};

module.exports = cacheController;