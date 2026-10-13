"use client";

import { useRef, useState } from "react";

type DaumPostcodeData = { zonecode: string; roadAddress: string; jibunAddress: string; buildingName: string };
declare global {
  interface Window {
    daum?: { Postcode: new (opts: { oncomplete: (data: DaumPostcodeData) => void }) => { open: () => void } };
  }
}

const POSTCODE_SRC = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

function loadPostcode() {
  return new Promise<void>((resolve, reject) => {
    if (window.daum?.Postcode) return resolve();
    const script = document.createElement("script");
    script.src = POSTCODE_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("우편번호 서비스를 불러오지 못했습니다."));
    document.head.appendChild(script);
  });
}

// 다음(카카오) 우편번호 서비스 - 키 없이 무료로 사용 가능
export default function AddressFields({
  defaults,
}: {
  defaults: { zipcode: string; address1: string; address2: string };
}) {
  const [zipcode, setZipcode] = useState(defaults.zipcode);
  const [address1, setAddress1] = useState(defaults.address1);
  const detailRef = useRef<HTMLInputElement>(null);

  async function openSearch() {
    try {
      await loadPostcode();
      new window.daum!.Postcode({
        oncomplete: (data) => {
          setZipcode(data.zonecode);
          setAddress1(data.roadAddress + (data.buildingName ? ` (${data.buildingName})` : ""));
          detailRef.current?.focus();
        },
      }).open();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input name="zipcode" value={zipcode} onChange={(e) => setZipcode(e.target.value)} placeholder="우편번호" className="input max-w-36" />
        <button type="button" onClick={openSearch} className="btn-outline shrink-0">주소 검색</button>
      </div>
      <input name="address1" value={address1} onChange={(e) => setAddress1(e.target.value)} placeholder="기본 주소" className="input" required />
      <input ref={detailRef} name="address2" defaultValue={defaults.address2} placeholder="상세 주소 (동/호수)" className="input" />
    </div>
  );
}
