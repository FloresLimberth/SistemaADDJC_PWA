'use client';

import Link from 'next/link';
import { KimonoIcon } from '@/components/ui/kimono-icon';
import { Button } from '@/components/ui/button';
import { Facebook } from 'lucide-react';

export function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-[1000] transition-all duration-300">
      <nav className="max-w-[1400px] mx-auto px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-[1.3rem] text-secondary">
          <KimonoIcon size={32} className="inline-block" />
          <span className="tracking-tight">ADDJC</span>
        </div>

        <ul className="flex list-none gap-10">
          <li>
            <a
              href="#home"
              className="no-underline text-text-dark font-semibold text-[0.95rem] tracking-[0.5px] relative transition-all duration-300 hover:text-primary after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-[width] after:duration-300 hover:after:w-full"
            >
              HOME
            </a>
          </li>
          <li>
            <a
              href="#calendario"
              className="no-underline text-text-dark font-semibold text-[0.95rem] tracking-[0.5px] relative transition-all duration-300 hover:text-primary after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-[width] after:duration-300 hover:after:w-full"
            >
              CALENDARIO
            </a>
          </li>
          <li>
            <a
              href="#contacto"
              className="no-underline text-text-dark font-semibold text-[0.95rem] tracking-[0.5px] relative transition-all duration-300 hover:text-primary after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-[width] after:duration-300 hover:after:w-full"
            >
              CONTACTO
            </a>
          </li>
        </ul>

        <div className="flex items-center gap-6">
          <Button
            asChild
            className="bg-primary text-white border-none px-6 py-[10px] text-[0.9rem] font-semibold rounded-lg cursor-pointer transition-all duration-300 tracking-[0.3px] hover:bg-primary-dark hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(255,107,0,0.3)]"
          >
            <Link href="/login">Iniciar Sesión</Link>
          </Button>

          <a
            href="https://www.facebook.com/profile.php?id=61556345150638&mibextid=ZbWKwL"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 flex items-center justify-center bg-text-dark text-white rounded-full transition-all duration-300 no-underline hover:bg-primary hover:-translate-y-[3px]"
          >
            <Facebook size={20} />
          </a>
        </div>
      </nav>
    </header>
  );
}
