# CLAUDE.md

**Read [AGENTS.md](AGENTS.md) before doing any work here.**

This is the interactive progression atlas for the bertie modpack — static HTML/CSS/JS plus
a Python build script. No Minecraft toolchain.

## Non-negotiables

1. **GitHub is the source of truth.** Commit, `git pull --rebase`, push; leave `git status` clean.
2. **Never commit extracted mod icons.** The generator renders item icons out of third-party
   mod jars. Commit the generator, not its output — those icons are not ours to redistribute.
3. **Data from the pack and the jar-derived docs, not memory.** Exact ids, exact counts;
   mark anything unverified as unverified.
4. **Worktrees must not dangle.** `git worktree list` must show only the main checkout
   before you finish.
5. **If you find edits you did not make**, another chat is mid-task: report them, do not revert.

Full detail: **[AGENTS.md](AGENTS.md)**.
