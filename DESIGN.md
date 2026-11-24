# TreeON Office DESIGN.md

기준: awesome-design-md / Stripe DESIGN.md 를 TreeON 브랜드에 맞춰 적용. 토큰 값은 `assets/css/style.css` 의 `:root` 와 같습니다.

## Colors
| 토큰 | 값 | 용도 |
|---|---|---|
| primary | #134a92 | 유일한 CTA 색 (필 버튼, 링크). 한 영역에 채운 버튼 하나 |
| teal | #00a394 | 액센트 전용 — 메시, 상태 점, 차트 강조. 버튼 색으로 쓰지 않음 |
| ink / ink-2 / mute | #0d253d / #273951 / #64748d | 본문·보조·캡션 |
| canvas / canvas-soft / canvas-cream | #fff / #f6f9fc / #f5ecdc | 기본·피처 밴드·따뜻한 인터루드 |
| dark-900 | #0b2347 | 보안 섹션, 피처드 요금 카드, 앱 사이드바·요약 패널 |
| hairline / hairline-input | #e3e8ee / #a8c3de | 카드·표 / 입력창 테두리 |

## Typography (Pretendard)
- 디스플레이(h1·h2·큰 숫자): weight 300, 자간 -0.03 ~ -0.045em
- 본문 15.5px / 400, 숫자·금액은 항상 `tnum`(tabular figures)

## Shape & Elevation
- 버튼·태그·세그먼트: pill(9999px), 패딩 8px 16~20px
- 카드 12px, 목업·모달 16px, 입력 6px
- e1 `0 1px 3px rgba(0,55,112,.08)` 카드 / e2 떠 있는 패널 / e3 히어로 목업
- 깊이는 그림자보다 그라디언트 메시(크림→민트→청록→블루)로 표현: 히어로, 마지막 CTA, 로그인 측면, 앱 홈 프로모

## Signature
- 히어로: 기울어진 메시 + 예약·모바일 키·리포트 합성 목업
- 기능 설명마다 미니 제품 UI를 붙임
- 앱은 다크 셸(사이드바) + 밝은 카드
