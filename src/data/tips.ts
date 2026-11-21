// 암기 꿀팁. id 형식: tip-<era>-번호 3자리.
// number(숫자 말장난): 괄호 안 숫자가 바로 앞 글자의 소리(일·이·삼·사·오·육·칠·팔·구, 0은 공/영)와 일치하고,
// 순서대로 읽으면 year와 같아야 한다.
import type { Tip } from "../types";

export const tips: Tip[] = [
  /* ---------- 선사·고조선 ---------- */
  {
    id: "tip-prehistoric-001",
    era: "prehistoric",
    kind: "story",
    text: "돌을 깨뜨려 '뗀' 구석기 → 돌을 갈아 '간' 신석기. 뗀석기 다음이 간석기!",
  },
  {
    id: "tip-prehistoric-002",
    era: "prehistoric",
    kind: "story",
    text: "머리빗으로 그은 듯한 빗금 무늬, 빗살무늬 토기 → 정착해서 곡식을 담아 둔 신석기의 상징",
  },
  {
    id: "tip-prehistoric-003",
    era: "prehistoric",
    kind: "story",
    text: "큰 돌을 받쳐 '고인' 고인돌 → 그 큰 돌을 옮길 사람들을 부릴 만큼 힘센 지배자가 나타난 청동기",
  },
  {
    id: "tip-prehistoric-004",
    era: "prehistoric",
    kind: "story",
    text: "8조법 중 전하는 3조는 '살·상·도' — 살인은 사형, 상해는 곡식으로 배상, 도둑은 노비로",
  },

  /* ---------- 삼국 ---------- */
  {
    id: "tip-three-kingdoms-001",
    era: "three-kingdoms",
    year: 427,
    kind: "story",
    text: "이름처럼 오래 산 장수왕 — 79년 동안 다스리며 도읍을 평양으로 옮기고 남쪽으로 내려갔다",
  },
  {
    id: "tip-three-kingdoms-002",
    era: "three-kingdoms",
    year: 527,
    kind: "story",
    text: "이차돈의 목을 베자 흰 피가 솟았다는 이야기 → 이를 계기로 법흥왕이 불교를 공인",
  },
  {
    id: "tip-three-kingdoms-003",
    era: "three-kingdoms",
    year: 612,
    kind: "number",
    text: "육(6)지로 일(1)제히 이(2)동한 수나라 군대, 살수에서 을지문덕에게 대패!",
  },

  /* ---------- 남북국 ---------- */
  {
    id: "tip-north-south-001",
    era: "north-south",
    year: 698,
    kind: "number",
    text: "육(6)중한 당군을 물리치고 구(9)사일생, 팔(8)을 걷어붙여 발해를 세운 대조영!",
  },
  {
    id: "tip-north-south-002",
    era: "north-south",
    year: 828,
    kind: "number",
    text: "팔(8)방의 해적을 소탕하고 바닷길을 이(2)은 장보고, 신라 바다의 팔(8)자를 고치다!",
  },
  {
    id: "tip-north-south-003",
    era: "north-south",
    kind: "story",
    text: "목이 말라 마신 물이 해골에 고인 물이었음을 알고 '모든 것은 마음먹기에 달렸다'고 깨달은 원효",
  },
  {
    id: "tip-north-south-004",
    era: "north-south",
    kind: "story",
    text: "신문왕은 '신문'에 날 만한 개혁 3종 — 국학 설립, 관료전 지급, 녹읍 폐지",
  },

  /* ---------- 고려 ---------- */
  {
    id: "tip-goryeo-001",
    era: "goryeo",
    year: 918,
    kind: "number",
    text: "구(9)국의 일(1)념으로 장수들이 팔(8)을 들어 왕건을 왕으로 추대!",
  },
  {
    id: "tip-goryeo-002",
    era: "goryeo",
    year: 958,
    kind: "number",
    text: "구(9)름처럼 오(5)는 인재들, 팔(8)방에서 과거로 뽑자! — 광종의 과거제",
  },
  {
    id: "tip-goryeo-003",
    era: "goryeo",
    year: 993,
    kind: "number",
    text: "구(9)구(9)절절 논리로 소손녕을 설득해 강동 6주를 삼(3)킨 서희!",
  },
  {
    id: "tip-goryeo-004",
    era: "goryeo",
    kind: "story",
    text: "몽골군이 쳐들어오자 '부처님의 힘으로 나라를 지키자' — 8만 장이 넘는 목판에 새긴 팔만대장경",
  },
  {
    id: "tip-goryeo-005",
    era: "goryeo",
    kind: "story",
    text: "원나라 공주(노국 대장 공주)와 결혼했지만 원나라에 맞서 개혁한 왕 → 공민왕",
  },

  /* ---------- 조선 전기 ---------- */
  {
    id: "tip-joseon-early-001",
    era: "joseon-early",
    kind: "acronym",
    text: "조선 왕 순서: 태정태세문단세 예성연중인명선 광인효현숙경영 정순헌철고순",
  },
  {
    id: "tip-joseon-early-002",
    era: "joseon-early",
    kind: "acronym",
    text: "4대 사화 순서는 '무갑기을' — 무오(1498)·갑자(1504)·기묘(1519)·을사(1545)",
  },
  {
    id: "tip-joseon-early-003",
    era: "joseon-early",
    year: 1466,
    kind: "story",
    text: "직전법의 '직'은 현직의 '직' — 지금 일하는 관리만 수조권을 받는다 (세조)",
  },
  {
    id: "tip-joseon-early-004",
    era: "joseon-early",
    year: 1446,
    kind: "story",
    text: "훈민정음 = '백성을 가르치는 바른 소리' — 세종이 1443년 창제, 1446년 반포",
  },

  /* ---------- 조선 후기 ---------- */
  {
    id: "tip-joseon-late-001",
    era: "joseon-late",
    year: 1592,
    kind: "number",
    text: "일(1)본군이 오(5)자, 구(9)국의 영웅 이(2)순신!",
  },
  {
    id: "tip-joseon-late-002",
    era: "joseon-late",
    year: 1636,
    kind: "story",
    text: "최명길 — 나라의 '명'을 '길'게! 청과 화의해서라도 나라를 지키자는 주화파",
  },
  {
    id: "tip-joseon-late-003",
    era: "joseon-late",
    year: 1750,
    kind: "story",
    text: "균역법 = 군역 부담을 '균'등하게 — 군포 2필을 1필로 절반 줄인 영조",
  },
  {
    id: "tip-joseon-late-004",
    era: "joseon-late",
    kind: "story",
    text: "정조의 효심 — 아버지 사도 세자의 묘를 수원으로 옮기고 그곳에 화성을 쌓았다",
  },
  {
    id: "tip-joseon-late-005",
    era: "joseon-late",
    year: 1608,
    kind: "number",
    text: "일(1)년 내내 육(6)신이 고되던 공(0)납, 쌀로 내니 팔(8)자 폈네! — 대동법",
  },
  {
    id: "tip-joseon-late-006",
    era: "joseon-late",
    kind: "story",
    text: "다산 정약용 — 강진 유배 18년 동안 『목민심서』 등 수많은 책을 썼다",
  },

  /* ---------- 개항기(근대) ---------- */
  {
    id: "tip-modern-001",
    era: "modern",
    kind: "story",
    text: "강화도 조약 개항 순서는 '부원인' — 부산(1876)·원산(1880)·인천(1883)",
  },
  {
    id: "tip-modern-002",
    era: "modern",
    year: 1884,
    kind: "number",
    text: "일(1)어날 땐 팔(8)팔(8)했지만 사(4)흘 만에 끝난 갑신정변!",
  },
  {
    id: "tip-modern-003",
    era: "modern",
    year: 1894,
    kind: "story",
    text: "녹두 장군 전봉준 — '새야 새야 파랑새야, 녹두밭에 앉지 마라' 민요로 기억하기",
  },
  {
    id: "tip-modern-004",
    era: "modern",
    year: 1905,
    kind: "number",
    text: "일(1)본이 구(9)실 붙여 공(0)으로 앗아 간 외교권, 오(5)호통재라! — 을사늑약",
  },
  {
    id: "tip-modern-005",
    era: "modern",
    year: 1871,
    kind: "story",
    text: "흥선 대원군은 신미양요 뒤 '서양과 화친하지 않겠다'는 척화비를 전국에 세웠다",
  },

  /* ---------- 일제강점기 ---------- */
  {
    id: "tip-colonial-001",
    era: "colonial",
    year: 1919,
    kind: "number",
    text: "일(1)어나 구(9)하자! 일(1)어나 구(9)하자! — 3·1 운동",
  },
  {
    id: "tip-colonial-002",
    era: "colonial",
    year: 1927,
    kind: "story",
    text: "신간회 = '고목신간(古木新幹)' — 늙은 나무에 돋은 새 줄기처럼 좌우가 하나로 뭉쳤다",
  },
  {
    id: "tip-colonial-003",
    era: "colonial",
    kind: "story",
    text: "1910년대 무단 통치 — 헌병 경찰이 다스리고, 학교 교사도 제복을 입고 칼을 찼다",
  },

  /* ---------- 현대 ---------- */
  {
    id: "tip-contemporary-001",
    era: "contemporary",
    year: 1960,
    kind: "number",
    text: "일(1)어선 학생들, 구(9)호를 육(6)성으로 외치며 공(0)정 선거를 요구하다! — 4·19 혁명",
  },
  {
    id: "tip-contemporary-002",
    era: "contemporary",
    year: 1972,
    kind: "acronym",
    text: "7·4 남북 공동 성명의 통일 3대 원칙은 '자평민' — 자주·평화·민족적 대단결",
  },
  {
    id: "tip-contemporary-003",
    era: "contemporary",
    kind: "story",
    text: "김영삼 정부는 '금·O·외' — 금융 실명제(1993), OECD 가입(1996), 외환 위기(1997)",
  },
];

export function getTipById(tipId: string): Tip | undefined {
  return tips.find((tip) => tip.id === tipId);
}
