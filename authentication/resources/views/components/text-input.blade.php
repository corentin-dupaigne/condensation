@props(['disabled' => false])

<input @disabled($disabled) {{ $attributes->merge(['class' => 'w-full rounded-xl border-0 bg-surface-container-highest px-4 py-4 text-sm text-on-surface placeholder:text-outline/50 outline-none transition-all focus:ring-1 focus:ring-primary/40']) }}>
