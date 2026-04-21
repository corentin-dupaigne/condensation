<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <meta name="theme-color" content="#0c0e11">
  <title>{{ config('app.name', 'Condensation') }}</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.bunny.net">
  <link href="https://fonts.bunny.net/css?family=space-grotesk:400,700,900&family=inter:400,500,600,700&display=swap" rel="stylesheet" />

  <!-- Design tokens + glass panel -->
  <style>
    :root {
      --primary:                    #d575ff;
      --primary-container:          #9800d0;
      --on-primary:                 #fff5fc;
      --secondary:                  #a1faff;
      --tertiary:                   #f3ffca;
      --cta:                        #F43F5E;
      --error:                      #ff716c;
      --surface:                    #0c0e11;
      --surface-container:          #171a1d;
      --surface-container-high:     #1d2024;
      --surface-container-highest:  #23262a;
      --surface-container-low:      #111417;
      --surface-bright:             #292c31;
      --on-surface:                 #f9f9fd;
      --on-surface-variant:         #aaabaf;
      --outline:                    #747579;
      --outline-variant:            #46484b;
    }
    .glass-panel {
      background: rgba(23, 26, 29, 0.70);
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
            'surface-container-high':    'var(--surface-container-high)',
            'surface-container-highest': 'var(--surface-container-highest)',
            'surface-container-low':     'var(--surface-container-low)',
            'surface-bright':            'var(--surface-bright)',
            'cta':                       'var(--cta)',
            'error':                     'var(--error)',
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
<body class="font-headline antialiased text-on-surface"
      style="background-image: url('https://media.discordapp.net/attachments/1152679908976377997/1496023265511080007/bg.png?ex=69e85fbd&is=69e70e3d&hm=ddc55c6a2d8ba222ff6d929ca231e3ec002df29cb217d1ead9e874f374b088e9&=&format=webp&quality=lossless'); background-size: cover; background-position: center; background-repeat: no-repeat; background-attachment: fixed;">

  <!-- Ambient glow blobs -->
  <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div class="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]"></div>
    <div class="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-secondary/5 blur-[100px]"></div>
  </div>

  <div class="flex min-h-screen flex-col">
    <main class="flex grow items-center justify-center p-4 h-screen">
      <div class="z-10 w-full h-full">
        {{ $slot }}
      </div>
    </main>
  </div>
</body>
</html>
