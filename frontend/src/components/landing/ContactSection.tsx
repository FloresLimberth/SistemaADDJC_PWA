import { Phone } from 'lucide-react';

const contactos = [
  {
    nombre: 'Ivette Pérez',
    cargo: 'Directora Técnica',
    telefono: '+591 72247155',
  },
  {
    nombre: 'Mario Fernández',
    cargo: 'Entrenador Técnico',
    telefono: '+591 78881234',
  },
  {
    nombre: 'José Gutiérrez',
    cargo: 'Entrenador Físico',
    telefono: '+591 71125678',
  },
  {
    nombre: 'Ximena Rodríguez',
    cargo: 'Comité Técnico',
    telefono: '+591 73124567',
  },
  {
    nombre: 'Samuel Ugarte',
    cargo: 'Comité Técnico',
    telefono: '+591 72239012',
  },
];

export function ContactSection() {
  return (
    <section id="contacto" className="bg-white py-20">
      <div className="container mx-auto px-8 lg:px-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-secondary tracking-tight">
            Contacto
          </h2>
          <p className="text-gray-500 mt-2">
            Comunícate con el equipo de la ADDJC
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
          {contactos.map((c) => (
            <div
              key={c.telefono}
              className="bg-gray-50 border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md w-full sm:w-[280px]"
            >
              <h3 className="text-lg font-bold text-secondary mb-1">
                {c.nombre}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{c.cargo}</p>
              <a
                href={`tel:${c.telefono.replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors"
              >
                <Phone size={18} />
                <span>{c.telefono}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
