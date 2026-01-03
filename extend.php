<?php

use Flarum\Extend;
use Flarum\Discussion\Event\Saving as DiscussionSaving;
use Flarum\Post\Event\Saving as PostSaving;
use Peopleinside\AntiFlood\FloodGuard;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/dist/forum.js')
        ->css(__DIR__.'/resources/less/forum.less'),
    
    (new Extend\Event())
        ->listen(DiscussionSaving::class, [FloodGuard::class, 'handleDiscussionSaving'])
        ->listen(PostSaving::class, [FloodGuard::class, 'handlePostSaving']),
];
