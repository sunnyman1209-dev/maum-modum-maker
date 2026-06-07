import { useState } from 'react';
import { SiteGate } from './components/SiteGate';
import { StudentView } from './components/StudentView';
import { TeacherView } from './components/TeacherView';
import type { TabId } from './types';

function App() {
  const [tab, setTab] = useState<TabId>('student');

  return (
    <SiteGate>
    <div className="wrap">
      <header>
        <h1>강점 모둠 메이커</h1>
        <p>나의 MBTI와 잘하는 것을 내면, AI가 역할이 골고루 섞이게 모둠을 짜줘요</p>
      </header>

      <div className="tabs">
        <button
          className={`tab${tab === 'student' ? ' on' : ''}`}
          type="button"
          onClick={() => setTab('student')}
        >
          학생 제출
        </button>
        <button
          className={`tab${tab === 'teacher' ? ' on' : ''}`}
          type="button"
          onClick={() => setTab('teacher')}
        >
          🔒 AI 모둠 편성
        </button>
      </div>

      {tab === 'student' ? <StudentView /> : <TeacherView />}
    </div>
    </SiteGate>
  );
}

export default App;
