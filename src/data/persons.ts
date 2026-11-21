// 인물 ↔ 업적 매칭 데이터. id 형식: pm-<era>-번호 3자리.
// 규칙: 가능하면 이미 검증된 문제·꿀팁·연표의 인물·업적을 쓴다 / deed는 짧게 /
// 한 라운드에 같이 나와도 헷갈리지 않도록 업적은 인물마다 뚜렷하게 다르게 쓴다
import type { PersonMatch } from "../types";

export const persons: PersonMatch[] = [
  /* ---------- 선사·고조선 ---------- */
  {
    id: "pm-prehistoric-001",
    era: "prehistoric",
    person: "단군왕검",
    deed: "고조선 건국",
  },
  {
    id: "pm-prehistoric-002",
    era: "prehistoric",
    person: "위만",
    deed: "고조선의 왕이 됨 (위만 조선)",
  },
  {
    id: "pm-prehistoric-003",
    era: "prehistoric",
    person: "한 무제",
    deed: "고조선 침략, 왕검성 함락",
  },

  /* ---------- 삼국 ---------- */
  {
    id: "pm-three-kingdoms-001",
    era: "three-kingdoms",
    person: "광개토 대왕",
    deed: "'영락' 연호, 신라에 침입한 왜 격퇴",
  },
  {
    id: "pm-three-kingdoms-002",
    era: "three-kingdoms",
    person: "장수왕",
    deed: "평양 천도, 남진 정책",
  },
  {
    id: "pm-three-kingdoms-003",
    era: "three-kingdoms",
    person: "근초고왕",
    deed: "평양성 공격, 고국원왕 전사",
  },
  {
    id: "pm-three-kingdoms-004",
    era: "three-kingdoms",
    person: "법흥왕",
    deed: "율령 반포, 불교 공인",
  },
  {
    id: "pm-three-kingdoms-005",
    era: "three-kingdoms",
    person: "진흥왕",
    deed: "화랑도 개편, 대가야 정복",
  },
  {
    id: "pm-three-kingdoms-006",
    era: "three-kingdoms",
    person: "을지문덕",
    deed: "살수 대첩 승리",
  },
  {
    id: "pm-three-kingdoms-007",
    era: "three-kingdoms",
    person: "계백",
    deed: "황산벌 전투",
  },

  /* ---------- 남북국 ---------- */
  {
    id: "pm-north-south-001",
    era: "north-south",
    person: "대조영",
    deed: "발해 건국",
  },
  {
    id: "pm-north-south-002",
    era: "north-south",
    person: "신문왕",
    deed: "관료전 지급, 녹읍 폐지",
  },
  {
    id: "pm-north-south-003",
    era: "north-south",
    person: "원효",
    deed: "아미타 신앙으로 불교 대중화",
  },
  {
    id: "pm-north-south-004",
    era: "north-south",
    person: "의상",
    deed: "화엄 사상, 부석사 건립",
  },
  {
    id: "pm-north-south-005",
    era: "north-south",
    person: "혜초",
    deed: "『왕오천축국전』 저술",
  },
  {
    id: "pm-north-south-006",
    era: "north-south",
    person: "장보고",
    deed: "청해진 설치, 해상 무역",
  },
  {
    id: "pm-north-south-007",
    era: "north-south",
    person: "최치원",
    deed: "진성 여왕에게 시무 10여 조",
  },

  /* ---------- 고려 ---------- */
  {
    id: "pm-goryeo-001",
    era: "goryeo",
    person: "왕건",
    deed: "고려 건국, 훈요 10조",
  },
  {
    id: "pm-goryeo-002",
    era: "goryeo",
    person: "광종",
    deed: "노비안검법, 과거제 실시",
  },
  {
    id: "pm-goryeo-003",
    era: "goryeo",
    person: "서희",
    deed: "외교 담판으로 강동 6주 확보",
  },
  { id: "pm-goryeo-004", era: "goryeo", person: "강감찬", deed: "귀주 대첩" },
  {
    id: "pm-goryeo-005",
    era: "goryeo",
    person: "윤관",
    deed: "별무반 조직, 동북 9성 축조",
  },
  {
    id: "pm-goryeo-006",
    era: "goryeo",
    person: "김부식",
    deed: "『삼국사기』 편찬",
  },
  {
    id: "pm-goryeo-007",
    era: "goryeo",
    person: "공민왕",
    deed: "쌍성총관부 공격, 반원 개혁",
  },

  /* ---------- 조선 전기 ---------- */
  {
    id: "pm-joseon-early-001",
    era: "joseon-early",
    person: "정도전",
    deed: "조선 건국의 설계자",
  },
  {
    id: "pm-joseon-early-002",
    era: "joseon-early",
    person: "태종",
    deed: "사병 혁파, 호패법 실시",
  },
  {
    id: "pm-joseon-early-003",
    era: "joseon-early",
    person: "세종",
    deed: "훈민정음 창제",
  },
  {
    id: "pm-joseon-early-004",
    era: "joseon-early",
    person: "세조",
    deed: "직전법 실시",
  },
  {
    id: "pm-joseon-early-005",
    era: "joseon-early",
    person: "조광조",
    deed: "현량과 실시, 소격서 폐지",
  },
  {
    id: "pm-joseon-early-006",
    era: "joseon-early",
    person: "이황",
    deed: "『성학십도』 저술",
  },

  /* ---------- 조선 후기 ---------- */
  {
    id: "pm-joseon-late-001",
    era: "joseon-late",
    person: "이순신",
    deed: "임진왜란 때 한산도 대첩 승리",
  },
  {
    id: "pm-joseon-late-002",
    era: "joseon-late",
    person: "광해군",
    deed: "경기도에 대동법 처음 실시",
  },
  {
    id: "pm-joseon-late-003",
    era: "joseon-late",
    person: "최명길",
    deed: "병자호란 때 주화론",
  },
  {
    id: "pm-joseon-late-004",
    era: "joseon-late",
    person: "영조",
    deed: "균역법 실시, 탕평비 건립",
  },
  {
    id: "pm-joseon-late-005",
    era: "joseon-late",
    person: "정조",
    deed: "규장각 설치, 수원 화성 축조",
  },
  {
    id: "pm-joseon-late-006",
    era: "joseon-late",
    person: "정약용",
    deed: "『목민심서』 저술, 거중기 설계",
  },
  {
    id: "pm-joseon-late-007",
    era: "joseon-late",
    person: "박지원",
    deed: "『열하일기』 저술",
  },

  /* ---------- 개항기(근대) ---------- */
  {
    id: "pm-modern-001",
    era: "modern",
    person: "흥선 대원군",
    deed: "서원 정리, 호포제 실시",
  },
  {
    id: "pm-modern-002",
    era: "modern",
    person: "김옥균",
    deed: "갑신정변 주도",
  },
  {
    id: "pm-modern-003",
    era: "modern",
    person: "전봉준",
    deed: "동학 농민 운동 지도",
  },
  {
    id: "pm-modern-004",
    era: "modern",
    person: "김홍집",
    deed: "갑오개혁 추진",
  },
  {
    id: "pm-modern-005",
    era: "modern",
    person: "최익현",
    deed: "개항 반대 상소, 을사의병",
  },
  {
    id: "pm-modern-006",
    era: "modern",
    person: "장지연",
    deed: "「시일야방성대곡」 발표",
  },

  /* ---------- 일제강점기 ---------- */
  {
    id: "pm-colonial-001",
    era: "colonial",
    person: "이상재",
    deed: "신간회 초대 회장",
  },
  {
    id: "pm-colonial-002",
    era: "colonial",
    person: "김원봉",
    deed: "의열단·조선 의용대 조직",
  },
  {
    id: "pm-colonial-003",
    era: "colonial",
    person: "홍범도",
    deed: "봉오동 전투 승리",
  },
  {
    id: "pm-colonial-004",
    era: "colonial",
    person: "김좌진",
    deed: "청산리 전투 승리",
  },
  {
    id: "pm-colonial-005",
    era: "colonial",
    person: "지청천",
    deed: "한국광복군 총사령관",
  },
  {
    id: "pm-colonial-006",
    era: "colonial",
    person: "임병찬",
    deed: "독립 의군부 조직",
  },

  /* ---------- 현대 ---------- */
  {
    id: "pm-contemporary-001",
    era: "contemporary",
    person: "여운형",
    deed: "조선 건국 준비 위원회 조직",
  },
  {
    id: "pm-contemporary-002",
    era: "contemporary",
    person: "김규식",
    deed: "좌우 합작 위원회 참여",
  },
  {
    id: "pm-contemporary-003",
    era: "contemporary",
    person: "박정희",
    deed: "새마을 운동 시작",
  },
  {
    id: "pm-contemporary-004",
    era: "contemporary",
    person: "노태우",
    deed: "남북 기본 합의서 채택",
  },
  {
    id: "pm-contemporary-005",
    era: "contemporary",
    person: "김영삼",
    deed: "금융 실명제 실시",
  },
  {
    id: "pm-contemporary-006",
    era: "contemporary",
    person: "김대중",
    deed: "6·15 남북 공동 선언",
  },
];

