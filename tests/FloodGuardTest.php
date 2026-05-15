<?php

use Peopleinside\AntiFlood\FloodThrottler;
use Illuminate\Contracts\Translation\Translator;

test('FloodThrottler can be instantiated', function () {
    $translator = Mockery::mock(Translator::class);
    $throttler = new FloodThrottler($translator);
    expect($throttler)->toBeInstanceOf(FloodThrottler::class);
});

test('FloodThrottler returns null for guest actors', function () {
    $translator = Mockery::mock(Translator::class);
    $throttler = new FloodThrottler($translator);

    $actor = Mockery::mock(\Flarum\User\User::class);
    $actor->shouldReceive('isGuest')->andReturn(true);
    $actor->shouldNotReceive('isAdmin');

    $request = Mockery::mock(\Psr\Http\Message\ServerRequestInterface::class);
    $request->shouldReceive('getAttribute')
        ->with('actor')
        ->andReturn($actor);

    expect($throttler($request))->toBeNull();
});

test('FloodThrottler returns null for admin actors', function () {
    $translator = Mockery::mock(Translator::class);
    $throttler = new FloodThrottler($translator);

    $actor = Mockery::mock(\Flarum\User\User::class);
    $actor->shouldReceive('isGuest')->andReturn(false);
    $actor->shouldReceive('isAdmin')->andReturn(true);

    $request = Mockery::mock(\Psr\Http\Message\ServerRequestInterface::class);
    $request->shouldReceive('getAttribute')
        ->with('actor')
        ->andReturn($actor);

    expect($throttler($request))->toBeNull();
});

