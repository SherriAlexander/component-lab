# Documentation

After fixing a bug, adding a feature, refactoring, or any significant code change, update any related planning document, spec document, and the root level README.

Do this as the final step of every task, before considering it complete.

# Git

Branch off `dev`, and open PRs against `dev` (`gh pr create --base dev`). Never work directly on `dev` or `main`. `dev` merges into `main` only when Sherri wants a Chromatic snapshot run — every push to `main` spends snapshots and deploys Pages; nothing else does. Use a merge commit for `dev` → `main`, not squash.

Sherri makes all commits and pushes. Never `git commit` or `git push` unless explicitly asked. Always create a new commit for post-push changes — do not amend a commit that has already been pushed.

The pre-push test gate is the lefthook `pre-push` hook (typecheck + story tests), which covers every push.
