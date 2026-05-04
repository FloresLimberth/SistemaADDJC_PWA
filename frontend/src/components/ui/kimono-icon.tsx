import Image from 'next/image';

interface KimonoIconProps {
  className?: string;
  size?: number;
}

export function KimonoIcon({ className = '', size = 24 }: KimonoIconProps) {
  return (
    <Image
      src="/icons/kimono.svg"
      alt="Kimono"
      width={size}
      height={size}
      className={className}
    />
  );
}
