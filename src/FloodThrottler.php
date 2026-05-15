<?php

namespace Peopleinside\AntiFlood;

use Carbon\Carbon;
use Flarum\Discussion\Discussion;
use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Flarum\Post\Post;
use Flarum\User\User;
use Illuminate\Contracts\Translation\Translator;
use Psr\Http\Message\ServerRequestInterface;

class FloodThrottler
{
    protected int $maxPending = 6;
    protected int $floodLimit = 3;
    protected int $floodIntervalMinutes = 5;

    public function __construct(
        private Translator $translator
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

    protected function checkPending(User $actor): void
    {
        $pendingPosts = Post::where('user_id', $actor->id)
            ->where('is_approved', false)
            ->count();

        $pendingDiscussions = Discussion::where('user_id', $actor->id)
            ->where('is_approved', false)
            ->count();

        if (($pendingPosts + $pendingDiscussions) >= $this->maxPending) {
            throw new ValidationException([
                'content' => $this->translator->get('peopleinside-antiflood.forum.error.pending_limit'),
            ]);
        }
    }

    protected function checkFlooding(User $actor, string $model): void
    {
        $recentCount = $model::where('user_id', $actor->id)
            ->where('created_at', '>=', Carbon::now()->subMinutes($this->floodIntervalMinutes))
            ->count();

        if ($recentCount >= $this->floodLimit) {
            throw new ValidationException([
                'content' => $this->translator->get('peopleinside-antiflood.forum.error.flood_limit', [
                    'minutes' => $this->floodIntervalMinutes,
                ]),
            ]);
        }
    }
}
