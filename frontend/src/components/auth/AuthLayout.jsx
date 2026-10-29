// The page shape shared by Login and Signup: a navy panel on the left, the form on the right.
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,var(--navy)_0%,#08283f_100%)] p-8 text-white sm:p-14">
        <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-accent to-[#c96e17] font-display font-extrabold">M</div>
          <span className="font-display text-lg font-extrabold">Masar</span>
        </div>
        <div className="relative my-16 max-w-[34rem]">
          <p className="font-display text-sm font-bold text-accent">Don’t finance the idea. Understand it first.</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.08] tracking-tight !text-white sm:text-5xl">Know where your plan stands before you ask a bank.</h1>
        </div>
        <p className="relative text-[12px] text-on-navy-soft">Masar recommends. The bank decides.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px]">
          <h2 className="font-display text-2xl font-extrabold">{title}</h2>
          <p className="mb-6 mt-1.5 text-[13px] text-muted">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
