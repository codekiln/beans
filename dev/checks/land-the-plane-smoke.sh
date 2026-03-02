#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

mkdir -p "$tmp_dir/bin" "$tmp_dir/dev"
cp "$repo_root/dev/land-the-plane" "$tmp_dir/dev/land-the-plane"

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
  pull)
    exit 0
    ;;
  push)
    exit 0
    ;;
  fetch)
    exit 0
    ;;
  rev-parse)
    if [[ "\${2:-}" == "--abbrev-ref" && "\${3:-}" == "HEAD" ]]; then
      printf "codex/beans-test\n"
      exit 0
    fi

    if [[ "\${2:-}" == "--abbrev-ref" && "\${3:-}" == "--symbolic-full-name" ]]; then
      printf "origin/codex/beans-test\n"
      exit 0
    fi

    exit 1
    ;;
  show-ref)
    exit 0
    ;;
  *)
    exit 0
    ;;
esac
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

chmod +x "$tmp_dir/dev/land-the-plane" "$tmp_dir/dev/beads-finish" "$tmp_dir/bin/git" "$tmp_dir/bin/bd"

output="$(
  cd "$tmp_dir"
  PATH="$tmp_dir/bin:$PATH" ./dev/land-the-plane beans-test "note" --check "printf 'ok\\n' >/dev/null" --no-follow-up
)"

if ! grep -Fq "beans-test note" "$tmp_dir/beads-finish.log"; then
  echo "land-the-plane did not delegate to beads-finish with issue and notes" >&2
  exit 1
fi

if [[ "$output" != *"Quality gates:"* ]]; then
  echo "land-the-plane did not report quality gates" >&2
  exit 1
fi

if [[ "$output" != *"No follow-up issues needed."* ]]; then
  echo "land-the-plane did not require follow-up acknowledgement" >&2
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

if ! grep -Fq "pull --rebase" "$tmp_dir/git.log"; then
  echo "land-the-plane did not rebase before push" >&2
  exit 1
fi

if ! grep -Fq "push" "$tmp_dir/git.log"; then
  echo "land-the-plane did not push the branch" >&2
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
