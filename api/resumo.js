module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { prompt, tipo } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt obrigatório' });

  const instrucao = tipo === 'spin'
    ? `Você é um vendedor experiente e direto. Com base no histórico abaixo, dê UMA única sugestão de como avançar nessa negociação. Sem opções, sem listas, sem termos técnicos. Fale como um colega experiente falaria: direto, com feeling, em no máximo 3 linhas.`
    : `Você é um assistente de vendas. Resuma esse histórico em no máximo 3 linhas: o que foi feito, onde parou e qual o próximo passo. Seja direto e curto.`;

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
        messages: [{ role: 'user', content: instrucao + '\n\n' + prompt }]
      })
    });
    const data = await response.json();
    const texto = data.content?.map(c => c.text || '').join('') || 'Não foi possível gerar.';
    res.status(200).json({ texto });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao conectar com a IA.' });
  }
}
