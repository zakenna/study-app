// 타임라인 사건. id 형식: tl-<era>-번호 3자리.
// 규칙: 가능하면 이미 검증된 문제·꿀팁의 연도를 쓴다 / 기원전은 음수 / 모든 사건의 연도는 서로 달라야 한다
// (순서 맞추기 게임에서 같은 연도가 한 라운드에 나오면 순서를 정할 수 없음)
import type { TimelineEvent } from "../types";

export const timelineEvents: TimelineEvent[] = [
  /* ---------- 선사·고조선 ---------- */
  {
    id: "tl-prehistoric-001",
    era: "prehistoric",
    year: -2333,
    title: "고조선 건국 (단군왕검, 『동국통감』 기준 전승)",
  },
  {
    id: "tl-prehistoric-002",
    era: "prehistoric",
    year: -194,
    title: "위만, 고조선의 왕이 됨",
  },
  {
    id: "tl-prehistoric-003",
    era: "prehistoric",
    year: -109,
    title: "한 무제의 고조선 침략 시작",
  },
  {
    id: "tl-prehistoric-004",
    era: "prehistoric",
    year: -108,
    title: "고조선 멸망 (왕검성 함락)",
  },

  /* ---------- 삼국 ---------- */
  {
    id: "tl-three-kingdoms-001",
    era: "three-kingdoms",
    year: 371,
    title: "근초고왕, 평양성 공격",
  },
  {
    id: "tl-three-kingdoms-002",
    era: "three-kingdoms",
    year: 427,
    title: "장수왕, 평양 천도",
    tipId: "tip-three-kingdoms-001",
  },
  {
    id: "tl-three-kingdoms-003",
    era: "three-kingdoms",
    year: 527,
    title: "법흥왕, 불교 공인",
    tipId: "tip-three-kingdoms-002",
  },
  {
    id: "tl-three-kingdoms-004",
    era: "three-kingdoms",
    year: 562,
    title: "진흥왕, 대가야 정복",
  },
  {
    id: "tl-three-kingdoms-005",
    era: "three-kingdoms",
    year: 612,
    title: "살수 대첩",
    tipId: "tip-three-kingdoms-003",
  },
  {
    id: "tl-three-kingdoms-006",
    era: "three-kingdoms",
    year: 660,
    title: "황산벌 전투",
  },

  /* ---------- 남북국 ---------- */
  {
    id: "tl-north-south-001",
    era: "north-south",
    year: 676,
    title: "신라, 삼국 통일 완성",
  },
  {
    id: "tl-north-south-002",
    era: "north-south",
    year: 689,
    title: "신문왕, 녹읍 폐지",
    tipId: "tip-north-south-004",
  },
  {
    id: "tl-north-south-003",
    era: "north-south",
    year: 698,
    title: "발해 건국",
    tipId: "tip-north-south-001",
  },
  {
    id: "tl-north-south-004",
    era: "north-south",
    year: 788,
    title: "원성왕, 독서삼품과 실시",
  },
  {
    id: "tl-north-south-005",
    era: "north-south",
    year: 828,
    title: "장보고, 청해진 설치",
    tipId: "tip-north-south-002",
  },
  {
    id: "tl-north-south-006",
    era: "north-south",
    year: 889,
    title: "원종·애노의 난",
  },

  /* ---------- 고려 ---------- */
  {
    id: "tl-goryeo-001",
    era: "goryeo",
    year: 918,
    title: "고려 건국",
    tipId: "tip-goryeo-001",
  },
  {
    id: "tl-goryeo-002",
    era: "goryeo",
    year: 958,
    title: "광종, 과거제 실시",
    tipId: "tip-goryeo-002",
  },
  {
    id: "tl-goryeo-003",
    era: "goryeo",
    year: 993,
    title: "서희의 외교 담판 (강동 6주)",
    tipId: "tip-goryeo-003",
  },
  { id: "tl-goryeo-004", era: "goryeo", year: 1019, title: "귀주 대첩" },
  {
    id: "tl-goryeo-005",
    era: "goryeo",
    year: 1356,
    title: "공민왕, 쌍성총관부 공격",
    tipId: "tip-goryeo-005",
  },
  { id: "tl-goryeo-006", era: "goryeo", year: 1388, title: "위화도 회군" },

  /* ---------- 조선 전기 ---------- */
  {
    id: "tl-joseon-early-001",
    era: "joseon-early",
    year: 1392,
    title: "조선 건국",
  },
  {
    id: "tl-joseon-early-002",
    era: "joseon-early",
    year: 1446,
    title: "훈민정음 반포",
    tipId: "tip-joseon-early-004",
  },
  {
    id: "tl-joseon-early-003",
    era: "joseon-early",
    year: 1466,
    title: "세조, 직전법 실시",
    tipId: "tip-joseon-early-003",
  },
  {
    id: "tl-joseon-early-004",
    era: "joseon-early",
    year: 1498,
    title: "무오사화",
    tipId: "tip-joseon-early-002",
  },
  {
    id: "tl-joseon-early-005",
    era: "joseon-early",
    year: 1519,
    title: "기묘사화",
  },

  /* ---------- 조선 후기 ---------- */
  {
    id: "tl-joseon-late-001",
    era: "joseon-late",
    year: 1592,
    title: "임진왜란",
    tipId: "tip-joseon-late-001",
  },
  {
    id: "tl-joseon-late-002",
    era: "joseon-late",
    year: 1608,
    title: "대동법 실시 (경기도)",
    tipId: "tip-joseon-late-005",
  },
  {
    id: "tl-joseon-late-003",
    era: "joseon-late",
    year: 1627,
    title: "정묘호란",
  },
  {
    id: "tl-joseon-late-004",
    era: "joseon-late",
    year: 1636,
    title: "병자호란",
    tipId: "tip-joseon-late-002",
  },
  {
    id: "tl-joseon-late-005",
    era: "joseon-late",
    year: 1750,
    title: "영조, 균역법 실시",
    tipId: "tip-joseon-late-003",
  },

  /* ---------- 개항기(근대) ---------- */
  { id: "tl-modern-001", era: "modern", year: 1866, title: "병인양요" },
  {
    id: "tl-modern-002",
    era: "modern",
    year: 1871,
    title: "신미양요",
    tipId: "tip-modern-005",
  },
  {
    id: "tl-modern-003",
    era: "modern",
    year: 1876,
    title: "강화도 조약",
    tipId: "tip-modern-001",
  },
  {
    id: "tl-modern-004",
    era: "modern",
    year: 1884,
    title: "갑신정변",
    tipId: "tip-modern-002",
  },
  {
    id: "tl-modern-005",
    era: "modern",
    year: 1894,
    title: "동학 농민 운동",
    tipId: "tip-modern-003",
  },
  {
    id: "tl-modern-006",
    era: "modern",
    year: 1905,
    title: "을사늑약",
    tipId: "tip-modern-004",
  },

  /* ---------- 일제강점기 ---------- */
  {
    id: "tl-colonial-001",
    era: "colonial",
    year: 1919,
    title: "3·1 운동",
    tipId: "tip-colonial-001",
  },
  {
    id: "tl-colonial-002",
    era: "colonial",
    year: 1926,
    title: "6·10 만세 운동",
  },
  {
    id: "tl-colonial-003",
    era: "colonial",
    year: 1927,
    title: "신간회 결성",
    tipId: "tip-colonial-002",
  },
  {
    id: "tl-colonial-004",
    era: "colonial",
    year: 1929,
    title: "광주 학생 항일 운동",
  },
  {
    id: "tl-colonial-005",
    era: "colonial",
    year: 1938,
    title: "국가 총동원법 제정",
  },
  {
    id: "tl-colonial-006",
    era: "colonial",
    year: 1940,
    title: "한국광복군 창설",
  },

  /* ---------- 현대 ---------- */
  {
    id: "tl-contemporary-001",
    era: "contemporary",
    year: 1945,
    title: "8·15 광복",
  },
  {
    id: "tl-contemporary-002",
    era: "contemporary",
    year: 1948,
    title: "5·10 총선거",
  },
  {
    id: "tl-contemporary-003",
    era: "contemporary",
    year: 1950,
    title: "인천 상륙 작전",
  },
  {
    id: "tl-contemporary-004",
    era: "contemporary",
    year: 1960,
    title: "4·19 혁명",
    tipId: "tip-contemporary-001",
  },
  {
    id: "tl-contemporary-005",
    era: "contemporary",
    year: 1972,
    title: "7·4 남북 공동 성명",
    tipId: "tip-contemporary-002",
  },
  {
    id: "tl-contemporary-006",
    era: "contemporary",
    year: 1987,
    title: "6월 민주 항쟁",
  },
  {
    id: "tl-contemporary-007",
    era: "contemporary",
    year: 2000,
    title: "6·15 남북 공동 선언",
  },
];
