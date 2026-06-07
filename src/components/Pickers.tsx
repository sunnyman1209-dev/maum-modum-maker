import { MBTI_ROWS } from '../constants';
import type { MbtiDim, MbtiPick } from '../types';

interface MbtiPickerProps {
  pick: MbtiPick;
  onChange: (dim: MbtiDim, val: string) => void;
}

export function MbtiPicker({ pick, onChange }: MbtiPickerProps) {
  return (
    <div id="mbtiPick">
      {MBTI_ROWS.map(({ dim, options }) => (
        <div className="seg-row" key={dim}>
          <div className="seg">
            {options.map(({ val, label }) => (
              <div
                key={val}
                className={`opt${pick[dim] === val ? ' sel' : ''}`}
                onClick={() => onChange(dim, val)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onChange(dim, val)}
              >
                <b>{val}</b>
                <small>{label}</small>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface StrengthPickerProps {
  selected: number | null;
  onChange: (idx: number) => void;
}

const STRENGTH_ITEMS = [
  { str: 0, ico: '👑', lab: '리더', desc: '이끌고 정리하기' },
  { str: 1, ico: '🛠️', lab: '제작', desc: '만들고 꾸미기' },
  { str: 2, ico: '🎤', lab: '발표', desc: '말하고 전달하기' },
  { str: 3, ico: '🔎', lab: '자료조사', desc: '찾고 분석하기' },
];

export function StrengthPicker({ selected, onChange }: StrengthPickerProps) {
  return (
    <div className="strengths" id="strPick">
      {STRENGTH_ITEMS.map(({ str, ico, lab, desc }) => (
        <div
          key={str}
          className={`str${selected === str ? ' sel' : ''}`}
          onClick={() => onChange(str)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onChange(str)}
        >
          <div className="ico">{ico}</div>
          <div className="lab">{lab}</div>
          <div className="desc">{desc}</div>
        </div>
      ))}
    </div>
  );
}

interface GroupResultsProps {
  groups: import('../types').Group[] | null;
  loading: boolean;
}

export function GroupResults({ groups, loading }: GroupResultsProps) {
  if (loading) {
    return (
      <div className="thinking">
        🤖 AI가 모둠을 고민하는 중
        <span className="dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </div>
    );
  }

  if (!groups?.length) return null;

  return (
    <div className="groups">
      {groups.map((g, i) => {
        const ms = g.members;
        const e = ms.filter((s) => s.ei === 'E').length;
        const ic = ms.filter((s) => s.ei === 'I').length;
        const n = ms.filter((s) => s.ns === 'N').length;
        const sc = ms.filter((s) => s.ns === 'S').length;

        return (
          <div className={`grp g${i % 8}`} key={i}>
            <h3>
              {i + 1}모둠 <span style={{ fontSize: 14, opacity: 0.7 }}>({ms.length}명)</span>
            </h3>
            {ms.map((s) => (
              <div className="m" key={s.name}>
                <span className="ico-sm">
                  {s.str != null ? ['👑', '🛠️', '🎤', '🔎'][s.str] : ''}
                </span>
                {s.name}{' '}
                <span style={{ fontFamily: 'monospace', fontSize: 12, opacity: 0.65 }}>{s.mbti}</span>
              </div>
            ))}
            <div className="bal">
              E {e} / I {ic}　·　N {n} / S {sc}
            </div>
            {g.reason && <div className="reason">💡 {g.reason}</div>}
          </div>
        );
      })}
    </div>
  );
}
