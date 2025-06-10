const fetch = require('node-fetch');

// Summarize up to 4 insights (first 2 and last 2, or fewer if not available) using OpenAI.
// insights: array of insight strings
// apiKey: OpenAI API key
// Returns: Promise that resolves to the summary string
async function summarizeInsights(insights, apiKey) {
  if (!Array.isArray(insights) || insights.length === 0) {
    throw new Error('No insights provided');
  }

  // Select insights: first 2 and last 2, avoiding duplicates
  let selected = [];
  if (insights.length >= 4) {
    selected = [insights[0], insights[1], insights[insights.length - 2], insights[insights.length - 1]];
  } else {
    selected = insights;
  }


const prompt = `
You are an expert medical assistant. Analyze the following clinical insights, which include both current and previous symptoms and conditions. Structure your summary with clear sections for "Previous Status" and "Current Status", highlighting any changes or progression. Then provide "Key Findings" and "Recommendations". Avoid repeating information and ensure the summary reflects both continuity and new developments in the patient's health.

Insights:
${selected.map((insight, idx) => `${idx + 1}. ${insight}`).join('\n')}

Summary:
- Previous Status:
- Current Status:
- Key Findings:
- Recommendations:
`;


  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 300
    })
  });

  if (!response.ok) throw new Error(`Summary generation failed: ${response.statusText}`);
  const data = await response.json();
  return data.choices[0].message.content.trim();
}

module.exports = { summarizeInsights };