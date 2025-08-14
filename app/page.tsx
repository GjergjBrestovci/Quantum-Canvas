import Link from 'next/link';
import { Logo } from '../components/Logo';
import { SimulationCard } from '../components/SimulationCard';

export default function Home() {
  return (
    <main className="p-6 md:p-10 space-y-10 fade-in">
      <header className="flex items-center justify-between">
        <Logo />
        <nav className="flex gap-6 text-sm">
          <Link href="/double-slit" className="hover:text-accent">Double Slit</Link>
          <Link href="/tunneling" className="hover:text-accent">Tunneling</Link>
          <Link href="/duality" className="hover:text-accent">Wave-Particle Duality</Link>
        </nav>
      </header>
      <section className="grid gap-6 md:grid-cols-3">
        <SimulationCard href="/double-slit" title="Double Slit" description="Interference build-up & intensity pattern"/>
        <SimulationCard href="/tunneling" title="Quantum Tunneling" description="Wave packet meets potential barrier"/>
        <SimulationCard href="/duality" title="Wave–Particle Duality" description="Toggle wave and particle views"/>
      </section>
    </main>
  );
}
