import type { VercelRequest, VercelResponse } from '@vercel/node';

interface StudentPayload {
  name: string;
  mbti: string;
  ei: string;
  ns: string;
  strength: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI service not configured' });
  }

  const { students, groupCount, mode } = req.body as {
    students: StudentPayload[];
    groupCount: number;
    mode: 'spread' | 'ignore';
  };

  const strRule =
    mode === 'ignore'
      ? '3) 강점은 편성에 반영하지 마세요. MBTI 균형만 고려합니다.\n'
      : '3) 각 모둠에 네 가지 강점(리더·제작·발표·자료조사)이 고루 들어가도록 배분하세요. 이상적으로는 모둠마다 리더 한 명을 두고, 제작·발표·자료조사도 한 모둠에 같은 강점이 몰리지 않게 분산합니다. 특정 강점을 가진 학생이 모둠 수보다 적으면 최대한 많은 모둠에 한 명씩 가도록 나눠 주세요.\n';

  const prompt =
    `다음 학생들을 ${groupCount}개 모둠으로 나눠 주세요. 규칙:\n` +
    '1) 각 모둠에 외향(E)과 내향(I)이 한쪽으로 치우치지 않게 섞기\n' +
    '2) 각 모둠에 직관(N)과 감각(S)이 고르게 들어가게 섞기\n' +
    strRule +
    '4) 모둠 인원은 최대한 비슷하게\n' +
    '모든 학생을 빠짐없이 정확히 한 모둠에만 배정하세요.\n\n' +
    `학생들:\n${JSON.stringify(students)}\n\n` +
    '반드시 아래 JSON 형식으로만 답하세요. 설명, 마크다운, 코드블록 금지.\n' +
    '{"groups":[{"members":["이름1","이름2"],"reason":"20자 이내 한국어 배치 이유"}]}';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'AI provider error' });
    }

    const json = (await response.json()) as {
      content?: { type: string; text?: string }[];
    };

    const text = (json.content ?? [])
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('')
      .trim()
      .replace(/```json|```/g, '')
      .trim();

    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);
  } catch {
    return res.status(500).json({ error: 'Failed to generate groups' });
  }
}
