import Image from "next/image";

export default function ProductImage({
  src,
  alt,
  sizes,
  priority,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
        이미지 준비중
      </div>
    );
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-contain p-3" />;
}
