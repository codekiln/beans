#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

mkdir -p "$tmp_dir/bin" "$tmp_dir/worktrees/beans-open" "$tmp_dir/worktrees/beans-cld" "$tmp_dir/worktrees/beans-c29"
cp "$repo_root/dev/beads-prune-closed-worktrees" "$tmp_dir/beads-prune-closed-worktrees"

cat >"$tmp_dir/bin/git" <<EOF
#!/usr/bin/env bash
set -euo pipefail

echo "\$*" >>"$tmp_dir/git.log"

case "\$1" in
  rev-parse)
    if [[ "\${2:-}" == "--show-toplevel" ]]; then
      printf "%s\n" "$tmp_dir"
      exit 0
    fi
    ;;
  worktree)
    case "\${2:-}" in
      list)
        cat <<'LIST'
worktree $tmp_dir
branch refs/heads/main

worktree $tmp_dir/worktrees/beans-open
branch refs/heads/codex/beans-open

worktree $tmp_dir/worktrees/beans-cld
branch refs/heads/codex/beans-cld

worktree $tmp_dir/worktrees/beans-c29
branch refs/heads/codex/beans-c29
LIST
        exit 0
        ;;
      remove)
        exit 0
        ;;
      prune)
        exit 0
        ;;
    esac
    ;;
esac

exit 0
EOF

cat >"$tmp_dir/bin/bd" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

if [[ "$1" == "--no-daemon" ]]; then
  shift
fi

case "${1:-}" in
  list)
    cat <<'LIST'
✓ beans-cld [P2] [task] - Closed issue
✓ beans-c29 [P2] [task] - Another closed issue
LIST
    exit 0
    ;;
esac

exit 0
EOF

chmod +x "$tmp_dir/bin/git" "$tmp_dir/bin/bd" "$tmp_dir/beads-prune-closed-worktrees"

dry_run_output="$(
  cd "$tmp_dir"
  PATH="$tmp_dir/bin:$PATH" ./beads-prune-closed-worktrees --dry-run
)"

if [[ "$dry_run_output" != *"$tmp_dir/worktrees/beans-cld"* ]]; then
  echo "cleanup script did not report a closed worktree during dry run" >&2
  exit 1
fi

if [[ "$dry_run_output" != *"$tmp_dir/worktrees/beans-c29"* ]]; then
  echo "cleanup script did not report the second closed worktree during dry run" >&2
  exit 1
fi

if [[ "$dry_run_output" == *"$tmp_dir/worktrees/beans-open"* ]]; then
  echo "cleanup script should not target open worktrees" >&2
  exit 1
fi

run_output="$(
  cd "$tmp_dir"
  PATH="$tmp_dir/bin:$PATH" ./beads-prune-closed-worktrees
)"

if ! grep -Fq "worktree remove $tmp_dir/worktrees/beans-cld" "$tmp_dir/git.log"; then
  echo "cleanup script did not remove the first closed worktree" >&2
  exit 1
fi

if ! grep -Fq "worktree remove $tmp_dir/worktrees/beans-c29" "$tmp_dir/git.log"; then
  echo "cleanup script did not remove the second closed worktree" >&2
  exit 1
fi

if grep -Fq "worktree remove $tmp_dir/worktrees/beans-open" "$tmp_dir/git.log"; then
  echo "cleanup script removed an open-task worktree" >&2
  exit 1
fi

if ! grep -Fq "worktree prune" "$tmp_dir/git.log"; then
  echo "cleanup script did not prune git worktrees after removal" >&2
  exit 1
fi

if [[ "$run_output" != *"Removed 2 closed-task worktree(s)."* ]]; then
  echo "cleanup script did not report the removal count" >&2
  exit 1
fi

echo "beads-prune-closed-worktrees smoke check passed"
