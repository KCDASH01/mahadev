<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>" class="<?php echo \Illuminate\Support\Arr::toCssClasses(['dark' => ($appearance ?? 'system') == 'dark']); ?>">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <?php if(filled(config('services.google.site_verification'))): ?>
            <meta name="google-site-verification" content="<?php echo e(config('services.google.site_verification')); ?>" />
        <?php endif; ?>
        <?php if(filled(config('services.google.gtm_id'))): ?>
            
            <script>
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','<?php echo e(config('services.google.gtm_id')); ?>');
            </script>
            
        <?php endif; ?>

        
        <script>
            (function() {
                const appearance = '<?php echo e($appearance ?? "system"); ?>';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        
        <style>
            html {
                background-color: #ffffff;
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }

            <?php if(isset($themeSettings) && $themeSettings): ?>
            :root {
                --theme-primary: <?php echo e($themeSettings->primary_color); ?>;
                --theme-secondary: <?php echo e($themeSettings->secondary_color); ?>;
                --theme-button: <?php echo e($themeSettings->button_color); ?>;
                --theme-header: <?php echo e($themeSettings->header_color); ?>;
                --theme-footer: <?php echo e($themeSettings->footer_color); ?>;
            }
            <?php endif; ?>
        </style>

        <link rel="icon" href="/storage/mahadev-logo.jpeg" type="image/jpeg">
        <link rel="apple-touch-icon" href="/storage/mahadev-logo.jpeg">
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

        <?php echo app('Illuminate\Foundation\Vite')->fonts(); ?>

        <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
        <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"]); ?>
        <?php
            $seo = $page['props']['seo'] ?? null;
            $documentTitle = is_array($seo) && filled($seo['title'] ?? null)
                ? $seo['title']
                : config('app.name', 'Mahadev Multipurpose Co-operative Society Ltd');
            $documentDescription = is_array($seo) && filled($seo['description'] ?? null)
                ? $seo['description']
                : null;
        ?>
        <?php if (isset($component)) { $__componentOriginal56673881198e3a2924721e242dee6899 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal56673881198e3a2924721e242dee6899 = $attributes; } ?>
<?php $component = Inertia\View\Components\Head::resolve([] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('inertia::head'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Inertia\View\Components\Head::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
            <title><?php echo e($documentTitle); ?></title>
            <?php if($documentDescription): ?>
                <meta name="description" content="<?php echo e($documentDescription); ?>">
                <meta property="og:title" content="<?php echo e($documentTitle); ?>">
                <meta property="og:description" content="<?php echo e($documentDescription); ?>">
            <?php endif; ?>
         <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal56673881198e3a2924721e242dee6899)): ?>
<?php $attributes = $__attributesOriginal56673881198e3a2924721e242dee6899; ?>
<?php unset($__attributesOriginal56673881198e3a2924721e242dee6899); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal56673881198e3a2924721e242dee6899)): ?>
<?php $component = $__componentOriginal56673881198e3a2924721e242dee6899; ?>
<?php unset($__componentOriginal56673881198e3a2924721e242dee6899); ?>
<?php endif; ?>
    </head>
    <body class="font-sans antialiased">
        <?php if(filled(config('services.google.gtm_id'))): ?>
            
            <noscript>
                <iframe
                    src="https://www.googletagmanager.com/ns.html?id=<?php echo e(config('services.google.gtm_id')); ?>"
                    height="0"
                    width="0"
                    style="display:none;visibility:hidden"
                ></iframe>
            </noscript>
            
        <?php endif; ?>
        <?php if(filled(config('services.meta.pixel_id'))): ?>
        <noscript>
            <img
                height="1"
                width="1"
                style="display:none"
                src="https://www.facebook.com/tr?id=<?php echo e(config('services.meta.pixel_id')); ?>&ev=PageView&noscript=1"
                alt=""
            />
        </noscript>
        <?php endif; ?>

        <?php if (isset($component)) { $__componentOriginal1830bdc8f8b965a5838ec47487b5507c = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal1830bdc8f8b965a5838ec47487b5507c = $attributes; } ?>
<?php $component = Inertia\View\Components\App::resolve([] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('inertia::app'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Inertia\View\Components\App::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal1830bdc8f8b965a5838ec47487b5507c)): ?>
<?php $attributes = $__attributesOriginal1830bdc8f8b965a5838ec47487b5507c; ?>
<?php unset($__attributesOriginal1830bdc8f8b965a5838ec47487b5507c); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal1830bdc8f8b965a5838ec47487b5507c)): ?>
<?php $component = $__componentOriginal1830bdc8f8b965a5838ec47487b5507c; ?>
<?php unset($__componentOriginal1830bdc8f8b965a5838ec47487b5507c); ?>
<?php endif; ?>
    </body>
</html>
<?php /**PATH C:\Users\91700\Documents\mahadev\resources\views/app.blade.php ENDPATH**/ ?>