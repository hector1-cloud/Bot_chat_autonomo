import process from 'node:process';

const port = Number(process.env.PORT || 3000);
const token = process.env.AGENT_TOKEN || '';
const interval = Number(process.env.AGENT_POLL_MS || 5000);

async function poll() {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/universe/state`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!response.ok) throw new Error(`API ${response.status}`);
    const state = await response.json();
    console.log(`[local-agent] PRISM opcional · actividad=${state.activity}% · entidades=${state.entities}`);
  } catch (error) {
    console.warn(`[local-agent] API no disponible: ${error.message}`);
  }
}

console.log(`[local-agent] agente local iniciado; PRISM_WINDOW_TITLE=${process.env.PRISM_WINDOW_TITLE || '(no configurado)'}`);
await poll();
setInterval(poll, interval);
