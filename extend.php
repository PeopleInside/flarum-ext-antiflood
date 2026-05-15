<?php

use Flarum\Extend;
use Peopleinside\AntiFlood\FloodThrottler;

return [
    new Extend\Locales(__DIR__ . '/locale'),

    (new Extend\ThrottleApi())
        ->set('peopleinside-antiflood', FloodThrottler::class),

    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js'),

    (new Extend\Settings())
        ->serializeToAdmin('peopleinside-antiflood.max_pending', 'peopleinside-antiflood.max_pending')
        ->serializeToAdmin('peopleinside-antiflood.flood_limit', 'peopleinside-antiflood.flood_limit')
        ->serializeToAdmin('peopleinside-antiflood.flood_interval_minutes', 'peopleinside-antiflood.flood_interval_minutes')
        ->serializeToAdmin('peopleinside-antiflood.pending_limit_message', 'peopleinside-antiflood.pending_limit_message')
        ->serializeToAdmin('peopleinside-antiflood.flood_limit_message', 'peopleinside-antiflood.flood_limit_message'),
];
