# AGENTS.md

Instructions for AI coding agents working in **bertie-mod-atlas** — the interactive
progression-planning atlas for the [bertie](https://github.com/bertie-mc) modpack. Static
HTML/CSS/JS plus a Python build script; no Minecraft toolchain here.

---

## 1. GitHub is the source of truth

Finish every task committed and pushed:

```bash
git add -A
git commit -m "type(scope): what changed"
git pull --rebase origin main
git push origin main
```

`git status` must be clean when you stop. Always `--rebase`; never `git pull --no-rebase`
to dodge a conflict. If you could not push, say so explicitly rather than finishing
silently with unpushed commits.

---

## 2. Never commit extracted mod icons

The atlas is rendered against item icons **extracted from third-party mod jars** by the
generator script. Those icons are other people's artwork.

- **Do not commit generated icon sets** (`_progression_assets/icons/`, contact sheets,
  render-check images). They are regenerable output, and redistributing them is not ours
  to do.
- Commit the **generator**, not its output.
- The same exclusion exists in the private workspace repo. Do not add an exception here.

If the atlas needs icons to display, generate them locally at build time.

---

## 3. Data comes from the pack, not from memory

`src/data.json` describes mods and provisional stage/integration relationships. When updating it:

- Take ids, versions and mechanics **from the pack and the jar-derived documentation**,
  not from recollection. The workspace repo's `mod-documentation/` is the reference.
- Exact ids, exact counts. `deepwaters:endlesscaves`, not "the key item".
- If you could not verify something, mark it unverified rather than asserting it.

---

## 4. Worktrees

If another agent may be working in this checkout:

```bash
git worktree add ../atlas-<task> -b <task-branch>
# work, commit, push the branch
git worktree remove ../atlas-<task>
git branch -d <task-branch>
git worktree prune
```

### Dangling worktrees are forbidden

**`git worktree list` must show only the main checkout before you finish** — including
when the task failed or was abandoned. A stale worktree locks branches and misleads the
next agent. Do not `--force` away changes you have not read.

---

## 5. Do not sidetrack

- **Do not edit mod sources from here.** The public pack and its owned mods live in the
  [`bertie`](https://github.com/bertie-mc/bertie) monorepo, whose root `AGENTS.md` applies.
- **Do not delete or revert another agent's work** to make your change apply. If you find
  modifications you did not make, report them and stop.
- **Before deleting anything, grep every reference.**

---

## 6. Licensing

This repository is dedicated to the public domain under **The Unlicense**. That covers the
original code and data here only. Any third-party asset — including mod icons — is not
ours to dedicate, which is the other reason §2 exists.

---

## 7. Before you report a task complete

```
[ ] git status is clean; committed and pushed with --rebase
[ ] git worktree list shows only the main checkout
[ ] no extracted mod icons or generated image output staged
[ ] data claims taken from the pack/docs, not memory; gaps marked unverified
```
