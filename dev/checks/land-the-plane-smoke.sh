#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
tmp_dir="$(mktemp -d)"
main_worktree="$tmp_dir/main-worktree"
trap 'rm -rf "$tmp_dir"' EXIT

mkdir -p "$tmp_dir/bin" "$tmp_dir/dev" "$main_worktree"
cp "$repo_root/dev/land-the-plane" "$tmp_dir/dev/land-the-plane"

cat >"$tmp_dir/package.json" <<'EOF'
{
  "scripts": {
    "check:beads-start": "echo beads-start",
    "build": "echo build"
  }
}
EOF

cat >"$tmp_dir/dev/beads-finish" <<EOF
#!/usr/bin/env bash
set -euo pipefail

echo "\$*" >>"$tmp_dir/beads-finish.log"
EOF

cat >"$tmp_dir/bin/git" <<EOF
#!/usr/bin/env bash
set -euo pipefail

echo "\$*" >>"$tmp_dir/git.log"

case "\$1" in
  worktree)
    cat <<'WORKTREES'
worktree $main_worktree
branch refs/heads/main

worktree $tmp_dir
branch refs/heads/codex/beans-test
WORKTREES
    exit 0
    ;;
  status)
    if [[ "\${2:-}" == "--short" && "\${3:-}" == "--branch" ]]; then
      printf "## codex/beans-test...origin/codex/beans-test\n"
    fi
    exit 0
    ;;
  ls-files)
    printf "tmp/debug.log\n"
    exit 0
    ;;
  stash)
    printf "stash@{0}: WIP on codex/beans-test\n"
    exit 0
    ;;
  -C)
    worktree_path="\$2"
    shift 2

    case "\${1:-}" in
      status)
        if [[ "\$worktree_path" == "$main_worktree" && "\${2:-}" == "--short" && "\${3:-}" == "--branch" ]]; then
          printf "## main...origin/main\n"
        fi
        exit 0
        ;;
      fetch|pull|merge|push)
        exit 0
        ;;
      *)
        exit 0
        ;;
    esac
    ;;
  rev-parse)
    if [[ "\${2:-}" == "--abbrev-ref" && "\${3:-}" == "HEAD" ]]; then
      printf "codex/beans-test\n"
      exit 0
    fi
    exit 1
    ;;
  *)
    exit 0
    ;;
esac
EOF

cat >"$tmp_dir/bin/npm" <<EOF
#!/usr/bin/env bash
set -euo pipefail

echo "\$*" >>"$tmp_dir/npm.log"

if [[ "\$1" == "run" && "\$2" == "check:beads-start" ]]; then
  echo "beads-start ok"
  exit 0
fi

if [[ "\$1" == "run" && "\$2" == "build" ]]; then
  echo "build ok"
  exit 0
fi

exit 0
EOF

cat >"$tmp_dir/bin/bd" <<EOF
#!/usr/bin/env bash
set -euo pipefail

echo "\$*" >>"$tmp_dir/bd.log"

while [[ "\${1:-}" == --* ]]; do
  if [[ "\$1" == "--no-daemon" ]]; then
    shift
    continue
  fi

  break
done

case "\${1:-}" in
  create)
    printf "✓ Created issue: beans-follow\n"
    exit 0
    ;;
  ready)
    cat <<'READY'

📋 Ready work (1 issue with no blockers):

1. [● P2] [task] beans-next: Add next-session guidance
READY
    exit 0
    ;;
  *)
    exit 0
    ;;
esac
EOF

chmod +x "$tmp_dir/dev/land-the-plane" "$tmp_dir/dev/beads-finish" "$tmp_dir/bin/git" "$tmp_dir/bin/bd" "$tmp_dir/bin/npm"

output="$(
  cd "$tmp_dir"
  PATH="$tmp_dir/bin:$PATH" ./dev/land-the-plane beans-test "note"
)"

if ! grep -Fq "beans-test note" "$tmp_dir/beads-finish.log"; then
  echo "land-the-plane did not delegate to beads-finish with issue and notes" >&2
  exit 1
fi

if [[ "$output" != *"Quality gates:"* ]]; then
  echo "land-the-plane did not report quality gates" >&2
  exit 1
fi

if [[ "$output" != *"No follow-up issues created."* ]]; then
  echo "land-the-plane did not default follow-up handling sensibly" >&2
  exit 1
fi

if ! grep -Fq "run check:beads-start" "$tmp_dir/npm.log"; then
  echo "land-the-plane did not run the default Beads startup smoke check" >&2
  exit 1
fi

if ! grep -Fq "run build" "$tmp_dir/npm.log"; then
  echo "land-the-plane did not run the default build check" >&2
  exit 1
fi

if ! grep -Fq "ls-files --others --exclude-standard" "$tmp_dir/git.log"; then
  echo "land-the-plane did not inspect untracked files" >&2
  exit 1
fi

if ! grep -Fq "stash list" "$tmp_dir/git.log"; then
  echo "land-the-plane did not inspect git stashes" >&2
  exit 1
fi

if ! grep -Fq -- "-C $main_worktree pull --ff-only origin main" "$tmp_dir/git.log"; then
  echo "land-the-plane did not update main from origin/main" >&2
  exit 1
fi

if ! grep -Fq -- "-C $main_worktree merge --no-edit codex/beans-test" "$tmp_dir/git.log"; then
  echo "land-the-plane did not merge the task branch into main" >&2
  exit 1
fi

if ! grep -Fq -- "-C $main_worktree push origin main" "$tmp_dir/git.log"; then
  echo "land-the-plane did not push main" >&2
  exit 1
fi

if ! grep -Fq -- "--no-daemon ready" "$tmp_dir/bd.log"; then
  echo "land-the-plane did not inspect ready Beads work" >&2
  exit 1
fi

if [[ "$output" != *"dev/beads-start beans-next"* ]]; then
  echo "land-the-plane did not emit the next-session prompt" >&2
  exit 1
fi

echo "land-the-plane smoke check passed"
