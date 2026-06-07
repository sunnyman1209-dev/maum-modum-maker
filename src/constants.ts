import type { Strength } from './types';

export const STRENGTHS: Strength[] = [
  { lab: '리더', ico: '👑' },
  { lab: '제작', ico: '🛠️' },
  { lab: '발표', ico: '🎤' },
  { lab: '자료조사', ico: '🔎' },
];

export const MBTI_ROWS: { dim: 'ei' | 'ns' | 'tf' | 'jp'; options: { val: string; label: string }[] }[] = [
  { dim: 'ei', options: [{ val: 'E', label: '외향' }, { val: 'I', label: '내향' }] },
  { dim: 'ns', options: [{ val: 'N', label: '직관' }, { val: 'S', label: '감각' }] },
  { dim: 'tf', options: [{ val: 'T', label: '사고' }, { val: 'F', label: '감정' }] },
  { dim: 'jp', options: [{ val: 'J', label: '계획' }, { val: 'P', label: '탐색' }] },
];
