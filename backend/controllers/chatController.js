const axios = require('axios');

const chat = async (req, res) => {
  const { message, history = [] } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ success: false, message: 'A chat message is required.' });
  }

  if (!apiKey) {
    return res.json({
      success: true,
      reply: 'The assistant is ready, but the Groq API key is not configured yet. Add GROQ_API_KEY to backend/.env and restart the backend for live AI answers.',
      configured: false,
    });
  }

  const safeHistory = Array.isArray(history)
    ? history
        .filter(item => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
        .slice(-10)
    : [];

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: process.env.GROQ_CHAT_MODEL || 'qwen/qwen3.8-27b',
        messages: [
          {
            role: 'system',
            content: 'You are PrescientIQ Assistant. Give concise, practical answers about predictive operations, dashboards, forecasts, alerts, and resource planning.',
          },
          ...safeHistory,
          { role: 'user', content: message.trim() },
        ],
        temperature: 0.3,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(502).json({ success: false, message: 'The chat provider returned an empty response.' });
    }

    return res.json({ success: true, reply });
  } catch (error) {
    const providerMessage = error.response?.data?.error?.message;
    console.error(`[chat] Provider request failed: ${providerMessage || error.message}`);
    return res.status(502).json({
      success: false,
      message: providerMessage || 'The chat service is temporarily unavailable.',
    });
  }
};

module.exports = { chat };
