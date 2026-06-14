import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="auth-bg flex items-center justify-center p-4 md:p-8">
      <div className="auth-orb -top-32 -right-32 w-[500px] h-[500px] bg-mandal-saffron/20 animate-float" />
      <div
        className="auth-orb -bottom-32 -left-32 w-[400px] h-[400px] bg-mandal-gold/25"
        style={{ animationDelay: "2s" }}
      />
      <div className="auth-orb top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-mandal-maroon/5" />

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-5">
            <div className="absolute inset-0 bg-saffron-gradient rounded-full blur-xl opacity-40 scale-110" />
            <div className="relative w-24 h-24 rounded-full bg-saffron-gradient flex items-center justify-center text-white text-4xl font-bold shadow-glow ring-4 ring-white/50">
              ॐ
            </div>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-mandal-maroon leading-tight">
            Bolinjcha Vighnaharta
          </h1>
          <p className="text-mandal-maroon/60 mt-1 font-medium">
            Sarvajanik Utsav Mandal
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-mandal-gold/30 text-sm text-mandal-maroon/80">
            <span className="w-1.5 h-1.5 rounded-full bg-mandal-saffron animate-pulse" />
            {title}
          </div>
          <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
        </div>

        <div className="auth-card">{children}</div>

        {footer}

        <p className="text-center text-sm font-display text-mandal-maroon/40 mt-8 tracking-wide">
          गणपती बाप्पा मोरया
        </p>
      </div>
    </div>
  );
}

export function AuthFooterLink({
  text,
  linkText,
  href,
}: {
  text: string;
  linkText: string;
  href: string;
}) {
  return (
    <p className="text-center text-sm text-gray-500 mt-6">
      {text}{" "}
      <Link
        href={href}
        className="text-mandal-saffron font-semibold hover:text-mandal-saffron-dark transition-colors"
      >
        {linkText}
      </Link>
    </p>
  );
}
