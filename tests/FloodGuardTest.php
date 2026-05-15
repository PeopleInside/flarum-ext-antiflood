<?php

use Peopleinside\AntiFlood\FloodGuard;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Translation\Translator;

test('FloodGuard can be instantiated', function () {
    $translator = Mockery::mock(Translator::class);
    $settings = Mockery::mock(SettingsRepositoryInterface::class);
    $guard = new FloodGuard($translator, $settings);
    expect($guard)->toBeInstanceOf(FloodGuard::class);
});
