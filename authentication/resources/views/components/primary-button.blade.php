<button {{ $attributes->merge(['type' => 'submit', 'class' => 'inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary-container py-4 font-headline text-base font-black tracking-tight text-on-primary shadow-[0_0_20px_rgba(213,117,255,0.25)] transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none']) }}>
    {{ $slot }}
</button>
