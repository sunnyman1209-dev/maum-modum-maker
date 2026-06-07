import { useState } from 'react';

const SITE_PASSWORD = import.meta.env.VITE_SITE_PASSWORD as string | undefined;
const UNLOCK_KEY = 'maum-modum-unlocked';

function isUnlocked(): boolean {
  if (!SITE_PASSWORD) return true;
  return sessionStorage.getItem(UNLOCK_KEY) === '1';
}

interface SiteGateProps {
  children: React.ReactNode;
}

export function SiteGate({ children }: SiteGateProps) {
  const [unlocked, setUnlocked] = useState(isUnlocked);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  if (!SITE_PASSWORD || unlocked) return <>{children}</>;

  const handleEnter = () => {
    if (pw === SITE_PASSWORD) {
      sessionStorage.setItem(UNLOCK_KEY, '1');
      setUnlocked(true);
      setErr('');
      return;
    }
    setErr('비밀번호가 맞지 않아요.');
  };

  return (
    <div className="wrap">
      <div className="card">
        <div className="lock">
          <div className="big">🔒</div>
          <h2>접속 비밀번호</h2>
          <p>선생님이 알려준 비밀번호를 입력하세요.</p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
            placeholder="비밀번호"
            autoComplete="off"
          />
          <button className="btn" type="button" onClick={handleEnter} style={{ maxWidth: 260, margin: '0 auto' }}>
            입장
          </button>
          <div className="err">{err}</div>
        </div>
      </div>
    </div>
  );
}
