export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Replace /a1-logo.png with your logo file — drop it in public/ */}
      <span className="flex h-9 w-9 items-center justify-center rounded bg-blue-gradient text-white text-base font-black shadow-blue-glow shrink-0">
        A1
      </span>
      <span className="text-xl font-bold tracking-tight text-white leading-none">
        Creative<span className="text-blue">.</span>
      </span>
    </span>
  );
}
