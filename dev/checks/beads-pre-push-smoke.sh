#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

run_block_open_issue_failure() {
  local tmp_dir
  local output

  tmp_dir="$(mktemp -d)"
  trap 'rm -rf "$tmp_dir"' RETURN

  mkdir -p "$tmp_dir/bin" "$tmp_dir/.git/beads-worktrees/beads-sync/.beads"
  cp "$repo_root/dev/hooks/pre-push" "$tmp_dir/pre-push"

  cat >"$tmp_dir/.git/beads-worktrees/beads-sync/.beads/issues.jsonl" <<'EOF'
{"id":"beans-test","status":"in_progress"}
EOF

  cat >"$tmp_dir/bin/git" <<EOF
#!/usr/bin/env bash
set -euo pipefail

repo_root="$tmp_dir"
beads_sync_worktree="$tmp_dir/.git/beads-worktrees/beads-sync"

case "\$1" in
  rev-parse)
    if [[ "\${2:-}" == "--path-format=absolute" && "\${3:-}" == "--git-common-dir" ]]; then
      printf "%s\n" "\$repo_root/.git"
      exit 0
    fi
    ;;
  -C)
    worktree_path="\$2"
    shift 2
    if [[ "\$worktree_path" == "\$beads_sync_worktree" && "\${1:-}" == "status" ]]; then
      if [[ "\${2:-}" == "--short" && "\${3:-}" == "--branch" ]]; then
        printf "## beads-sync...origin/beads-sync\n"
        exit 0
      fi
      if [[ "\${2:-}" == "--short" ]]; then
        exit 0
      fi
    fi
    ;;
  for-each-ref)
    printf "codex/beans-test\n"
    exit 0
    ;;
  merge-base)
    if [[ "\${2:-}" == "--is-ancestor" && "\${3:-}" == "codex/beans-test" && "\${4:-}" == "main-local-sha" ]]; then
      exit 0
    fi
    exit 1
    ;;
esac

exit 0
EOF

  cat >"$tmp_dir/bin/bd" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "--no-daemon" ]]; then
  shift
fi

if [[ "${1:-}" == "show" && "${2:-}" == "beans-test" ]]; then
  cat <<'SHOW'
beans-test: Example task
Status: in_progress
SHOW
  exit 0
fi

exit 0
EOF

  chmod +x "$tmp_dir/pre-push" "$tmp_dir/bin/git" "$tmp_dir/bin/bd"

  set +e
  output="$(
    cd "$tmp_dir"
    printf 'refs/heads/main main-local-sha refs/heads/main origin-main-sha\n' | PATH="$tmp_dir/bin:$PATH" ./pre-push origin git@github.com:codekiln/beans.git 2>&1
  )"
  status=$?
  set -e

  if [[ $status -eq 0 ]]; then
    echo "pre-push should block main when a merged task issue is still open" >&2
    exit 1
  fi

  if [[ "$output" != *"Push to main blocked: codex/beans-test is merged into main, but Beads issue beans-test is still in_progress."* ]]; then
    echo "pre-push did not explain the open-issue block" >&2
    exit 1
  fi
}

run_allow_closed_issue_success() {
  local tmp_dir

  tmp_dir="$(mktemp -d)"
  trap 'rm -rf "$tmp_dir"' RETURN

  mkdir -p "$tmp_dir/bin" "$tmp_dir/.git/beads-worktrees/beads-sync/.beads"
  cp "$repo_root/dev/hooks/pre-push" "$tmp_dir/pre-push"

  cat >"$tmp_dir/.git/beads-worktrees/beads-sync/.beads/issues.jsonl" <<'EOF'
{"id":"beans-test","status":"closed"}
EOF

  cat >"$tmp_dir/bin/git" <<EOF
#!/usr/bin/env bash
set -euo pipefail

repo_root="$tmp_dir"
beads_sync_worktree="$tmp_dir/.git/beads-worktrees/beads-sync"

case "\$1" in
  rev-parse)
    if [[ "\${2:-}" == "--path-format=absolute" && "\${3:-}" == "--git-common-dir" ]]; then
      printf "%s\n" "\$repo_root/.git"
      exit 0
    fi
    ;;
  -C)
    worktree_path="\$2"
    shift 2
    if [[ "\$worktree_path" == "\$beads_sync_worktree" && "\${1:-}" == "status" ]]; then
      if [[ "\${2:-}" == "--short" && "\${3:-}" == "--branch" ]]; then
        printf "## beads-sync...origin/beads-sync\n"
        exit 0
      fi
      if [[ "\${2:-}" == "--short" ]]; then
        exit 0
      fi
    fi
    ;;
  for-each-ref)
    printf "codex/beans-test\n"
    exit 0
    ;;
  merge-base)
    if [[ "\${2:-}" == "--is-ancestor" && "\${3:-}" == "codex/beans-test" && "\${4:-}" == "main-local-sha" ]]; then
      exit 0
    fi
    exit 1
    ;;
esac

exit 0
EOF

  cat >"$tmp_dir/bin/bd" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "--no-daemon" ]]; then
  shift
fi

if [[ "${1:-}" == "show" && "${2:-}" == "beans-test" ]]; then
  cat <<'SHOW'
beans-test: Example task
Status: closed
SHOW
  exit 0
fi

exit 0
EOF

  chmod +x "$tmp_dir/pre-push" "$tmp_dir/bin/git" "$tmp_dir/bin/bd"

  (
    cd "$tmp_dir"
    printf 'refs/heads/main main-local-sha refs/heads/main origin-main-sha\n' | PATH="$tmp_dir/bin:$PATH" ./pre-push origin git@github.com:codekiln/beans.git
  )
}

run_block_open_issue_failure
run_allow_closed_issue_success

echo "beads pre-push smoke check passed"
