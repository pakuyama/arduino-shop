"use client";

import { useActionState } from "react";
import { updateProfile } from "@/actions/profile";
import AddressFields from "@/components/checkout/AddressFields";
import SubmitButton from "@/components/ui/SubmitButton";
import type { Profile } from "@/types/database";

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useActionState(updateProfile, undefined);
  return (
    <form action={formAction} className="space-y-3 text-sm">
      <label className="block space-y-1">
        <span className="text-gray-600">이름</span>
        <input name="name" defaultValue={profile.name ?? ""} className="input" />
      </label>
      <label className="block space-y-1">
        <span className="text-gray-600">연락처</span>
        <input name="phone" defaultValue={profile.phone ?? ""} className="input" placeholder="010-1234-5678" />
      </label>
      <div className="space-y-1">
        <span className="text-gray-600">기본 배송지</span>
        <AddressFields
          defaults={{ zipcode: profile.zipcode ?? "", address1: profile.address1 ?? "", address2: profile.address2 ?? "" }}
        />
      </div>
      {state?.error && <p className="text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-brand-700">저장되었습니다.</p>}
      <SubmitButton className="btn-primary w-full" pendingText="저장 중...">저장</SubmitButton>
    </form>
  );
}
