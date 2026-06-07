export interface Strength {
  lab: string;
  ico: string;
}

export interface StudentSubmission {
  name: string;
  mbti: string;
  ei: 'E' | 'I';
  ns: 'N' | 'S';
  str: number;
  ts: number;
}

export interface GroupMember extends StudentSubmission {
  mbti: string;
}

export interface Group {
  members: GroupMember[];
  reason: string;
}

export type MbtiDim = 'ei' | 'ns' | 'tf' | 'jp';
export type MbtiPick = Record<MbtiDim, 'E' | 'I' | 'N' | 'S' | 'T' | 'F' | 'J' | 'P' | null>;
export type StrMode = 'spread' | 'ignore';
export type TabId = 'student' | 'teacher';
export type LockView = 'enter' | 'panel';
