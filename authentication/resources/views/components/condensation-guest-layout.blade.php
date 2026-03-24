<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <meta name="theme-color" content="#0e0e12">
  <title>{{ config('app.name', 'Condensation') }}</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.bunny.net">
  <link href="https://fonts.bunny.net/css?family=space-grotesk:400,700,900&family=inter:400,500,600,700&display=swap" rel="stylesheet" />

  <!-- Design tokens + glass panel -->
  <style>
    :root {
      --primary:                    #d575ff;
      --primary-container:          #a020f0;
      --on-primary:                 #ffffff;
      --secondary:                  #f472b6;
      --tertiary:                   #34d399;
      --surface:                    #0e0e12;
      --surface-container:          #1a1a24;
      --surface-container-highest:  #2a2a38;
      --surface-bright:             #32324a;
      --on-surface:                 #e8e8f0;
      --on-surface-variant:         #9090a8;
      --outline:                    #505068;
      --outline-variant:            #3a3a50;
    }
    .glass-panel {
      background: rgba(20, 20, 32, 0.70);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
    }
  </style>

  <!-- CDN Tailwind — config must be set AFTER this loads (tailwind is undefined before) -->
  <script src="https://cdn.tailwindcss.com"></script>

  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'primary':                   'var(--primary)',
            'primary-container':         'var(--primary-container)',
            'on-primary':                'var(--on-primary)',
            'secondary':                 'var(--secondary)',
            'tertiary':                  'var(--tertiary)',
            'surface':                   'var(--surface)',
            'surface-container':         'var(--surface-container)',
            'surface-container-highest': 'var(--surface-container-highest)',
            'surface-bright':            'var(--surface-bright)',
            'on-surface':                'var(--on-surface)',
            'on-surface-variant':        'var(--on-surface-variant)',
            'outline':                   'var(--outline)',
            'outline-variant':           'var(--outline-variant)',
          },
          fontFamily: {
            headline: ['Space Grotesk', 'sans-serif'],
            body:     ['Inter', 'sans-serif'],
          },
        },
      },
    };
  </script>

  <!-- Vanilla JS helpers -->
  <script>
    function togglePassword(inputId, btn) {
      const input = document.getElementById(inputId);
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.querySelector('.eye-open').classList.toggle('hidden');
      btn.querySelector('.eye-closed').classList.toggle('hidden');
    }

    function initTermsCheckbox(checkboxId, submitId) {
      const checkbox = document.getElementById(checkboxId);
      const submit   = document.getElementById(submitId);
      checkbox.addEventListener('click', function () {
        const agreed = this.getAttribute('aria-checked') === 'false';
        this.setAttribute('aria-checked', String(agreed));
        this.classList.toggle('bg-primary',      agreed);
        this.classList.toggle('border-primary',  agreed);
        this.querySelector('.check-icon').classList.toggle('hidden', !agreed);
        submit.disabled = !agreed;
        submit.classList.toggle('opacity-40',         !agreed);
        submit.classList.toggle('cursor-not-allowed', !agreed);
        submit.classList.toggle('shadow-none',        !agreed);
      });
    }
  </script>
</head>
<body class="font-body antialiased bg-surface text-on-surface">

  <!-- Ambient glow blobs -->
  <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div class="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]"></div>
    <div class="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-secondary/5 blur-[100px]"></div>
  </div>

  <div class="flex min-h-screen flex-col">
    <main class="flex grow items-center justify-center px-6 pt-12 pb-16">
      <div class="z-10 w-full max-w-[480px]">
        {{ $slot }}
      </div>
    </main>

    <footer class="flex flex-col items-center gap-3 py-8">
      <div class="flex flex-wrap justify-center gap-6">
        @foreach(['Terms of Service', 'Privacy Policy', 'Cookie Settings', 'Support'] as $label)
          <a href="#" class="text-xs font-body uppercase tracking-widest text-primary/60 transition-all hover:text-secondary">
            {{ $label }}
          </a>
        @endforeach
      </div>
      <p class="text-xs font-body uppercase tracking-widest text-on-surface-variant/40">
        &copy; {{ date('Y') }} Condensation. All rights reserved.
      </p>
    </footer>
  </div>
</body>
</html>
