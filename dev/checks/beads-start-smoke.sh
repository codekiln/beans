#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

mkdir -p "$tmp_dir/bin" "$tmp_dir/worktrees"
cp "$repo_root/dev/beads-start" "$tmp_dir/beads-start"

cat >"$tmp_dir/bin/git" <<EOF
#!/usr/bin/env bash
set -euo pipefail

case "\$1" in
  status)
    exit 0
    ;;
  show-ref)
    exit 1
    ;;
  branch)
    echo "\$*" >>"$tmp_dir/git.log"
    exit 0
    ;;
  *)
    echo "\$*" >>"$tmp_dir/git.log"
    exit 0
    ;;
esac
EOF

cat >"$tmp_dir/bin/bd" <<EOF
#!/usr/bin/env bash
set -euo pipefail

echo "\$*" >>"$tmp_dir/bd.log"

case "\$1" in
  prime|show|update|hooks)
    exit 0
    ;;
  worktree)
    mkdir -p "$tmp_dir/worktrees/beans-test"
    printf "../../.beads\n" >"$tmp_dir/worktrees/beans-test/.beads-redirect-created-by-test"
    exit 0
    ;;
  *)
    exit 0
    ;;
esac
EOF

chmod +x "$tmp_dir/bin/git" "$tmp_dir/bin/bd" "$tmp_dir/beads-start"

cat >"$tmp_dir/.gitignore" <<'EOF'
# bd worktrees
worktrees/beans-*/
# bd worktree
worktrees/beans-test/
EOF

(
  cd "$tmp_dir"
  PATH="$tmp_dir/bin:$PATH" ./beads-start beans-test
)

if grep -Fqx "worktrees/beans-test/" "$tmp_dir/.gitignore"; then
  echo "beads-start left a per-worktree .gitignore entry behind" >&2
  exit 1
fi

if grep -Fqx "# bd worktree" "$tmp_dir/.gitignore"; then
  echo "beads-start left a stray Beads .gitignore comment behind" >&2
  exit 1
fi

if ! grep -Fqx "# bd worktrees" "$tmp_dir/.gitignore"; then
  echo "beads-start removed the repo's canonical worktree .gitignore comment" >&2
  exit 1
fi

if ! grep -Fq "branch codex/beans-test HEAD" "$tmp_dir/git.log"; then
  echo "beads-start did not create the expected branch when absent" >&2
  exit 1
fi

if ! grep -Fq -- "--no-daemon prime" "$tmp_dir/bd.log"; then
  echo "beads-start did not use --no-daemon for bd prime" >&2
  exit 1
fi

if ! grep -Fq -- "--no-daemon show beans-test" "$tmp_dir/bd.log"; then
  echo "beads-start did not use --no-daemon for bd show" >&2
  exit 1
fi

if ! grep -Fq "hooks install --force" "$tmp_dir/bd.log"; then
  echo "beads-start did not refresh bd hooks before starting work" >&2
  exit 1
fi

if ! grep -Fq -- "--no-daemon update beans-test --claim" "$tmp_dir/bd.log"; then
  echo "beads-start did not use --no-daemon when claiming the issue" >&2
  exit 1
fi

if ! grep -Fq "worktree create worktrees/beans-test --branch codex/beans-test" "$tmp_dir/bd.log"; then
  echo "beads-start did not create the expected Beads worktree path" >&2
  exit 1
fi

if [[ "$(cat "$tmp_dir/worktrees/beans-test/.beads/redirect")" != "../../.beads" ]]; then
  echo "beads-start did not repair the Beads redirect for repo-local worktrees" >&2
  exit 1
fi

echo "beads-start smoke check passed"
