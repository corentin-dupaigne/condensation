<x-condensation-guest-layout>
  <div class="w-full h-full flex gap-6 items-center">
    <div class="w-full h-full object-fill">
      <img src="https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2399830/ss_f54032df135de28a4f4880057cd48c1c8b259870.1920x1080.jpg?t=1766710980" alt="" class="h-full w-full object-cover rounded-2xl shadow-2xl">
    </div>
    <div class="w-1/3 mx-20">
      <a href="{{ config('app.frontend_url', '/') }}"
         class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface">
        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
        </svg>
        {{ __('Return to Home') }}
      </a>
      <div class="glass-panel rounded-2xl border border-outline-variant/10 p-10 shadow-2xl">
    <header class="mb-8 text-center">
      <h1 class="mb-2 font-headline text-5xl font-black uppercase tracking-tighter text-on-surface">Sign Up</h1>
      <p class="font-medium tracking-tight text-on-surface-variant">Forge your account. Enter the armory.</p>
    </header>

    <form method="POST" action="{{ route('register') }}" class="space-y-5">
      @csrf

      {{-- Username --}}
      <div class="space-y-2">
        <x-input-label for="name" :value="__('Username')" class="ml-1" />
        <div class="group relative">
          <x-text-input id="name" type="text" name="name" :value="old('name')"
            required autofocus autocomplete="name" placeholder="Username" />
          <div class="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-focus-within:w-full"></div>
        </div>
        <x-input-error :messages="$errors->get('name')" class="mt-1" />
      </div>

      {{-- Email --}}
      <div class="space-y-2">
        <x-input-label for="email" :value="__('Email')" class="ml-1" />
        <div class="group relative">
          <x-text-input id="email" type="email" name="email" :value="old('email')"
            required autocomplete="username" placeholder="email@example.com" />
          <div class="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-focus-within:w-full"></div>
        </div>
        <x-input-error :messages="$errors->get('email')" class="mt-1" />
      </div>

      {{-- Password --}}
      <div class="space-y-2">
        <x-input-label for="password" :value="__('Password')" class="ml-1" />
        <div class="group relative">
          <input id="password" type="password" name="password"
                 required autocomplete="new-password" placeholder="{{ __('8+ characters') }}"
                 class="w-full rounded-lg border-0 bg-surface-container-highest px-4 py-4 pr-12 font-headline text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none transition-all focus:ring-1 focus:ring-primary/40" />
          <button type="button" tabindex="-1" aria-label="{{ __('Show password') }}"
                  onclick="togglePassword('password', this)"
                  class="absolute right-3 top-1/2 -translate-y-1/2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-bright hover:text-on-surface">
            <svg class="eye-open hidden h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
            </svg>
            <svg class="eye-closed h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" x2="22" y1="2" y2="22" />
            </svg>
          </button>
          <div class="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-focus-within:w-full"></div>
        </div>
        <x-input-error :messages="$errors->get('password')" class="mt-1" />
      </div>

      {{-- Confirm Password --}}
      <div class="space-y-2">
        <x-input-label for="password_confirmation" :value="__('Confirm Password')" class="ml-1" />
        <div class="group relative">
          <input id="password_confirmation" type="password" name="password_confirmation"
                 required autocomplete="new-password" placeholder="{{ __('Repeat your password') }}"
                 class="w-full rounded-lg border-0 bg-surface-container-highest px-4 py-4 pr-12 font-headline text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none transition-all focus:ring-1 focus:ring-primary/40" />
          <button type="button" tabindex="-1" aria-label="{{ __('Show confirm password') }}"
                  onclick="togglePassword('password_confirmation', this)"
                  class="absolute right-3 top-1/2 -translate-y-1/2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-bright hover:text-on-surface">
            <svg class="eye-open hidden h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
            </svg>
            <svg class="eye-closed h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" x2="22" y1="2" y2="22" />
            </svg>
          </button>
          <div class="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-focus-within:w-full"></div>
        </div>
        <x-input-error :messages="$errors->get('password_confirmation')" class="mt-1" />
      </div>

      {{-- Terms Checkbox --}}
      <div class="flex items-center gap-3 pt-1">
        <div class="relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center">
        <button id="terms-checkbox" type="button" role="checkbox" aria-checked="false"
                class="h-5 w-5 shrink-0 cursor-pointer rounded border border-outline bg-surface-container-highest transition-all hover:border-primary/60">
          <svg class="check-icon hidden h-full w-full p-0.5" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" class="text-on-primary" />
          </svg>
        </button>
        </div>
        <p class="text-sm text-on-surface-variant leading-snug">
          {{ __('I agree to the') }}
          <a href="#" class="font-semibold text-primary hover:underline">{{ __('Terms of Service') }}</a>
          {{ __('and') }}
          <a href="#" class="font-semibold text-primary hover:underline">{{ __('Privacy Policy') }}</a>
        </p>
      </div>

      {{-- Submit: raw <button> (not x-primary-button) — needs stable id for initTermsCheckbox() --}}
      <button id="register-submit" type="submit" disabled
              class="mt-2 inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary-container py-4 font-headline text-base font-black tracking-tight text-on-primary opacity-40 shadow-none transition-all">
        {{ __('Create Account') }}
      </button>
    </form>

        <div class="mt-8 text-center">
          <p class="text-sm text-on-surface-variant">
            {{ __('Already have an account?') }}
            <a href="{{ route('login', request()->query()) }}" class="ml-1 font-bold text-primary hover:underline">
              {{ __('Sign in') }}
            </a>
          </p>
        </div>
      </div>
    </div>
    
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', function () {
      initTermsCheckbox('terms-checkbox', 'register-submit');
    });
  </script>
</x-condensation-guest-layout>
