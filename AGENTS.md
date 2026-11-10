# Pancake City development rules

- Preserve `original/Pancake (52).html` byte for byte. Its SHA-256 is `c8eff97d4c0daefd2cf7b6d967a694ce8a999e4a3e1402d88fee4fea6077778c`.
- Read README.md and docs/RECOVERY_NOTES.md before changing the game. This is a recovery from a compiled browser artifact, not the original modular source.
- Do not simplify or replace gameplay systems. Do not add features outside the user's requested milestone.
- Explain user actions in simple language. Ask before destructive changes and before every GitHub push. Never force-push or rewrite shared history without explicit approval.
- For each completed milestone: inspect the diff, run appropriate checks and `npm run build`, perform relevant browser checks when permitted, update the recovery/development notes, then make a local commit with a clear message.
- Present the commit, branch, tests, and limitations for review. Ask for approval to push that specific milestone. After approval, fetch and check for remote changes, push without force, and confirm the remote commit matches.
- A local commit is not an off-computer backup. If a push is pending, say so explicitly.
- Keep dependencies, build output, logs, and city save files out of commits. Preserve third-party license notices.
- `npm run check` currently requires the recovered JS/CSS to equal v52 exactly. When an authorized gameplay change is made, keep the original hash check, revise the asset equality checks deliberately, and document the expected differences with regression coverage.
