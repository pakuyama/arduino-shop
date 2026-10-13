# 아두몰 - 아두이노 부품 쇼핑몰

Next.js 16 (App Router) + Supabase + 토스페이먼츠(테스트 모드)로 만든 아두이노 쇼핑몰입니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # 프로덕션
```

`.env.local` (git 제외)

```
NEXT_PUBLIC_SUPABASE_URL=https://sreksnbkhipgpaybgrdw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...   # 토스 공개 테스트 키
```

## 기능

| 고객 | 관리자 (`/admin`) |
|---|---|
| 상품 목록·카테고리·검색·정렬 | 대시보드 (매출, 출고 대기, 재고 부족) |
| 상품 상세 (사양표, 리뷰/별점) | 상품 등록·수정, 이미지 업로드 (Storage) |
| 장바구니 (재고 검증) | 목록에서 가격·재고·판매여부 바로 수정 |
| 주문서 (다음 우편번호 검색) | 주문 상태 변경 (결제완료 → 배송완료) |
| 토스페이먼츠 결제 → Edge Function 승인 | |
| 회원가입·로그인, 마이페이지 (주문내역, 배송지) | |

## 폴더 구조

```
arduino-shop/
├── public/images/            # 상품·배너 사진 (CC 라이선스, /credits 페이지에 출처 표기)
├── supabase/
│   ├── migrations/           # DB 스키마, RLS, 함수 (MCP로 적용한 내용과 동일)
│   ├── functions/confirm-payment/  # 결제 승인 Edge Function (Deno)
│   └── seed.sql              # 카테고리 6개 + 상품 18개 (디바이스마트 가격 기준)
└── src/
    ├── proxy.ts              # 세션 갱신 + 로그인 필요 경로 보호 (Next 16: middleware → proxy)
    ├── app/
    │   ├── (shop)/           # 메인, 상품목록/상세, 장바구니, 결제(성공/실패)
    │   ├── (auth)/           # 로그인, 회원가입
    │   ├── auth/callback/    # 이메일 인증 링크 처리
    │   ├── mypage/           # 주문내역, 회원정보
    │   ├── admin/            # 관리자 (role = admin 만 접근)
    │   └── credits/          # 이미지 출처·라이선스
    ├── actions/              # Server Actions (auth, cart, order, review, profile, admin)
    ├── components/           # layout / product / cart / checkout / admin / auth / mypage / ui
    ├── lib/                  # supabase 클라이언트, auth 헬퍼, 장바구니 계산, 유틸
    └── types/database.ts     # Supabase에서 생성한 DB 타입
```

## 결제 흐름 (금액 위변조 방지)

1. 주문서 제출 → `create_order()` DB 함수가 **DB의 상품 가격**으로 금액 계산, 재고 확인 후 `pending` 주문 생성
2. 토스 결제창 호출 (`orderId` = 주문번호)
3. 성공 리다이렉트 → `confirm-payment` Edge Function이 로그인 사용자·주문 금액 검증 후 토스 승인 API 호출
4. `complete_order_payment()` 로 `paid` 처리, 재고 차감, 장바구니 비우기 (service_role 전용)

## 보안 (RLS)

- 상품/카테고리/리뷰: 누구나 조회, 쓰기는 관리자 (리뷰는 본인)
- 장바구니/주문: 본인 것만. 주문 생성·결제 완료는 DB 함수/Edge Function 으로만
- 일반 사용자는 자신의 `role` 을 바꿀 수 없음 (트리거)

## 실서비스 전환 시

- Supabase 대시보드 > Authentication > Email: 기본 메일 서버는 **프로젝트 팀원 주소로만** 발송됩니다.
  일반 고객 가입을 받으려면 커스텀 SMTP를 설정하거나 "Confirm email" 을 끄세요.
- Authentication > URL Configuration 의 Site URL 을 배포 주소로 변경
- 토스 실결제: `NEXT_PUBLIC_TOSS_CLIENT_KEY` 교체 + Edge Function 시크릿 `TOSS_SECRET_KEY` 설정
- 테스트 계정 삭제 (`TEST_ACCOUNTS.local.md` 참고)

## 데이터 출처

- 가격·상품명·사양: [디바이스마트](https://www.devicemart.co.kr) 2026-10-13 판매가 기준, 최소 정보만 정리
- 사진: Wikimedia Commons / Flickr 의 CC0·CC BY·CC BY-SA 사진 (작성자·라이선스는 `/credits`)
