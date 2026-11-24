// TreeON Office 콘텐츠 데이터 — 거점·요금·주변 시설이 바뀌면 이 파일만 고치면 됩니다.
window.TREEON_DATA = {
  // 거점(공간) — capacity: 최대 인원, img: assets/img 안 파일
  spaces: [
    { id: "A", name: "폐교형", area: "50평", capacity: 10, img: "a/17-exterior-t.webp", aerial: "a/01-aerial.webp", plan: "plan-a.webp",
      site: "1호점 · 서울에서 1시간 내 (실증 준비 중)",
      rooms: ["집중업무실 10석", "프로젝트룸 12인", "회복라운지", "통화실"],
      desc: "폐교 교실을 고친 50평 독채. 집중업무실, 프로젝트룸, 통화실, 회복라운지를 한 팀이 모두 씁니다." }
  ],

  // 폐교형 리모델링 컨셉 이미지 (assets/img/a/) — room 은 평면도 방 이름과 같아야 연동됩니다
  gallery: [
    { file: "01-aerial", room: "전체", title: "전체 공간 조감도", desc: "50평 전체 구성. 위쪽이 통화실·회복라운지·프로젝트룸, 아래쪽이 집중업무실과 입구·화장실입니다." },
    { file: "17-exterior", room: "외관", title: "외부 전경", desc: "리모델링 후 외관. 저녁에도 입구와 동선에 조명이 들어옵니다." },
    { file: "02-project", room: "프로젝트룸", title: "프로젝트룸 전경", desc: "12인 회의 테이블과 빔프로젝터·스크린. 팀 전체 회의와 리뷰를 여기서 합니다." },
    { file: "03-project-screen", room: "프로젝트룸", title: "프로젝트룸 스크린", desc: "천장형 빔프로젝터와 전동 스크린. 노트북을 연결해 바로 발표합니다." },
    { file: "04a-glass-clear", room: "프로젝트룸", title: "스마트글라스 · 투명", desc: "평소에는 투명한 창으로 바깥 숲이 보입니다." },
    { file: "04b-glass-frosted", room: "프로젝트룸", title: "스마트글라스 · 불투명", desc: "보안 회의 때는 버튼 하나로 창을 불투명하게 바꿔 바깥 시선을 막습니다." },
    { file: "05-focus", room: "집중업무실", title: "집중업무실 전경", desc: "칸막이 책상 10석. 대화와 통화는 다른 방에서 해서 조용히 유지합니다." },
    { file: "06-focus-seat", room: "집중업무실", title: "개인 업무좌석", desc: "모니터와 인체공학 의자를 갖춘 1인 좌석." },
    { file: "07-focus-storage", room: "집중업무실", title: "창가 하부 수납장", desc: "창가를 따라 이어진 수납장. 퇴실 때 책상 위 서류를 넣어 둡니다(클린 데스크)." },
    { file: "08-lounge", room: "회복라운지", title: "회복라운지 전경", desc: "소파, 원형 테이블, 안마의자와 탕비 공간이 있는 휴식 공간." },
    { file: "09-lounge-sofa", room: "회복라운지", title: "소파 휴식공간", desc: "몰입 사이사이 머리를 식히는 소파 자리." },
    { file: "10-lounge-pantry", room: "회복라운지", title: "탕비시설 · 원형 테이블", desc: "커피와 간식, 개수대. 4인 원형 테이블에서 가볍게 이야기합니다." },
    { file: "11-call", room: "통화실", title: "통화실 내부", desc: "본사 화상회의와 통화용 1인 좌석. 앱에서 1시간 단위로 예약합니다." },
    { file: "12-hall", room: "로비", title: "중앙 복도", desc: "방과 방을 잇는 공용 동선. 출입 동선에만 CCTV가 있습니다." },
    { file: "13-hall-planter", room: "로비", title: "중앙 휴게의자 · 플랜테리어", desc: "복도 가운데 앉아 쉴 수 있는 원목 벤치와 화분." },
    { file: "14-entrance", room: "입구·신발장", title: "출입구 · 신발장", desc: "안면인식기로 들어와 신발장에서 실내화로 갈아 신습니다." },
    { file: "15-wc-m", room: "화장실", title: "화장실 (남)", desc: "남녀 분리 화장실." },
    { file: "16-wc-f", room: "화장실", title: "화장실 (여)", desc: "남녀 분리 화장실." }
  ],
  galleryNote: "폐교형 리모델링 컨셉 이미지입니다. 실제 공간은 현장 여건에 따라 달라질 수 있습니다.",

  // 이용 패키지 — price: 팀 1일 기준(부가세 별도), 공간별 단가. 시장검증용 예시 단가
  packages: [
    { id: "commute", name: "출퇴근형", desc: "당일 출퇴근 · 점심 포함", price: { A: 200000 }, stay: false },
    { id: "mid", name: "중기 체류형", desc: "숙박 포함 · 2박 3일~1주", price: { A: 350000 }, stay: true },
    { id: "long", name: "장기 체류형", desc: "숙박 포함 · 1주 이상", price: { A: 450000 }, stay: true }
  ],

  // 고객사 보안 수준
  security: [
    { id: 1, name: "고객사 VPN 연동", desc: "본사 보안망을 그대로 씁니다. 고객사 IT팀이 VPN 계정을 발급합니다.", extra: "추가 비용 없음" },
    { id: 2, name: "트리온 보안 접속", desc: "VPN이 없는 단기 TF용. 트리온 클라우드 보안 플랫폼으로 접속합니다.", extra: "패키지에 포함" },
    { id: 3, name: "고보안 전용", desc: "장기 TF, 망분리·전용 회선 등 별도 요구가 있는 경우입니다.", extra: "별도 협의" }
  ],

  // 결재 서류 종류
  docTypes: [
    { id: "quote", name: "견적서", desc: "예약 내용 기준 금액. 바로 미리보기·출력할 수 있습니다.", instant: true },
    { id: "proposal", name: "외부 근무(파견) 품의서 초안", desc: "사내 결재에 올릴 품의서 양식. 목적·기간·비용이 채워집니다.", instant: true },
    { id: "security", name: "보안 점검 확인서", desc: "보안 수칙 동의, 출입 기록, 퇴실 후 기기 초기화 이력" },
    { id: "attendance", name: "근태 확인서", desc: "팀원별 출퇴근 태그 기록 (인사팀 제출용)" },
    { id: "usage", name: "이용 확인서", desc: "이용 기간·인원·공간을 확인하는 증빙" },
    { id: "invoice", name: "세금계산서 발행", desc: "이용 종료 뒤 법인 일괄 발행. 사업자 정보가 필요합니다." },
    { id: "statement", name: "거래명세서", desc: "항목별 이용 금액 명세" }
  ],

  // 공간 이용 규칙(보안 수칙) — 첫 입실 전 동의
  rules: [
    "예약한 팀원만 입실합니다. 모바일 키와 일회용 비밀번호는 다른 사람에게 공유하지 않습니다.",
    "업무 자료는 회사가 허용한 보안 접속(VPN 또는 트리온 보안 접속)으로만 다룹니다.",
    "공용 모니터·전자칠판에 남은 자료는 퇴실 전에 지웁니다. 퇴실 후 공용 기기는 자동 초기화됩니다.",
    "출입 동선에는 CCTV가 있습니다. 업무 공간 내부는 촬영하지 않습니다.",
    "퇴실할 때 책상 위에 서류를 두지 않습니다(클린 데스크)."
  ],

  // 공용 장비
  equipment: ["인체공학 의자", "QHD 듀얼 모니터", "75인치 전자칠판", "기가 인터넷·업무 전용 Wi-Fi", "빔프로젝터·스크린", "스마트글라스 창 (외부 시선 차단)"],

  // 주변 식당·카페·편의시설 — 가평역 인근 실제 업체 (2026.11 웹 검색 기준)
  // map: 네이버 지도 검색 링크 / photo: assets/img/ 아래 대표 사진 경로 (파일이 없으면 기본 이미지로 대체)
  placesNotice: "가평역 인근 실제 업체 정보입니다. 영업시간·메뉴·가격은 바뀔 수 있으니 방문 전 네이버 지도에서 확인하세요.",
  places: [
    {"slug": "sopung-dakgalbi", "name": "소풍닭갈비", "type": "식당", "station": true, "near": "가평역 맞은편", "address": "경기 가평군 가평읍 문화로 13-43 1층", "hours": "매일 10:00–21:00", "menu": "철판 닭갈비, 치즈볶음밥", "phone": "", "map": "https://map.naver.com/p/search/%EC%86%8C%ED%92%8D%EB%8B%AD%EA%B0%88%EB%B9%84%20%EA%B0%80%ED%8F%89%EC%9D%8D%20%EB%AC%B8%ED%99%94%EB%A1%9C%2013-43", "photo": "places/sopung-dakgalbi.jpg"},
    {"slug": "yeokjeon-bunsik", "name": "역전분식", "type": "식당", "station": true, "near": "가평역 길 건너", "address": "경기 가평군 가평읍 문화로 13-27", "hours": "매일 08:30–18:00", "menu": "분식 · 혼밥 가능, 바·야외 좌석", "phone": "", "map": "https://map.naver.com/p/search/%EC%97%AD%EC%A0%84%EB%B6%84%EC%8B%9D%20%EA%B0%80%ED%8F%89%EC%9D%8D%20%EB%AC%B8%ED%99%94%EB%A1%9C%2013-27", "photo": "places/yeokjeon-bunsik.jpg"},
    {"slug": "chowon-dakgalbi", "name": "초원닭갈비막국수", "type": "식당", "station": true, "near": "가평역 도보 약 7분", "address": "경기 가평군 가평읍 호반로 2556", "hours": "10:30–20:00 (라스트오더 19:00) · 목요일 휴무", "menu": "닭갈비 15,000원 · 막국수 9,000원 · 감자전 15,000원", "phone": "", "map": "https://map.naver.com/p/search/%EC%B4%88%EC%9B%90%EB%8B%AD%EA%B0%88%EB%B9%84%EB%A7%89%EA%B5%AD%EC%88%98%20%EA%B0%80%ED%8F%89%EC%9D%8D%20%ED%98%B8%EB%B0%98%EB%A1%9C%202556", "photo": "places/chowon-dakgalbi.jpg"},
    {"slug": "todam", "name": "토담식당", "type": "식당", "station": true, "near": "가평역 도보권", "address": "경기 가평군 가평읍 달전로 24", "hours": "방문 전 확인", "menu": "전골, 보리밥 등 향토 한식", "phone": "", "map": "https://map.naver.com/p/search/%ED%86%A0%EB%8B%B4%EC%8B%9D%EB%8B%B9%20%EA%B0%80%ED%8F%89%EC%9D%8D%20%EB%8B%AC%EC%A0%84%EB%A1%9C%2024", "photo": "places/todam.jpg"},
    {"slug": "hanu-myeongga", "name": "가평축산농협 한우명가", "type": "식당", "station": false, "near": "가평역 인근 (달전로)", "address": "경기 가평군 가평읍 달전로 19", "hours": "방문 전 확인", "menu": "한우명가탕", "phone": "031-581-1592", "map": "https://map.naver.com/p/search/%EA%B0%80%ED%8F%89%EC%B6%95%EC%82%B0%EB%86%8D%ED%98%91%20%ED%95%9C%EC%9A%B0%EB%AA%85%EA%B0%80%20%EA%B0%80%ED%8F%89%EC%9D%8D%20%EB%8B%AC%EC%A0%84%EB%A1%9C%2019", "photo": "places/hanu-myeongga.jpg"},
    {"slug": "dumulmeori", "name": "두물머리", "type": "식당", "station": false, "near": "가평역 인근 (달전로)", "address": "경기 가평군 가평읍 달전로 3", "hours": "방문 전 확인", "menu": "육개장", "phone": "0507-1340-3261", "map": "https://map.naver.com/p/search/%EB%91%90%EB%AC%BC%EB%A8%B8%EB%A6%AC%20%EA%B0%80%ED%8F%89%EC%9D%8D%20%EB%8B%AC%EC%A0%84%EB%A1%9C%203", "photo": "places/dumulmeori.jpg"},
    {"slug": "songwon-makguksu", "name": "송원막국수", "type": "식당", "station": false, "near": "가평읍내", "address": "경기 가평군 가평읍 가화로 76-1", "hours": "방문 전 확인", "menu": "간장 양념 막국수 10,000원, 수육", "phone": "", "map": "https://map.naver.com/p/search/%EC%86%A1%EC%9B%90%EB%A7%89%EA%B5%AD%EC%88%98%20%EA%B0%80%ED%8F%89%EC%9D%8D%20%EA%B0%80%ED%99%94%EB%A1%9C%2076-1", "photo": "places/songwon-makguksu.jpg"},
    {"slug": "by-station", "name": "카페 바이 스테이션", "type": "카페", "station": true, "near": "가평역 바로 앞", "address": "경기 가평군 가평읍 문화로 13-27", "hours": "방문 전 확인", "menu": "커피, 밀크티, 샌드위치 · 2층 좌석 · 주차 불가", "phone": "", "map": "https://map.naver.com/p/search/%EB%B0%94%EC%9D%B4%20%EC%8A%A4%ED%85%8C%EC%9D%B4%EC%85%98%20%EA%B0%80%ED%8F%89%EC%9D%8D%20%EB%AC%B8%ED%99%94%EB%A1%9C%2013-27", "photo": "places/by-station.jpg"},
    {"slug": "ediya-gapyeong", "name": "이디야커피 가평역점", "type": "카페", "station": false, "near": "가평역 인근 (달전리)", "address": "경기 가평군 가평읍 달전리 591-1", "hours": "방문 전 확인", "menu": "커피, 음료", "phone": "031-582-3012", "map": "https://map.naver.com/p/search/%EC%9D%B4%EB%94%94%EC%95%BC%EC%BB%A4%ED%94%BC%20%EA%B0%80%ED%8F%89%EC%97%AD%EC%A0%90%20%EA%B0%80%ED%8F%89%EC%9D%8D%20%EB%8B%AC%EC%A0%84%EB%A6%AC%20591-1", "photo": "places/ediya-gapyeong.jpg"},
    {"slug": "the-steel", "name": "카페 더스틸", "type": "카페", "station": false, "near": "달전리", "address": "경기 가평군 가평읍 달전리 108-5", "hours": "매일 10:00–21:00", "menu": "커피, 디저트", "phone": "031-581-7002", "map": "https://map.naver.com/p/search/%EB%8D%94%EC%8A%A4%ED%8B%B8%20%EA%B0%80%ED%8F%89%EC%9D%8D%20%EB%8B%AC%EC%A0%84%EB%A6%AC%20108-5", "photo": "places/the-steel.jpg"},
    {"slug": "daiso-gapyeong", "name": "다이소 가평점", "type": "편의", "station": false, "near": "가평읍내", "address": "경기 가평군 가평읍 가화로 48-1", "hours": "10:00–22:00", "menu": "생활용품, 문구, 세면도구", "phone": "070-8831-9749", "map": "https://map.naver.com/p/search/%EB%8B%A4%EC%9D%B4%EC%86%8C%20%EA%B0%80%ED%8F%89%EC%A0%90%20%EA%B0%80%ED%8F%89%EC%9D%8D%20%EA%B0%80%ED%99%94%EB%A1%9C%2048-1", "photo": "places/daiso-gapyeong.jpg"}
  ],

  // 업무 집중도 리포트 샘플 (실제 측정치가 아닌 샘플)
  report: {
    team: "AX 신사업 TF", company: "샘플 고객사", members: 6, space: "폐교형", period: "2027.04.06 – 04.17 (평일 10일)",
    productivity: {
      kpis: [
        { label: "하루 몰입 시간", before: 4.0, after: 6.1, unit: "시간", better: "up" },
        { label: "호출·회의로 끊긴 횟수", before: 9, after: 3, unit: "회/일", better: "down" },
        { label: "주간 야근 시간", before: 6, after: 3, unit: "시간", better: "down" },
        { label: "업무 완료도 (5점)", before: 3.1, after: 4.6, unit: "점", better: "up" }
      ],
      // 이용 기간 평일 10일의 팀 평균 몰입 시간
      daily: [5.2, 5.8, 6.0, 6.3, 5.9, 6.0, 6.4, 6.5, 6.2, 6.6],
      dailyLabels: ["4/6", "4/7", "4/8", "4/9", "4/10", "4/13", "4/14", "4/15", "4/16", "4/17"],
      baseline: 4.0,
      // 시간대별 끊김 횟수 (팀 평균) — 이용 전 2주 vs 이용 기간
      hours: ["9시", "10시", "11시", "13시", "14시", "15시", "16시", "17시"],
      interruptBefore: [1.4, 1.6, 1.3, 0.8, 1.2, 1.1, 1.0, 0.6],
      interruptAfter: [0.4, 0.5, 0.3, 0.3, 0.4, 0.5, 0.4, 0.2],
      milestones: [
        { name: "서비스 기획안 v1", plan: "4/24", actual: "4/15", note: "9일 앞당김" },
        { name: "PoC 범위 확정", plan: "4/17", actual: "4/10", note: "7일 앞당김" },
        { name: "경영진 보고", plan: "5/8", actual: "4/30 예정", note: "일정 앞당겨 확정" }
      ]
    },
    satisfaction: {
      items: [
        { label: "업무 몰입 환경", score: 4.7 },
        { label: "보안 접속 편의", score: 4.3 },
        { label: "식사·숙박", score: 4.2 },
        { label: "이동 거리", score: 3.6 },
        { label: "재이용 의향", score: 4.5 }
      ],
      positive: [
        { text: "메신저 호출이 줄어드니 오전 내내 기획안 한 덩어리를 끝낼 수 있었습니다.", who: "TF 실무자" },
        { text: "본사 VPN이 그대로 붙어서 따로 보안 검토를 다시 받을 필요가 없었습니다.", who: "TF장" },
        { text: "출퇴근 기록이 인사팀에 바로 넘어가서 외부 근무 증빙을 따로 만들지 않았습니다.", who: "인사 담당" }
      ],
      negative: [
        { text: "첫날 이동 시간이 길게 느껴졌습니다. 서울 출발 셔틀이 있으면 좋겠습니다.", who: "TF 실무자" },
        { text: "저녁 선택지가 적습니다. 장기 체류면 메뉴가 반복됩니다.", who: "TF 실무자" }
      ]
    },
    esg: {
      kpis: [
        { label: "지역 소비 (식사·카페·숙박)", value: "312만원" },
        { label: "유휴시설 가동", value: "10일 · 165㎡" },
        { label: "지역 단시간 고용", value: "2명" },
        { label: "종이 없는 결재", value: "14건" }
      ],
      spend: [
        { label: "제휴 식당", value: 108 },
        { label: "숙박", value: 132 },
        { label: "카페", value: 42 },
        { label: "기타 지역 소비", value: 30 }
      ]
    }
  }
};
