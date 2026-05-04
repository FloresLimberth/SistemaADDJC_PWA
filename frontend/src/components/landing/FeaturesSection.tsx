import { Layers, Grid3x3, Users, Shield } from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Camino a la Perfección',
    description: 'Desarrollo continuo de habilidades y técnicas avanzadas',
  },
  {
    icon: Grid3x3,
    title: 'Competencia Sana',
    description: 'Fomentamos valores deportivos y espíritu competitivo ético',
  },
  {
    icon: Users,
    title: 'Masificar la Práctica del Judo',
    description: 'Expandir el alcance del judo en toda la comunidad',
  },
  {
    icon: Shield,
    title: 'Seguridad y Bienestar',
    description: 'Entornos seguros y saludables para todos los atletas',
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-white pb-12">
      <div className="container mx-auto px-16">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-16 animate-[fadeIn_0.8s_ease-out]">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white p-10 px-8 rounded-2xl shadow-sm transition-all duration-300 text-center hover:-translate-y-2 hover:shadow-lg"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary to-accent rounded-[20px] flex items-center justify-center text-white">
                <feature.icon className="h-12 w-12" strokeWidth={2} />
              </div>
              <h3 className="text-[1.3rem] font-bold mb-4 text-secondary">
                {feature.title}
              </h3>
              <p className="text-text-light leading-[1.6]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
