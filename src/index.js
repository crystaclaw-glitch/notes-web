// Cloudflare Worker entry point.
// Serves the static site from /public (via the ASSETS binding) and
// handles POST /api/submit to store the answer + notify Telegram.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/submit' && request.method === 'POST') {
      return handleSubmit(request, env);
    }

    // everything else -> serve the static site
    return env.ASSETS.fetch(request);
  }
};

async function handleSubmit(request, env) {
  try {
    const data = await request.json();
    const answer = (data.answer || '').toString().slice(0, 500);
    const pageUrl = (data.page_url || '').toString().slice(0, 300);
    const timestamp = new Date().toISOString();

    if (!answer) {
      return json({ ok: false, error: 'empty answer' }, 400);
    }

    // 1. store to KV if bound (acts as the "database")
    if (env.ANSWERS_KV) {
      const key = `answer:${timestamp}:${Math.random().toString(36).slice(2, 8)}`;
      await env.ANSWERS_KV.put(key, JSON.stringify({ answer, pageUrl, timestamp }));
    }

    // 2. notify Telegram in real time
    const text =
      `Jawaban baru masuk!\n\n` +
      `Jawaban: ${answer}\n` +
      `Halaman: ${pageUrl || '-'}\n` +
      `Waktu: ${timestamp}`;

    const tgUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text })
    });

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: 'server error' }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
