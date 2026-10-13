import Form from "next/form";

export default function SearchBar() {
  return (
    <Form action="/products" className="hidden max-w-md flex-1 sm:flex">
      <input
        name="q"
        placeholder="상품명, 모델명 검색 (예: 우노, HC-SR04)"
        className="input rounded-r-none"
        aria-label="상품 검색"
      />
      <button className="shrink-0 whitespace-nowrap rounded-r-md bg-gray-800 px-4 text-sm font-semibold text-white hover:bg-gray-900">검색</button>
    </Form>
  );
}
