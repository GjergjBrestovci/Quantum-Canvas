import Link from 'next/link';

interface Props { title: string; description: string; href: string; }
export function SimulationCard({ title, description, href }: Props) {
  return (
    <Link href={href} className="group border border-gray-700/60 rounded-xl p-5 bg-[#1b1b1b] hover:border-accent transition relative overflow-hidden">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-accent/10 to-accent2/10 blur-xl" />
      <div className="relative z-10 space-y-2">
        <h3 className="text-lg font-medium neon-accent2 group-hover:neon-accent">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}
