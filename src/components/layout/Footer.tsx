import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-gray-500 sm:grid-cols-3">
        <div>
          <p className="mb-2 text-base font-bold text-brand-700">아두몰</p>
          <p>아두이노 부품 전문 쇼핑몰 (데모)</p>
          <p>가격 정보: 디바이스마트 판매가 기준 (2026.10.13)</p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-gray-700">고객센터</p>
          <p>평일 10:00 - 17:00 (점심 12:00 - 13:00)</p>
          <p>결제는 토스페이먼츠 테스트 모드로 동작합니다. 실제 청구되지 않습니다.</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="mb-1 font-semibold text-gray-700">바로가기</p>
          <Link href="/products" className="hover:text-gray-800">전체상품</Link>
          <Link href="/mypage" className="hover:text-gray-800">주문조회</Link>
          <Link href="/credits" className="hover:text-gray-800">이미지 출처 및 라이선스</Link>
        </div>
      </div>
    </footer>
  );
}
