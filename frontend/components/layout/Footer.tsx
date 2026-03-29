export function Footer() {
  return (
    <footer className="bg-surface-container-low">
      <div className="mx-auto px-12 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h4 className="mb-4 font-headline text-sm font-semibold uppercase tracking-wider text-on-surface">
              Marketplace
            </h4>
            <ul className="space-y-2">
              {["Browse Games", "Deals", "New Releases", "Pre-orders"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-on-surface-variant transition-colors hover:text-on-surface"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-headline text-sm font-semibold uppercase tracking-wider text-on-surface">
              Account
            </h4>
            <ul className="space-y-2">
              {["My Orders", "Wishlist", "Wallet", "Settings"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-on-surface-variant transition-colors hover:text-on-surface"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-headline text-sm font-semibold uppercase tracking-wider text-on-surface">
              Support
            </h4>
            <ul className="space-y-2">
              {["Help Center", "FAQ", "Contact Us", "How It Works"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-on-surface-variant transition-colors hover:text-on-surface"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-headline text-sm font-semibold uppercase tracking-wider text-on-surface">
              Legal
            </h4>
            <ul className="space-y-2">
              {[
                "Terms of Service",
                "Privacy Policy",
                "Cookie Policy",
                "Refund Policy",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-on-surface-variant transition-colors hover:text-on-surface"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-outline-variant/20 pt-8 md:flex-row">
          <p className="font-headline text-lg font-bold tracking-tight text-primary">
            CONDENSATION
          </p>
          <p className="text-xs text-on-surface-variant">
            &copy; {new Date().getFullYear()} Condensation. All rights reserved.
          </p>
          <div className="flex gap-3 text-on-surface-variant">
            {["Visa", "Mastercard", "PayPal", "Crypto"].map((method) => (
              <span
                key={method}
                className="rounded bg-surface-container-highest px-2 py-1 text-[10px] font-medium"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
