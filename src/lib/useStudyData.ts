// 저장 데이터 구독 훅 — 🔒 팀장 소유.
// 화면(컴포넌트)은 저장 데이터를 이 훅으로 읽는다. storage.ts의 쓰기 함수가 호출되면
// "studyapp:change" 이벤트가 발생하고, 이 훅을 쓰는 모든 화면이 즉시 다시 그려진다.
// 쓰기는 지금처럼 storage.ts 함수(recordAnswer, saveProfile, voteTip)를 직접 호출한다.
import { useEffect, useState } from "react";
import type { Profile, QuestionStat, StudyLog, TipVote } from "../types";
import {
  STORAGE_KEYS,
  STUDY_CHANGE_EVENT,
  getProfile,
  getStats,
  getStudyLogs,
  getTipVotes,
} from "./storage";

export interface StudyData {
  profile: Profile | null;
  stats: Record<string, QuestionStat>;
  logs: StudyLog[];
  tipVotes: TipVote[];
}

function readStudyData(): StudyData {
  return {
    profile: getProfile(),
    stats: getStats(),
    logs: getStudyLogs(),
    tipVotes: getTipVotes(),
  };
}

const OUR_KEYS = new Set<string>(Object.values(STORAGE_KEYS));

export function useStudyData(): StudyData {
  const [data, setData] = useState<StudyData>(readStudyData);

  useEffect(() => {
    const refresh = () => setData(readStudyData());
    // 다른 브라우저 탭에서 바뀐 경우도 반영 (key가 null이면 전체 삭제)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || OUR_KEYS.has(event.key)) refresh();
    };

    window.addEventListener(STUDY_CHANGE_EVENT, refresh);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(STUDY_CHANGE_EVENT, refresh);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return data;
}
