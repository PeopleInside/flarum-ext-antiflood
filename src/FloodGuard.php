<?php

namespace Peopleinside\AntiFlood;

use Carbon\Carbon;
use Flarum\Discussion\Discussion;
use Flarum\Post\Post;
use Flarum\User\User;
use Flarum\Discussion\Event\Saving as DiscussionSaving;
use Flarum\Post\Event\Saving as PostSaving;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\Exception\PermissionDeniedException;
use Illuminate\Contracts\Translation\Translator;

class FloodGuard
{
    private const SETTING_PENDING_LIMIT_MESSAGE = 'peopleinside-antiflood.pending_limit_message';
    private const SETTING_FLOOD_LIMIT_MESSAGE = 'peopleinside-antiflood.flood_limit_message';

    protected int $maxPending = 6;
    protected int $floodLimit = 3;
    protected int $floodIntervalMinutes = 5;

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
        $pendingPosts = Post::where('user_id', $actor->id)
            ->where('is_approved', false)
            ->count();

        $pendingDiscussions = Discussion::where('user_id', $actor->id)
            ->where('is_approved', false)
            ->count();

        if (($pendingPosts + $pendingDiscussions) >= $this->maxPending) {
            throw new PermissionDeniedException(
                $this->resolvePendingLimitMessage()
            );
        }
    }

    protected function checkFlooding(User $actor, string $model): void
    {
        $recentCount = $model::where('user_id', $actor->id)
            ->where('created_at', '>=', Carbon::now()->subMinutes($this->floodIntervalMinutes))
            ->count();

        if ($recentCount >= $this->floodLimit) {
            throw new PermissionDeniedException(
                $this->resolveFloodLimitMessage()
            );
        }
    }

    protected function resolvePendingLimitMessage(): string
    {
        $message = trim((string) $this->settings->get(self::SETTING_PENDING_LIMIT_MESSAGE, ''));

        if ($message !== '') {
            return $message;
        }

        return $this->translator->get('peopleinside-antiflood.forum.error.pending_limit');
    }

    protected function resolveFloodLimitMessage(): string
    {
        $message = trim((string) $this->settings->get(self::SETTING_FLOOD_LIMIT_MESSAGE, ''));

        if ($message !== '') {
            return str_replace('{minutes}', (string) $this->floodIntervalMinutes, $message);
        }

        return $this->translator->get('peopleinside-antiflood.forum.error.flood_limit', [
            'minutes' => $this->floodIntervalMinutes,
        ]);
    }
}
