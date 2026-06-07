import { useEffect, useState } from 'react';
import { STRENGTHS } from '../constants';
import { isCloudStorage, slug, storeGet, storeSet } from '../lib/store';
import type { MbtiDim, MbtiPick } from '../types';
import { MbtiPicker, StrengthPicker } from './Pickers';

const emptyPick: MbtiPick = { ei: null, ns: null, tf: null, jp: null };

export function StudentView() {
  const [name, setName] = useState('');
  const [pick, setPick] = useState<MbtiPick>({ ...emptyPick });
  const [strSel, setStrSel] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [doneSummary, setDoneSummary] = useState({ name: '', mbti: '', str: 0 });
  const [storeStatus, setStoreStatus] = useState('');

  useEffect(() => {
    setStoreStatus(
      isCloudStorage()
        ? '✓ 친구들의 제출이 Supabase에 모여요'
        : '⚠ Supabase 미연결 — .env에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY를 설정해 주세요.',
    );
  }, []);

  const handleMbtiChange = (dim: MbtiDim, val: string) => {
    setPick((prev) => ({ ...prev, [dim]: val as MbtiPick[MbtiDim] }));
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (/\s/.test(trimmed) || [...trimmed].length !== 2) {
      alert('이름은 띄어쓰기 없이 두 글자로 입력해 주세요.');
      return;
    }
    if (!pick.ei || !pick.ns || !pick.tf || !pick.jp) {
      alert('MBTI 네 가지를 모두 골라 주세요.');
      return;
    }
    if (strSel === null) {
      alert('제일 잘하는 것을 골라 주세요.');
      return;
    }

    try {
      const existing = await storeGet(slug(trimmed));
      if (existing) {
        alert(
          `'${trimmed}' 이름으로는 이미 제출되어 있어요. 같은 이름으로는 다시 낼 수 없어요. 잘못 입력했다면 선생님께 말씀드려 주세요.`,
        );
        return;
      }

      const mbti = `${pick.ei}${pick.ns}${pick.tf}${pick.jp}`;
      const rec = {
        name: trimmed,
        mbti,
        ei: pick.ei,
        ns: pick.ns,
        str: strSel,
        ts: Date.now(),
      };

      await storeSet(slug(trimmed), JSON.stringify(rec));
      setDoneSummary({ name: trimmed, mbti, str: strSel });
      setSubmitted(true);
    } catch {
      alert('저장에 실패했어요. Supabase 설정을 확인해 주세요.');
    }
  };

  if (submitted) {
    return (
      <section id="studentView">
        <div className="card">
          <div className="done">
            <div className="big">🎉</div>
            <h2>{doneSummary.name} 제출 완료!</h2>
            <p style={{ color: 'var(--muted)', margin: '4px 0 14px' }}>AI가 모둠을 짤 때 반영돼요</p>
            <div>
              <span className="pill">{doneSummary.mbti}</span>
              <span className="pill">
                {STRENGTHS[doneSummary.str].ico} {STRENGTHS[doneSummary.str].lab}
              </span>
            </div>
            <p className="note">잘못 입력했다면 선생님께 말씀드려 주세요.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="studentView">
      <div className="card">
        <label className="fld">
          이름 <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--muted)' }}>(두 글자)</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름 두 글자"
          autoComplete="off"
          maxLength={2}
        />

        <label className="fld" style={{ marginTop: 18 }}>
          나의 MBTI
        </label>
        <MbtiPicker pick={pick} onChange={handleMbtiChange} />

        <label className="fld" style={{ marginTop: 18 }}>
          내가 제일 잘하는 것
        </label>
        <StrengthPicker selected={strSel} onChange={setStrSel} />

        <div style={{ marginTop: 22 }}>
          <button className="btn" type="button" onClick={handleSubmit}>
            제출하기
          </button>
        </div>
        <p className="status">{storeStatus}</p>
      </div>
    </section>
  );
}
