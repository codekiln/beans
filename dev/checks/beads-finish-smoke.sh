#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

mkdir -p "$tmp_dir/bin"
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
    if [[ "\$2" == "--git-common-dir" ]]; then
      printf ".git\n"
    else
      printf "codex/beans-test\n"
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

case "\${1:-}" in
  show|update)
    exit 0
    ;;
  dolt)
    exit 0
    ;;
  *)
    exit 0
    ;;
esac
EOF

cat >"$tmp_dir/bin/gh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

printf "fake-gh-token\n"
EOF

chmod +x "$tmp_dir/bin/git" "$tmp_dir/bin/bd" "$tmp_dir/bin/gh" "$tmp_dir/beads-finish"

(
  cd "$tmp_dir"
  PATH="$tmp_dir/bin:$PATH" ./beads-finish beans-test "note"
)

if ! grep -Fq -- "show beans-test" "$tmp_dir/bd.log"; then
  echo "beads-finish did not show the issue before finishing it" >&2
  exit 1
fi

if ! grep -Fq -- "update beans-test --notes note --status closed" "$tmp_dir/bd.log"; then
  echo "beads-finish did not close the issue with the provided notes" >&2
  exit 1
fi

if ! grep -Fq -- "dolt push" "$tmp_dir/bd.log"; then
  echo "beads-finish did not push the Beads closeout through Dolt" >&2
  exit 1
fi

if ! grep -Fq -- "show beans-test --json" "$tmp_dir/bd.log"; then
  echo "beads-finish did not verify the closed issue after pushing" >&2
  exit 1
fi

if ! grep -Fq "status --short" "$tmp_dir/git.log"; then
  echo "beads-finish did not print git status after finishing the issue" >&2
  exit 1
fi

echo "beads-finish smoke check passed"
