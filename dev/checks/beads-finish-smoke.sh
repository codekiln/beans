#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

mkdir -p "$tmp_dir/bin" "$tmp_dir/.git/beads-worktrees/beads-sync/.beads"
touch "$tmp_dir/.git/beads-worktrees/beads-sync/.beads/issues.jsonl"
cp "$repo_root/dev/beads-finish" "$tmp_dir/beads-finish"

cat >"$tmp_dir/bin/git" <<EOF
#!/usr/bin/env bash
set -euo pipefail

echo "\$*" >>"$tmp_dir/git.log"

case "\$1" in
  status)
    exit 0
    ;;
  rev-parse)
    printf "codex/beans-test\n"
    exit 0
    ;;
  -C)
    shift 2
    if [[ "\${1:-}" == "status" ]]; then
      printf "## beads-sync\n"
    fi
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
  show|update)
    exit 0
    ;;
  sync)
    exit 0
    ;;
  export)
    cat >"$tmp_dir/.git/beads-worktrees/beads-sync/.beads/issues.jsonl" <<'JSONL'
{"id":"beans-test","status":"closed"}
JSONL
    exit 0
    ;;
  *)
    exit 0
    ;;
esac
EOF

chmod +x "$tmp_dir/bin/git" "$tmp_dir/bin/bd" "$tmp_dir/beads-finish"

(
  cd "$tmp_dir"
  PATH="$tmp_dir/bin:$PATH" ./beads-finish beans-test "note"
)

if ! grep -Fq -- "--no-daemon show beans-test" "$tmp_dir/bd.log"; then
  echo "beads-finish did not use --no-daemon for bd show" >&2
  exit 1
fi

if ! grep -Fq -- "--no-daemon update beans-test --append-notes note" "$tmp_dir/bd.log"; then
  echo "beads-finish did not use --no-daemon when appending notes" >&2
  exit 1
fi

if ! grep -Fq -- "--no-daemon update beans-test --status closed" "$tmp_dir/bd.log"; then
  echo "beads-finish did not use --no-daemon when closing the issue" >&2
  exit 1
fi

if ! grep -Fq -- "--no-daemon sync --check" "$tmp_dir/bd.log"; then
  echo "beads-finish did not run sync --check in direct mode" >&2
  exit 1
fi

if ! grep -Fq -- "--no-daemon sync --force" "$tmp_dir/bd.log"; then
  echo "beads-finish did not force a direct-mode sync export" >&2
  exit 1
fi

if ! grep -Fq -- "--no-daemon export -o .git/beads-worktrees/beads-sync/.beads/issues.jsonl" "$tmp_dir/bd.log"; then
  echo "beads-finish did not fall back to full JSONL export when sync left metadata missing" >&2
  exit 1
fi

echo "beads-finish smoke check passed"
