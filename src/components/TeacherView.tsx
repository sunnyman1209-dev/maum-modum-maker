import { useCallback, useEffect, useState } from 'react';
import { STRENGTHS } from '../constants';
import { aiBuild, localBuild } from '../lib/grouping';
import { storeClear, storeGet, storeList, storeSet } from '../lib/store';
import type { Group, LockView, StrMode, StudentSubmission } from '../types';
import { GroupResults } from './Pickers';

export function TeacherView() {
  const [lockView, setLockView] = useState<LockView>('enter');
  const [pwNew, setPwNew] = useState('');
  const [pwIn, setPwIn] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [subs, setSubs] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupCount, setGroupCount] = useState(4);
  const [strMode, setStrMode] = useState<StrMode>('spread');
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [making, setMaking] = useState(false);

  const loadSubs = useCallback(async () => {
    setLoading(true);
    try {
      const vals = await storeList('sub:');
      const parsed: StudentSubmission[] = [];
      for (const v of vals) {
        try {
          parsed.push(JSON.parse(v));
        } catch {
          /* skip invalid */
        }
      }
      parsed.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
      setSubs(parsed);
    } catch {
      alert('제출 목록을 불러오지 못했어요. Supabase 설정을 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  const openTeacher = useCallback(async () => {
    try {
      const pw = await storeGet('cfg:tpw');
      if (!pw) {
        setLockView('set');
        setPwNew('');
      } else {
        setLockView('enter');
        setPwIn('');
        setPwErr('');
      }
    } catch {
      setLockView('enter');
      setPwErr('Supabase 연결을 확인해 주세요.');
    }
  }, []);

  useEffect(() => {
    openTeacher();
  }, [openTeacher]);

  const handleSetPw = async () => {
    if (pwNew.trim().length < 2) {
      alert('비밀번호를 2자 이상 입력해 주세요.');
      return;
    }
    await storeSet('cfg:tpw', pwNew.trim());
    setLockView('panel');
    loadSubs();
  };

  const handleEnterPw = async () => {
    const pw = await storeGet('cfg:tpw');
    if (pwIn === pw) {
      setLockView('panel');
      loadSubs();
    } else {
      setPwErr('비밀번호가 맞지 않아요.');
    }
  };

  const handleChangePw = async () => {
    const np = prompt('새 비밀번호를 입력하세요 (2자 이상)');
    if (np === null) return;
    const trimmed = np.trim();
    if (trimmed.length < 2) {
      alert('2자 이상이어야 해요.');
      return;
    }
    await storeSet('cfg:tpw', trimmed);
    alert('비밀번호를 바꿨어요.');
  };

  const handleClear = async () => {
    if (!confirm('모든 제출 데이터를 삭제할까요? 되돌릴 수 없어요.')) return;
    await storeClear('sub:');
    loadSubs();
    setGroups(null);
  };

  const handleMake = async () => {
    if (!subs.length) {
      alert('제출한 학생이 없어요. "새로고침"으로 먼저 확인해 주세요.');
      return;
    }
    let gc = Math.max(1, groupCount || 1);
    if (gc > subs.length) gc = subs.length;

    setMaking(true);
    setGroups(null);

    try {
      const result = await aiBuild(subs, gc, strMode);
      setGroups(result);
    } catch {
      const fallback = localBuild(subs, gc, strMode);
      fallback[0].reason = 'AI 연결이 어려워 기본 균형 방식으로 편성했어요';
      setGroups(fallback);
    } finally {
      setMaking(false);
    }
  };

  const renderStrengthOverview = () => {
    if (!subs.length) return null;

    const cnt = [0, 0, 0, 0];
    subs.forEach((s) => {
      cnt[s.str]++;
    });

    const gc = Math.max(1, groupCount || 1);
    const missing = STRENGTHS.filter((_, i) => cnt[i] === 0).map((t) => t.lab);
    const scarce = STRENGTHS.filter((_, i) => cnt[i] > 0 && cnt[i] < gc).map((t) => t.lab);

    let msg = '';
    if (missing.length) msg += `<b>${missing.join(', ')}</b> 을(를) 고른 학생이 없어요. `;
    if (scarce.length) msg += `<b>${scarce.join(', ')}</b> 은(는) 모둠 수보다 적어서 일부 모둠엔 없을 수 있어요. `;

    return (
      <div id="strOverview">
        <div className="sbar">
          {STRENGTHS.map((t, i) => (
            <span className="sseg" key={t.lab}>
              {t.ico} {t.lab} {cnt[i]}
            </span>
          ))}
        </div>
        {msg && (
          <div
            className="flag"
            dangerouslySetInnerHTML={{
              __html: `${msg}AI가 최대한 고루 나누지만, 모든 모둠에 모든 역할을 넣긴 어려울 수 있어요.`,
            }}
          />
        )}
      </div>
    );
  };

  if (lockView === 'set') {
    return (
      <section id="teacherView">
        <div className="card">
          <div className="lock">
            <div className="big">🔐</div>
            <h2>편성 비밀번호 만들기</h2>
            <p>학생이 편성 결과를 보거나 바꾸지 못하게, 선생님만 아는 비밀번호를 정해 주세요.</p>
            <input
              type="password"
              value={pwNew}
              onChange={(e) => setPwNew(e.target.value)}
              placeholder="비밀번호 입력"
              autoComplete="new-password"
            />
            <button className="btn" type="button" onClick={handleSetPw} style={{ maxWidth: 260, margin: '0 auto' }}>
              설정하고 입장
            </button>
            <p className="note">
              학생들에게 앱을 나눠주기 <b>전에</b> 먼저 설정하는 걸 권해요.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (lockView === 'enter') {
    return (
      <section id="teacherView">
        <div className="card">
          <div className="lock">
            <div className="big">🔒</div>
            <h2>선생님 전용</h2>
            <p>편성 비밀번호를 입력하세요.</p>
            <input
              type="password"
              value={pwIn}
              onChange={(e) => setPwIn(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEnterPw()}
              placeholder="비밀번호"
              autoComplete="off"
            />
            <button className="btn" type="button" onClick={handleEnterPw} style={{ maxWidth: 260, margin: '0 auto' }}>
              입장
            </button>
            <div className="err">{pwErr}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="teacherView">
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, color: 'var(--teal-dark)', fontSize: 20 }}>
            제출 현황{' '}
            <span id="subCount" style={{ color: 'var(--muted)', fontSize: 16 }}>
              {subs.length ? `(${subs.length}명)` : ''}
            </span>
          </h2>
          <button className="btn ghost" type="button" onClick={loadSubs} style={{ width: 'auto' }}>
            새로고침
          </button>
        </div>

        <div id="roster" className="roster">
          {loading ? (
            <div className="empty">불러오는 중...</div>
          ) : !subs.length ? (
            <div className="empty">
              아직 제출한 학생이 없어요.
              <br />
              학생들이 &quot;학생 제출&quot;에서 입력하면 여기에 모여요.
            </div>
          ) : (
            subs.map((s) => (
              <span className="chip" key={s.name}>
                <span className="ico-sm">{STRENGTHS[s.str].ico}</span>
                {s.name} <span className="mb">{s.mbti}</span>
              </span>
            ))
          )}
        </div>

        {renderStrengthOverview()}

        <div className="ctrls">
          <label className="fld" style={{ margin: 0 }}>
            모둠 개수
          </label>
          <input
            type="number"
            min={1}
            value={groupCount}
            onChange={(e) => setGroupCount(parseInt(e.target.value) || 1)}
          />
        </div>
        <div className="ctrls">
          <label className="fld" style={{ margin: 0 }}>
            강점 활용
          </label>
          <select value={strMode} onChange={(e) => setStrMode(e.target.value as StrMode)}>
            <option value="spread">역할 골고루 섞기 (모둠마다 리더·제작·발표·자료조사)</option>
            <option value="ignore">반영 안 함 (MBTI만)</option>
          </select>
        </div>
        <div className="row">
          <button className="btn" type="button" onClick={handleMake} disabled={making} style={{ flex: 1 }}>
            🤖 AI에게 모둠 편성 맡기기
          </button>
        </div>

        <div id="groupsOut">
          <GroupResults groups={groups} loading={making} />
        </div>

        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <button className="small-link" type="button" onClick={handleChangePw}>
            비밀번호 변경
          </button>
          <span style={{ color: 'var(--line)' }}> | </span>
          <button className="small-link" type="button" onClick={handleClear} style={{ color: 'var(--coral)' }}>
            제출 데이터 전체 초기화
          </button>
        </div>
      </div>
    </section>
  );
}
