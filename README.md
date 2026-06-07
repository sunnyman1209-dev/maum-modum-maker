# 강점 모둠 메이커

MBTI와 강점(리더·제작·발표·자료조사)을 바탕으로 AI가 균형 잡힌 모둠을 편성해 주는 교실용 웹앱입니다.

## 기능

- **학생 제출**: 이름(2글자), MBTI, 강점 선택 후 Supabase에 저장
- **접속 비밀번호**: 앱 진입 시 `znznzn` (환경변수 `VITE_SITE_PASSWORD`)
- **선생님 편성**: 비밀번호 보호, 제출 현황 확인, AI 모둠 편성
- **AI 편성 실패 시**: MBTI·강점 균형 알고리즘으로 자동 대체

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # 값 채우기
npm run dev
```

## Vercel 배포

```bash
npx vercel login
npx vercel --prod
```

### 환경 변수 (Vercel Project Settings)

| 변수 | 설명 |
|------|------|
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |
| `VITE_SITE_PASSWORD` | 앱 접속 비밀번호 (`znznzn`) |
| `ANTHROPIC_API_KEY` | AI 모둠 편성 (선택) |

## Supabase 설정

SQL Editor에서 `supabase-schema.sql` 실행

## 프로젝트 구조

```
src/components/   # StudentView, TeacherView, SiteGate
src/lib/          # store, grouping
api/              # Vercel Serverless (AI 프록시)
```
