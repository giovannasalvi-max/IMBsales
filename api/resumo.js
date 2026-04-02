module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { prompt, tipo } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt obrigatório' });

  const instrucao = tipo === 'spin'
    ? `Você é um consultor sênior de vendas B2B com experiência em eventos corporativos de alto nível. 
Analise o histórico desta negociação e dê UMA sugestão direta e elegante de como avançar.

Regras:
- Tom consultivo e profissional, nunca agressivo ou de pressão
- Sem urgência artificial, sem descontos inventados, sem gatilhos baratos
- Baseado no que o cliente realmente sinalizou no histórico
- Respeite o timing que o cliente pediu, mas sugira uma forma inteligente de manter contato até lá
- No máximo 4 linhas
- Sem asteriscos, sem negrito, sem marcadores. Só texto corrido.
- Fale como um colega experiente e elegante falaria, não como script de telemarketing`
    : `Você é um assistente de vendas objetivo.
Resuma em no máximo 3 linhas curtas e corridas, sem negrito, sem asteriscos, sem marcadores, sem títulos. Só texto simples: o que foi feito, onde parou e qual o próximo passo combinado.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{ role: 'user', content: instrucao + '\n\nHistórico:\n' + prompt }]
      })
    });
    const data = await response.json();
    const texto = data.content?.map(c => c.text || '').join('') || 'Não foi possível gerar.';
    res.status(200).json({ texto });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao conectar com a IA.' });
  }
}
