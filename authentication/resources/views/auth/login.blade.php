<x-condensation-guest-layout>
  <div class="w-full h-full flex gap-6 items-center">
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
        <header class="mb-10 text-center">
          <h1 class="mb-2 font-headline text-5xl font-black uppercase tracking-tighter text-on-surface">Sign In</h1>
          <p class="font-medium tracking-tight text-on-surface-variant">Access your digital armory.</p>
        </header>
        <x-auth-session-status class="mb-4" :status="session('status')" />
        <form method="POST" action="{{ route('login') }}" class="space-y-5">
          @csrf
          {{-- Email --}}
          <div class="space-y-2">
            <x-input-label for="email" :value="__('Email')" class="ml-1" />
            <div class="group relative">
              <x-text-input id="email" type="email" name="email" :value="old('email')"
                required autofocus autocomplete="username"
                placeholder="email@example.com" />
              <div class="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-focus-within:w-full"></div>
            </div>
            <x-input-error :messages="$errors->get('email')" class="mt-1" />
          </div>
          {{-- Password --}}
          <div class="space-y-2">
            <div class="flex items-center justify-between px-1">
              <x-input-label for="password" :value="__('Password')" />
              @if (Route::has('password.request'))
                <a href="{{ route('password.request', request()->query()) }}"
                   class="text-xs font-bold tracking-widest uppercase text-secondary/80 transition-colors hover:text-secondary">
                  {{ __('Forgot password?') }}
                </a>
              @endif
            </div>
            <div class="group relative">
              <input id="password" type="password" name="password"
                     required autocomplete="current-password"
                     placeholder="{{ __('Password') }}"
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
          {{-- Remember Me --}}
          <div class="block">
            <label for="remember_me" class="inline-flex items-center cursor-pointer">
              <input id="remember_me" type="checkbox" name="remember"
                     class="rounded border-outline bg-surface-container-highest accent-[var(--primary)] focus:ring-primary/40" />
              <span class="ms-2 text-sm text-on-surface-variant">{{ __('Remember me') }}</span>
            </label>
          </div>
          <x-primary-button class="mt-2">{{ __('Sign In') }}</x-primary-button>
        </form>
        @if (Route::has('register'))
          <div class="mt-8 text-center">
            <p class="text-sm text-on-surface-variant">
              {{ __("Don't have an account?") }}
              <a href="{{ route('register', request()->query()) }}" class="ml-1 font-bold text-primary hover:underline">
                {{ __('Sign up') }}
              </a>
            </p>
          </div>
        @endif
      </div>
    </div>
    <div class="w-full h-full object-fill">
      <img src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3681010/8c9333bf3f28194cb8113af455ecaf1aa45a0050/ss_8c9333bf3f28194cb8113af455ecaf1aa45a0050.1920x1080.jpg?t=1772090941" alt="" class="h-full w-full object-cover rounded-2xl shadow-2xl">
    </div>
  </div>
</x-condensation-guest-layout>
