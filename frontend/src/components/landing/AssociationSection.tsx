import Image from 'next/image';

export function AssociationSection() {
  return (
    <section className="bg-white pt-16">
      <div className="container mx-auto px-16">
        <div className="grid grid-cols-2 gap-16 items-center mb-24 animate-[fadeInUp_0.8s_ease-out]">
          {/* Texto izquierda */}
          <div>
            <h2 className="text-[2.5rem] font-bold mb-6 text-secondary tracking-[-0.5px]">
              La Asociación
            </h2>
            <p className="text-[1.1rem] text-text-light mb-8 leading-[1.8]">
              La Asociación Deportiva Departamental de Judo de Cochabamba
              (ADDJC) es el organismo encargado de promover y desarrollar el
              judo en la región. A través de sus programas y competencias, la
              ADDJC busca fomentar la práctica de este deporte, identificar
              nuevos talentos y representar a Cochabamba en eventos nacionales e
              internacionales.
            </p>
            <button className="bg-text-dark text-white border-none px-9 py-[14px] text-base font-semibold rounded-lg cursor-pointer transition-all duration-300 uppercase tracking-[1px] hover:bg-primary hover:-translate-y-[2px] hover:shadow-md">
              Leer Más
            </button>
          </div>

          {/* Imagen derecha */}
          <div className="animate-[fadeInRight_0.8s_ease-out]">
            <div className="relative w-full aspect-[1/1] rounded-[20px] shadow-lg overflow-hidden">
              <Image
                src="/images/imagen01.jpg"
                alt="Atleta de judo"
                fill
                className="object-cover"
                style={{ filter: 'grayscale(100%) contrast(1.1)' }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
