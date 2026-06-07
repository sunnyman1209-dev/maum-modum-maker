import { STRENGTHS } from '../constants';
import type { Group, GroupMember, StrMode, StudentSubmission } from '../types';

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function localBuild(students: StudentSubmission[], groupCount: number, mode: StrMode): Group[] {
  const groups: Group[] = Array.from({ length: groupCount }, () => ({ members: [], reason: '' }));
  let order: StudentSubmission[] = [];

  if (mode === 'ignore') {
    for (const key of ['EN', 'IN', 'ES', 'IS', '??'] as const) {
      const arr = students.filter((s) => {
        const k = s.ei + s.ns;
        return key === '??' ? !['EN', 'IN', 'ES', 'IS'].includes(k) : k === key;
      });
      order = order.concat(shuffle(arr));
    }
  } else {
    for (const si of [0, 1, 2, 3]) {
      let arr = students.filter((s) => s.str === si);
      arr = shuffle(arr);
      arr.sort((a, b) => (a.ei + a.ns).localeCompare(b.ei + b.ns));
      order = order.concat(arr);
    }
  }

  let idx = 0;
  let dir = 1;
  for (const s of order) {
    groups[idx].members.push(s);
    idx += dir;
    if (idx >= groupCount) {
      idx = groupCount - 1;
      dir = -1;
    } else if (idx < 0) {
      idx = 0;
      dir = 1;
    }
  }

  return groups;
}

export async function aiBuild(
  students: StudentSubmission[],
  groupCount: number,
  mode: StrMode,
): Promise<Group[]> {
  const data = students.map((s) => ({
    name: s.name,
    mbti: s.mbti,
    ei: s.ei,
    ns: s.ns,
    strength: STRENGTHS[s.str].lab,
  }));

  const res = await fetch('/api/group-assign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ students: data, groupCount, mode }),
  });

  if (!res.ok) throw new Error('AI request failed');

  const parsed = (await res.json()) as { groups: { members: string[]; reason?: string }[] };
  const byName: Record<string, StudentSubmission> = {};
  students.forEach((s) => {
    byName[s.name] = s;
  });

  const used: Record<string, number> = {};
  const groups: Group[] = parsed.groups.map((g) => {
    const mems: GroupMember[] = (g.members ?? []).map((nm) => {
      used[nm] = 1;
      const fallback: GroupMember = {
        name: nm,
        ei: 'E',
        ns: 'N',
        mbti: '????',
        str: 0,
        ts: 0,
      };
      return byName[nm] ?? fallback;
    });
    return { members: mems, reason: g.reason ?? '' };
  });

  for (const s of students.filter((st) => !used[st.name])) {
    groups.reduce((a, b) => (b.members.length < a.members.length ? b : a)).members.push(s);
  }

  return groups;
}
