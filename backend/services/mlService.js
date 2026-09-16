const axios = require('axios');

const ML_BASE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
const TIMEOUT = Number(process.env.ML_SERVICE_TIMEOUT_MS) || 8000;

const client = axios.create({
  baseURL: ML_BASE_URL,
  timeout: TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Wraps every ML call so failures are normalized instead of crashing the request chain.
 * Callers get { ok: true, data } or { ok: false, error } and decide how to degrade gracefully.
 */
const callML = async (path, payload) => {
  try {
    const response = await client.post(path, payload);
    return { ok: true, data: response.data };
  } catch (err) {
    const reason = err.code === 'ECONNABORTED' ? 'ML service timed out' : 'ML service unavailable';
    console.error(`[mlService] ${path} failed: ${reason} - ${err.message}`);
    return { ok: false, error: reason };
  }
};

const checkHealth = async () => {
  try {
    const res = await client.get('/health', { timeout: 3000 });
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, error: 'ML service unreachable' };
  }
};

const predictDemand = (payload) => callML('/predict/demand', payload);
const predictRisk = (payload) => callML('/predict/risk', payload);
const predictResources = (payload) => callML('/predict/resources', payload);
const predictTeamPerformance = (payload) => callML('/predict/team-performance', payload);
const detectAnomaly = (payload) => callML('/detect/anomaly', payload);
const forecast = (payload) => callML('/forecast', payload);

module.exports = {
  checkHealth,
  predictDemand,
  predictRisk,
  predictResources,
  predictTeamPerformance,
  detectAnomaly,
  forecast,
};
