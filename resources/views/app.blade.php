<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        @if (filled(config('services.google.site_verification')))
            <meta name="google-site-verification" content="{{ config('services.google.site_verification') }}" />
        @endif
        @if (filled(config('services.google.gtm_id')))
            {{-- Google Tag Manager --}}
            <script>
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','{{ config('services.google.gtm_id') }}');
            </script>
            {{-- End Google Tag Manager --}}
        @endif

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: #ffffff;
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }

            @if(isset($themeSettings) && $themeSettings)
            :root {
                --theme-primary: {{ $themeSettings->primary_color }};
                --theme-secondary: {{ $themeSettings->secondary_color }};
                --theme-button: {{ $themeSettings->button_color }};
                --theme-header: {{ $themeSettings->header_color }};
                --theme-footer: {{ $themeSettings->footer_color }};
            }
            @endif
        </style>

        <link rel="icon" href="/storage/mahadev-logo.png" type="image/png">
        <link rel="apple-touch-icon" href="/storage/mahadev-logo.png">
        <link rel="preload" href="/fonts/helvetica/texgyreheros-regular.woff2" as="font" type="font/woff2" crossorigin>
        <link rel="preload" href="/fonts/helvetica/texgyreheros-bold.woff2" as="font" type="font/woff2" crossorigin>
        <style>
            @font-face {
                font-family: 'Mahadev Sans';
                src: url('/fonts/helvetica/texgyreheros-regular.woff2') format('woff2');
                font-weight: 400;
                font-style: normal;
                font-display: swap;
            }

            @font-face {
                font-family: 'Mahadev Sans';
                src: url('/fonts/helvetica/texgyreheros-bold.woff2') format('woff2');
                font-weight: 700;
                font-style: normal;
                font-display: swap;
            }
        </style>

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @php
            $seo = $page['props']['seo'] ?? null;
            $documentTitle = is_array($seo) && filled($seo['title'] ?? null)
                ? $seo['title']
                : config('app.name', 'Mahadev Multipurpose Co-operative Society Ltd');
            $documentDescription = is_array($seo) && filled($seo['description'] ?? null)
                ? $seo['description']
                : null;
        @endphp
        <x-inertia::head>
            <title>{{ $documentTitle }}</title>
            @if ($documentDescription)
                <meta name="description" content="{{ $documentDescription }}">
                <meta property="og:title" content="{{ $documentTitle }}">
                <meta property="og:description" content="{{ $documentDescription }}">
            @endif
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        @if (filled(config('services.google.gtm_id')))
            {{-- Google Tag Manager (noscript) --}}
            <noscript>
                <iframe
                    src="https://www.googletagmanager.com/ns.html?id={{ config('services.google.gtm_id') }}"
                    height="0"
                    width="0"
                    style="display:none;visibility:hidden"
                ></iframe>
            </noscript>
            {{-- End Google Tag Manager (noscript) --}}
        @endif
        @if(filled(config('services.meta.pixel_id')))
        <noscript>
            <img
                height="1"
                width="1"
                style="display:none"
                src="https://www.facebook.com/tr?id={{ config('services.meta.pixel_id') }}&ev=PageView&noscript=1"
                alt=""
            />
        </noscript>
        @endif

        <x-inertia::app />
    </body>
</html>
