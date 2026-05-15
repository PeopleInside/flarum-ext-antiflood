<?php

namespace Peopleinside\AntiFlood;

use Carbon\Carbon;
use Flarum\Discussion\Discussion;
use Flarum\Post\Post;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\User;
use Flarum\Discussion\Event\Saving as DiscussionSaving;
use Flarum\Post\Event\Saving as PostSaving;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Contracts\Translation\Translator;

class FloodGuard
{
    protected const DEFAULT_MAX_PENDING = 6;
    protected const DEFAULT_FLOOD_LIMIT = 3;
    protected const DEFAULT_FLOOD_INTERVAL_MINUTES = 5;

    public function __construct(
        private Translator $translator,
        private SettingsRepositoryInterface $settings
    ) {}

    public function handleDiscussionSaving(DiscussionSaving $event): void
    {
        $actor = $event->actor;

        if ($actor->isGuest() || $actor->isAdmin()) {
            return;
        }

        $this->checkPending($actor);
        $this->checkFlooding($actor, Discussion::class);
    }

    public function handlePostSaving(PostSaving $event): void
    {
        $actor = $event->actor;

        if ($actor->isGuest() || $actor->isAdmin()) {
            return;
        }

        $this->checkPending($actor);
    }

    protected function checkPending(User $actor): void
    {
        $maxPending = $this->getSettingInt('peopleinside-antiflood.max_pending', self::DEFAULT_MAX_PENDING);

        $pendingPosts = Post::where('user_id', $actor->id)
            ->where('is_approved', false)
            ->count();

        $pendingDiscussions = Discussion::where('user_id', $actor->id)
            ->where('is_approved', false)
            ->count();

        if (($pendingPosts + $pendingDiscussions) >= $maxPending) {
            throw new PermissionDeniedException(
                $this->translator->get('peopleinside-antiflood.forum.error.pending_limit')
            );
        }
    }

    protected function checkFlooding(User $actor, string $model): void
    {
        $floodLimit = $this->getSettingInt('peopleinside-antiflood.flood_limit', self::DEFAULT_FLOOD_LIMIT);
        $floodIntervalMinutes = $this->getSettingInt('peopleinside-antiflood.flood_interval_minutes', self::DEFAULT_FLOOD_INTERVAL_MINUTES);

        $recentCount = $model::where('user_id', $actor->id)
            ->where('created_at', '>=', Carbon::now()->subMinutes($floodIntervalMinutes))
            ->count();

        if ($recentCount >= $floodLimit) {
            throw new PermissionDeniedException(
                $this->translator->get('peopleinside-antiflood.forum.error.flood_limit', [
                    'minutes' => $floodIntervalMinutes,
                ])
            );
        }
    }

    protected function getSettingInt(string $key, int $default): int
    {
        $value = $this->settings->get($key);

        if (!is_numeric($value)) {
            return $default;
        }

        $parsed = (int) $value;

        return $parsed > 0 ? $parsed : $default;
    }
}
