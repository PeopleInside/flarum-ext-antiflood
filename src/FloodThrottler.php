<?php

namespace Peopleinside\AntiFlood;

use Carbon\Carbon;
use Flarum\Discussion\Discussion;
use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Flarum\Post\Post;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\User;
use Illuminate\Contracts\Translation\Translator;
use Psr\Http\Message\ServerRequestInterface;

class FloodThrottler
{
    public function __construct(
        private Translator $translator,
        private SettingsRepositoryInterface $settings
    ) {}

    public function __invoke(ServerRequestInterface $request): ?bool
    {
        $actor = RequestUtil::getActor($request);

        if ($actor->isGuest() || $actor->isAdmin()) {
            return null;
        }

        $routeName = $request->getAttribute('routeName');

        if ($routeName === 'discussions.create') {
            $this->checkPending($actor);
            $this->checkFlooding($actor, Discussion::class);
        } elseif ($routeName === 'posts.create') {
            $this->checkPending($actor);
        }

        return null;
    }

    protected function maxPending(): int
    {
        return (int) ($this->settings->get('peopleinside-antiflood.max_pending') ?: 6);
    }

    protected function floodLimit(): int
    {
        return (int) ($this->settings->get('peopleinside-antiflood.flood_limit') ?: 3);
    }

    protected function floodIntervalMinutes(): int
    {
        return (int) ($this->settings->get('peopleinside-antiflood.flood_interval_minutes') ?: 5);
    }

    protected function checkPending(User $actor): void
    {
        $pendingPosts = Post::where('user_id', $actor->id)
            ->where('is_approved', false)
            ->count();

        $pendingDiscussions = Discussion::where('user_id', $actor->id)
            ->where('is_approved', false)
            ->count();

        if (($pendingPosts + $pendingDiscussions) >= $this->maxPending()) {
            $custom = $this->settings->get('peopleinside-antiflood.pending_limit_message');
            $message = $custom ?: $this->translator->get('peopleinside-antiflood.forum.error.pending_limit');

            throw new ValidationException(['content' => $message]);
        }
    }

    protected function checkFlooding(User $actor, string $model): void
    {
        $minutes = $this->floodIntervalMinutes();

        $recentCount = $model::where('user_id', $actor->id)
            ->where('created_at', '>=', Carbon::now()->subMinutes($minutes))
            ->count();

        if ($recentCount >= $this->floodLimit()) {
            $custom = $this->settings->get('peopleinside-antiflood.flood_limit_message');
            $message = $custom ?: $this->translator->get('peopleinside-antiflood.forum.error.flood_limit', [
                'minutes' => $minutes,
            ]);

            throw new ValidationException(['content' => $message]);
        }
    }
}