/**
 * 인물과 관련된 꿀팁 (PersonMatch 타입에 tipId가 없어서 여기에 둔다).
 * 매칭 게임 완료 화면의 💡 펼치기에 쓴다.
 */
export const personTips: Record<string, string> = {
  "pm-three-kingdoms-002": "tip-three-kingdoms-001", // 장수왕
  "pm-three-kingdoms-004": "tip-three-kingdoms-002", // 법흥왕 (이차돈)
  "pm-three-kingdoms-006": "tip-three-kingdoms-003", // 을지문덕 (612)
  "pm-north-south-001": "tip-north-south-001", // 대조영 (698)
  "pm-north-south-002": "tip-north-south-004", // 신문왕
  "pm-north-south-003": "tip-north-south-003", // 원효
  "pm-north-south-006": "tip-north-south-002", // 장보고 (828)
  "pm-goryeo-001": "tip-goryeo-001", // 왕건 (918)
  "pm-goryeo-002": "tip-goryeo-002", // 광종 (958)
  "pm-goryeo-003": "tip-goryeo-003", // 서희 (993)
  "pm-goryeo-007": "tip-goryeo-005", // 공민왕
  "pm-joseon-early-003": "tip-joseon-early-004", // 세종 (훈민정음)
  "pm-joseon-early-004": "tip-joseon-early-003", // 세조 (직전법)
  "pm-joseon-late-001": "tip-joseon-late-001", // 이순신 (1592)
  "pm-joseon-late-002": "tip-joseon-late-005", // 광해군 (대동법 1608)
  "pm-joseon-late-003": "tip-joseon-late-002", // 최명길
  "pm-joseon-late-004": "tip-joseon-late-003", // 영조 (균역법)
  "pm-joseon-late-005": "tip-joseon-late-004", // 정조
  "pm-joseon-late-006": "tip-joseon-late-006", // 정약용
  "pm-modern-001": "tip-modern-005", // 흥선 대원군 (척화비)
  "pm-modern-002": "tip-modern-002", // 김옥균 (1884)
  "pm-modern-003": "tip-modern-003", // 전봉준
  "pm-colonial-001": "tip-colonial-002", // 이상재 (신간회)
  "pm-contemporary-005": "tip-contemporary-003", // 김영삼
};
