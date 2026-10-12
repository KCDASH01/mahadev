<?php

namespace App\Providers;

use App\Console\Commands\ServeCommand as AppServeCommand;
use App\Services\SettingsService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Console\ServeCommand;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(SettingsService::class);

        $this->app->extend(ServeCommand::class, fn () => new AppServeCommand);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->shareSettingsWithViews();
    }

    protected function shareSettingsWithViews(): void
    {
        View::composer('*', function ($view): void {
            $settings = app(SettingsService::class)->forFrontend();

            $view->with('generalSettings', $settings['general']);
            $view->with('themeSettings', $settings['theme']);
            $view->with('socialMediaSettings', $settings['social']);
            $view->with('socialLinks', $settings['social_links']);
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );
    }
}
