import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

os.userInfo = () => ({
  uid: -1,
  gid: -1,
  username: 'vercel-user',
  homedir: os.homedir(),
  shell: null,
});

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

const result = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['vercel', ...args],
  {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ?? 'https://zikzohexsqnscfzvvzxt.supabase.co',
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_raVj68nvxg_qeTSTsiMkKw_G1DZR0E_',
      VITE_SITE_PASSWORD: process.env.VITE_SITE_PASSWORD ?? '1111',
      VITE_TEACHER_PASSWORD: process.env.VITE_TEACHER_PASSWORD ?? '1234',
    },
    shell: true,
  },
);

process.exit(result.status ?? 1);
