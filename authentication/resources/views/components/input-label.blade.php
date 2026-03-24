@props(['value'])

<label {{ $attributes }}>
    <span class="block text-xs font-bold tracking-[0.2em] uppercase text-primary/80">{{ $value ?? $slot }}</span>
</label>
