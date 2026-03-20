export function TrustBar() {
  return (
    <section className="bg-surface-container-low">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <svg
            className="text-primary"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="font-headline text-2xl font-bold text-on-surface">
            2.5M+
          </span>
          <span className="text-xs text-on-surface-variant">Happy Customers</span>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-sm font-semibold text-[#00b67a]">
            ★ Trustpilot
          </span>
          <span className="font-headline text-2xl font-bold text-on-surface">
            4.8/5
          </span>
          <span className="text-xs text-on-surface-variant">Global Rating</span>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <svg
            className="text-tertiary"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span className="font-headline text-2xl font-bold text-on-surface">
            Instant
          </span>
          <span className="text-xs text-on-surface-variant">
            Digital Delivery
          </span>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex gap-1.5 text-on-surface-variant">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7z" /><circle cx="12" cy="12" r="3" /></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
          </div>
          <span className="font-headline text-lg font-bold text-on-surface">
            Secure
          </span>
          <span className="text-xs text-on-surface-variant">
            Multiple Payment Methods
          </span>
        </div>
      </div>
    </section>
  );
}
