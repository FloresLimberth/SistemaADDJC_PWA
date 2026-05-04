import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden mt-[70px]">
      {/* Background Image */}
      <Image
        src="/images/imagen02.jpg"
        alt="Judo training background"
        fill
        priority
        className="object-cover grayscale"
      />

      {/* Gradient Overlay - Tonalidades de gris */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(40, 40, 40, 0.7) 50%, rgba(120, 120, 120, 0.8) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] w-full mx-auto px-16 flex items-center justify-start">
        <div className="max-w-[700px] text-white animate-[fadeInLeft_1s_ease-out]">
          <h1
            className="text-[4rem] font-bold mb-6 leading-[1.1] tracking-[-1.5px]"
            style={{ textShadow: '0 4px 30px rgba(0, 0, 0, 0.5)' }}
          >
            Sistema de Planificación
            <br />
            del Entrenamiento
          </h1>
          <p
            className="text-[1.4rem] mb-0 opacity-95 font-normal leading-[1.5]"
            style={{ textShadow: '0 2px 15px rgba(0, 0, 0, 0.4)' }}
          >
            Asociación Deportiva Departamental de Judo de Cochabamba
          </p>
        </div>
      </div>
    </section>
  );
}
