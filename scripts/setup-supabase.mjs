#!/usr/bin/env node
/**
 * Supabase Management API로 SQL 실행
 * 사용법:
 *   set SUPABASE_ACCESS_TOKEN=sbp_...
 *   set SUPABASE_PROJECT_REF=your-project-ref
 *   node scripts/setup-supabase.mjs
 *
 * 토큰: https://supabase.com/dashboard/account/tokens
 * ref: 대시보드 URL의 /project/ 뒤 문자열
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF;

if (!token || !projectRef) {
  console.error('SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF 환경변수가 필요합니다.');
  console.error('토큰: https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sql = readFileSync(join(root, 'supabase-schema.sql'), 'utf8');

const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

const body = await res.text();

if (!res.ok) {
  console.error('실행 실패:', res.status, body);
  process.exit(1);
}

console.log('SQL 실행 완료');
console.log(body);
