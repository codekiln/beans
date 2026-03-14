#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

run_success_scenario() {
  local tmp_dir
  local task_worktree
  local my_main_worktree
  local output

  tmp_dir="$(mktemp -d)"
  task_worktree="$tmp_dir/worktrees/beans-test"
  my_main_worktree="$tmp_dir/worktrees/my/main"
  trap 'rm -rf "$tmp_dir"' RETURN

  mkdir -p "$tmp_dir/bin" "$tmp_dir/dev" "$task_worktree" "$my_main_worktree" "$tmp_dir/.git/beads-worktrees/beads-sync"
  cp "$repo_root/dev/land-the-plane" "$tmp_dir/dev/land-the-plane"
  cp "$repo_root/dev/beads-prune-closed-worktrees" "$tmp_dir/dev/beads-prune-closed-worktrees"

  cat >"$task_worktree/package.json" <<'EOF'
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

repo_root="$tmp_dir"
task_worktree="$task_worktree"
my_main_worktree="$my_main_worktree"
beads_sync_worktree="$tmp_dir/.git/beads-worktrees/beads-sync"
task_dirty_flag="$tmp_dir/task-dirty"
beads_sync_dirty_flag="$tmp_dir/beads-sync-dirty"

case "\$1" in
  rev-parse)
    if [[ "\${2:-}" == "--show-toplevel" ]]; then
      if [[ "\$PWD" == "\$task_worktree" ]]; then
        printf "%s\n" "\$task_worktree"
      else
        printf "%s\n" "\$repo_root"
      fi
      exit 0
    fi

    if [[ "\${2:-}" == "--abbrev-ref" && "\${3:-}" == "HEAD" ]]; then
      printf "codex/beans-test\n"
      exit 0
    fi

    if [[ "\${2:-}" == "--path-format=absolute" && "\${3:-}" == "--git-common-dir" ]]; then
      printf "%s\n" "\$repo_root/.git"
      exit 0
    fi

    if [[ "\${2:-}" == "HEAD" ]]; then
      if [[ -f "\$repo_root/task-commit-created" ]]; then
        printf "task-head-sha\n"
      else
        printf "task-head-before-checkpoint\n"
      fi
      exit 0
    fi

    exit 1
    ;;
  status)
    if [[ "\${2:-}" == "--porcelain" ]]; then
      if [[ -f "\$task_dirty_flag" ]]; then
        printf "?? scratch.txt\n"
      fi
      exit 0
    fi

    if [[ "\${2:-}" == "--short" && "\${3:-}" == "--branch" ]]; then
      printf "## codex/beans-test...origin/codex/beans-test\n"
      exit 0
    fi

    exit 0
    ;;
  add)
    if [[ "\$PWD" == "\$beads_sync_worktree" || "\${GIT_DIR:-}" == "\$beads_sync_worktree/.git" ]]; then
      exit 0
    fi
    exit 0
    ;;
  commit)
    if [[ "\$PWD" == "\$beads_sync_worktree" || "\${GIT_DIR:-}" == "\$beads_sync_worktree/.git" ]]; then
      rm -f "\$beads_sync_dirty_flag"
      exit 0
    fi
    : >"\$repo_root/task-commit-created"
    rm -f "\$task_dirty_flag"
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
  worktree)
    case "\${2:-}" in
      list)
        if [[ "\${3:-}" == "--porcelain" ]]; then
          cat <<LIST
worktree \$repo_root
branch refs/heads/main

worktree \$task_worktree
branch refs/heads/codex/beans-test

worktree \$my_main_worktree
branch refs/heads/main
LIST
          exit 0
        fi
        ;;
      remove)
        rm -rf "\${3:-}"
        exit 0
        ;;
      prune)
        exit 0
        ;;
    esac
    ;;
  -C)
    worktree_path="\$2"
    shift 2

    case "\${1:-}" in
      rev-parse)
        if [[ "\$worktree_path" == "\$repo_root" && "\${2:-}" == "--abbrev-ref" && "\${3:-}" == "HEAD" ]]; then
          printf "main\n"
          exit 0
        fi

        if [[ "\${2:-}" == "HEAD" ]]; then
          case "\$worktree_path" in
            "\$repo_root")
              printf "main-head-sha\n"
              ;;
            "\$beads_sync_worktree")
              printf "beads-sync-sha\n"
              ;;
          esac
          exit 0
        fi
        ;;
      status)
        if [[ "\$worktree_path" == "\$repo_root" ]]; then
          if [[ "\${2:-}" == "--short" && "\${3:-}" == "--" && "\${4:-}" == ".beads/issues.jsonl" ]]; then
            if [[ -f "\$repo_root/root-metadata-dirty" ]]; then
              printf " M .beads/issues.jsonl\n"
            fi
            exit 0
          fi
          if [[ "\${2:-}" == "--short" && "\${3:-}" == "--branch" ]]; then
            printf "## main...origin/main\n"
          fi
          exit 0
        fi

        if [[ "\$worktree_path" == "\$beads_sync_worktree" ]]; then
          if [[ "\${2:-}" == "--short" && -f "\$beads_sync_dirty_flag" ]]; then
            printf " M .beads/issues.jsonl\n"
            exit 0
          fi
          if [[ "\${2:-}" == "--short" && "\${3:-}" == "--branch" ]]; then
            printf "## beads-sync...origin/beads-sync\n"
          fi
          exit 0
        fi

        if [[ "\$worktree_path" == "\$my_main_worktree" ]]; then
          printf " M notes.txt\n"
          exit 0
        fi

        exit 0
        ;;
      add)
        exit 0
        ;;
      restore)
        if [[ "\$worktree_path" == "\$repo_root" ]]; then
          rm -f "\$repo_root/root-metadata-dirty"
        fi
        exit 0
        ;;
      commit)
        if [[ "\$worktree_path" == "\$beads_sync_worktree" ]]; then
          rm -f "\$beads_sync_dirty_flag"
        fi
        exit 0
        ;;
      fetch|pull|merge|push)
        if [[ "\$worktree_path" == "\$beads_sync_worktree" && "\${1:-}" == "push" ]]; then
          rm -f "\$beads_sync_dirty_flag"
        fi
        exit 0
        ;;
      merge-base)
        if [[ "\${2:-}" == "--is-ancestor" && "\${3:-}" == "task-head-sha" && "\${4:-}" == "HEAD" ]]; then
          exit 0
        fi
        exit 1
        ;;
      *)
        exit 0
        ;;
    esac
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
  list)
    if [[ "\${2:-}" == "--status" && "\${3:-}" == "closed" ]]; then
      cat <<'CLOSED'
beans-test [closed]
CLOSED
      exit 0
    fi
    ;;
  ready)
    cat <<'READY'

📋 Ready work (2 issues with no blockers):

1. [● P1] [epic] beans-nep: Bigger theme
2. [● P2] [task] beans-ntk: Smaller next step
READY
    exit 0
    ;;
  show)
    case "\${2:-}" in
      beans-nep)
        cat <<'SHOW'
○ beans-nep · Bigger theme   [● P1 · OPEN]
Owner: CHANGE_ME · Type: epic
SHOW
        ;;
      beans-ntk)
        cat <<'SHOW'
○ beans-ntk · Smaller next step   [● P2 · OPEN]
Owner: CHANGE_ME · Type: task
SHOW
        ;;
    esac
    exit 0
    ;;
  *)
    exit 0
    ;;
esac
EOF

  chmod +x "$tmp_dir/dev/land-the-plane" "$tmp_dir/dev/beads-prune-closed-worktrees" "$tmp_dir/dev/beads-finish" "$tmp_dir/bin/git" "$tmp_dir/bin/bd" "$tmp_dir/bin/npm"
  : >"$tmp_dir/task-dirty"
  : >"$tmp_dir/beads-sync-dirty"
  : >"$tmp_dir/root-metadata-dirty"

  output="$(
    cd "$task_worktree"
    PATH="$tmp_dir/bin:$PATH" ../..//dev/land-the-plane beans-test "note"
  )"

  if ! grep -Fq "beans-test note" "$tmp_dir/beads-finish.log"; then
    echo "land-the-plane did not delegate to beads-finish with issue and notes" >&2
    exit 1
  fi

  if ! grep -Fq "commit -m chore(land-the-plane): checkpoint beans-test" "$tmp_dir/git.log"; then
    echo "land-the-plane did not auto-commit tracked task worktree changes" >&2
    exit 1
  fi

  if [[ "$output" != *"Task worktree checkpoint:"* ]]; then
    echo "land-the-plane did not report the auto-commit checkpoint" >&2
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

  if ! grep -Fq -- "-C $tmp_dir pull --ff-only origin main" "$tmp_dir/git.log"; then
    echo "land-the-plane did not update root main from origin/main" >&2
    exit 1
  fi

  if ! grep -Fq -- "-C $tmp_dir merge --no-edit codex/beans-test" "$tmp_dir/git.log"; then
    echo "land-the-plane did not merge the task branch into root main" >&2
    exit 1
  fi

  if ! grep -Fq -- "-C $tmp_dir push origin main" "$tmp_dir/git.log"; then
    echo "land-the-plane did not push root main" >&2
    exit 1
  fi

  if ! grep -Fq -- "-C $tmp_dir/.git/beads-worktrees/beads-sync status --short --branch" "$tmp_dir/git.log"; then
    echo "land-the-plane did not verify beads-sync final state" >&2
    exit 1
  fi

  if ! grep -Fq -- "-C $tmp_dir restore --staged --worktree -- .beads/issues.jsonl" "$tmp_dir/git.log"; then
    echo "land-the-plane did not clean the root main metadata mirror after beads-finish" >&2
    exit 1
  fi

  if ! grep -Fq -- "-C $tmp_dir/.git/beads-worktrees/beads-sync commit -m chore(beads): sync beans-test metadata" "$tmp_dir/git.log"; then
    echo "land-the-plane did not commit beads-sync metadata during closeout" >&2
    exit 1
  fi

  if ! grep -Fq -- "-C $tmp_dir/.git/beads-worktrees/beads-sync push origin beads-sync" "$tmp_dir/git.log"; then
    echo "land-the-plane did not push beads-sync during closeout" >&2
    exit 1
  fi

  beads_sync_push_line="$(grep -n -F -- "-C $tmp_dir/.git/beads-worktrees/beads-sync push origin beads-sync" "$tmp_dir/git.log" | head -n 1 | cut -d: -f1)"
  main_push_line="$(grep -n -F -- "-C $tmp_dir push origin main" "$tmp_dir/git.log" | head -n 1 | cut -d: -f1)"

  if [[ -z "$beads_sync_push_line" || -z "$main_push_line" || "$beads_sync_push_line" -ge "$main_push_line" ]]; then
    echo "land-the-plane should push beads-sync before pushing main" >&2
    exit 1
  fi

  if ! grep -Fq "worktree remove $task_worktree" "$tmp_dir/git.log"; then
    echo "land-the-plane did not prune the just-closed task worktree" >&2
    exit 1
  fi

  if ! grep -Fq -- "-C $tmp_dir merge-base --is-ancestor task-head-sha HEAD" "$tmp_dir/git.log"; then
    echo "land-the-plane did not assert that task HEAD landed on main" >&2
    exit 1
  fi

  if [[ -d "$task_worktree" ]]; then
    echo "land-the-plane left the closed task worktree on disk" >&2
    exit 1
  fi

  if grep -Fq -- "-C $my_main_worktree status --short" "$tmp_dir/git.log"; then
    echo "land-the-plane should ignore unrelated worktrees/my/main dirt" >&2
    exit 1
  fi

  if [[ "$output" != *"Pruning closed task worktrees:"* ]]; then
    echo "land-the-plane did not report the prune step" >&2
    exit 1
  fi

  if [[ "$output" != *"Heuristic: prefer ready task/bug work, then lower P-number, then existing ready order."* ]]; then
    echo "land-the-plane did not document the next-task heuristic" >&2
    exit 1
  fi

  if [[ "$output" != *"dev/beads-start beans-ntk"* ]]; then
    echo "land-the-plane did not prefer the best next ready task" >&2
    exit 1
  fi
}

run_dirty_root_failure() {
  local tmp_dir
  local task_worktree
  local output

  tmp_dir="$(mktemp -d)"
  task_worktree="$tmp_dir/worktrees/beans-test"
  trap 'rm -rf "$tmp_dir"' RETURN

  mkdir -p "$tmp_dir/bin" "$tmp_dir/dev" "$task_worktree" "$tmp_dir/.git/beads-worktrees/beads-sync"
  cp "$repo_root/dev/land-the-plane" "$tmp_dir/dev/land-the-plane"

  cat >"$tmp_dir/dev/beads-finish" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
exit 0
EOF

  cat >"$tmp_dir/bin/git" <<EOF
#!/usr/bin/env bash
set -euo pipefail

repo_root="$tmp_dir"

case "\$1" in
  rev-parse)
    case "\${2:-}" in
      --show-toplevel)
        printf "%s\n" "$task_worktree"
        exit 0
        ;;
      --abbrev-ref)
        printf "codex/beans-test\n"
        exit 0
        ;;
      --path-format=absolute)
        printf "%s\n" "\$repo_root/.git"
        exit 0
        ;;
      HEAD)
        printf "task-head-sha\n"
        exit 0
        ;;
    esac
    ;;
  status)
    if [[ "\${2:-}" == "--porcelain" || "\${2:-}" == "--short" ]]; then
      exit 0
    fi
    ;;
  -C)
    worktree_path="\$2"
    shift 2
    if [[ "\$worktree_path" == "\$repo_root" && "\${1:-}" == "rev-parse" ]]; then
      printf "main\n"
      exit 0
    fi
    if [[ "\$worktree_path" == "\$repo_root" && "\${1:-}" == "status" ]]; then
      printf " M README.md\n"
      exit 0
    fi
    exit 0
    ;;
  *)
    exit 0
    ;;
esac
EOF

cat >"$tmp_dir/bin/bd" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "--no-daemon" ]]; then
  shift
fi

if [[ "${1:-}" == "list" && "${2:-}" == "--status" && "${3:-}" == "closed" ]]; then
  printf "beans-test [closed]\n"
  exit 0
fi

exit 0
EOF

  chmod +x "$tmp_dir/dev/land-the-plane" "$tmp_dir/dev/beads-finish" "$tmp_dir/bin/git" "$tmp_dir/bin/bd"

  set +e
  output="$(
    cd "$task_worktree"
    PATH="$tmp_dir/bin:$PATH" ../..//dev/land-the-plane beans-test 2>&1
  )"
  status=$?
  set -e

  if [[ $status -eq 0 ]]; then
    echo "land-the-plane should fail when root main is dirty" >&2
    exit 1
  fi

  if [[ "$output" != *"Root main worktree is not clean"* ]]; then
    echo "land-the-plane did not explain the dirty root main failure" >&2
    exit 1
  fi
}

run_checkpoint_still_dirty_failure() {
  local tmp_dir
  local task_worktree
  local output

  tmp_dir="$(mktemp -d)"
  task_worktree="$tmp_dir/worktrees/beans-test"
  trap 'rm -rf "$tmp_dir"' RETURN

  mkdir -p "$tmp_dir/bin" "$tmp_dir/dev" "$task_worktree" "$tmp_dir/.git/beads-worktrees/beads-sync"
  cp "$repo_root/dev/land-the-plane" "$tmp_dir/dev/land-the-plane"

  cat >"$tmp_dir/dev/beads-finish" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
echo "beads-finish should not run when checkpoint leaves the task worktree dirty" >&2
exit 99
EOF

  cat >"$tmp_dir/bin/git" <<EOF
#!/usr/bin/env bash
set -euo pipefail

repo_root="$tmp_dir"
task_worktree="$task_worktree"

case "\$1" in
  rev-parse)
    case "\${2:-}" in
      --show-toplevel)
        printf "%s\n" "\$task_worktree"
        exit 0
        ;;
      --abbrev-ref)
        printf "codex/beans-test\n"
        exit 0
        ;;
      --path-format=absolute)
        printf "%s\n" "\$repo_root/.git"
        exit 0
        ;;
      HEAD)
        if [[ -f "\$repo_root/task-commit-created" ]]; then
          printf "task-head-after\n"
        else
          printf "task-head-before\n"
        fi
        exit 0
        ;;
    esac
    ;;
  status)
    if [[ "\${2:-}" == "--porcelain" ]]; then
      printf " M docs/dev/beads.md\n"
      exit 0
    fi
    if [[ "\${2:-}" == "--short" && "\${3:-}" == "--branch" ]]; then
      printf "## codex/beans-test...origin/codex/beans-test\n"
      exit 0
    fi
    exit 0
    ;;
  add)
    exit 0
    ;;
  commit)
    : >"\$repo_root/task-commit-created"
    exit 0
    ;;
  -C)
    worktree_path="\$2"
    shift 2
    if [[ "\$worktree_path" == "\$repo_root" && "\${1:-}" == "rev-parse" ]]; then
      printf "main\n"
      exit 0
    fi
    exit 0
    ;;
  *)
    exit 0
    ;;
esac
EOF

  cat >"$tmp_dir/bin/bd" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
exit 0
EOF

  chmod +x "$tmp_dir/dev/land-the-plane" "$tmp_dir/dev/beads-finish" "$tmp_dir/bin/git" "$tmp_dir/bin/bd"

  set +e
  output="$(
    cd "$task_worktree"
    PATH="$tmp_dir/bin:$PATH" ../..//dev/land-the-plane beans-test 2>&1
  )"
  status=$?
  set -e

  if [[ $status -eq 0 ]]; then
    echo "land-the-plane should fail when the checkpoint commit leaves the task worktree dirty" >&2
    exit 1
  fi

  if [[ "$output" != *"Task worktree is still dirty after checkpoint commit."* ]]; then
    echo "land-the-plane did not explain the dirty-after-checkpoint failure" >&2
    exit 1
  fi
}

run_root_merge_conflict_failure() {
  local tmp_dir
  local task_worktree
  local output

  tmp_dir="$(mktemp -d)"
  task_worktree="$tmp_dir/worktrees/beans-test"
  trap 'rm -rf "$tmp_dir"' RETURN

  mkdir -p "$tmp_dir/bin" "$tmp_dir/dev" "$task_worktree" "$tmp_dir/.git/beads-worktrees/beads-sync"
  cp "$repo_root/dev/land-the-plane" "$tmp_dir/dev/land-the-plane"

  cat >"$tmp_dir/dev/beads-finish" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
exit 0
EOF

  cat >"$tmp_dir/bin/git" <<EOF
#!/usr/bin/env bash
set -euo pipefail

repo_root="$tmp_dir"
task_worktree="$task_worktree"

case "\$1" in
  rev-parse)
    case "\${2:-}" in
      --show-toplevel)
        printf "%s\n" "\$task_worktree"
        exit 0
        ;;
      --abbrev-ref)
        printf "codex/beans-test\n"
        exit 0
        ;;
      --path-format=absolute)
        printf "%s\n" "\$repo_root/.git"
        exit 0
        ;;
      HEAD)
        printf "task-head-sha\n"
        exit 0
        ;;
    esac
    ;;
  status)
    if [[ "\${2:-}" == "--porcelain" ]]; then
      exit 0
    fi
    if [[ "\${2:-}" == "--short" && "\${3:-}" == "--branch" ]]; then
      printf "## codex/beans-test...origin/codex/beans-test\n"
      exit 0
    fi
    exit 0
    ;;
  add|commit)
    exit 0
    ;;
  -C)
    worktree_path="\$2"
    shift 2
    if [[ "\$worktree_path" == "\$repo_root" && "\${1:-}" == "rev-parse" ]]; then
      if [[ "\${2:-}" == "--abbrev-ref" && "\${3:-}" == "HEAD" ]]; then
        printf "main\n"
      elif [[ "\${2:-}" == "HEAD" ]]; then
        printf "main-head-sha\n"
      fi
      exit 0
    fi
    if [[ "\$worktree_path" == "\$repo_root" && "\${1:-}" == "status" ]]; then
      exit 0
    fi
    if [[ "\$worktree_path" == "\$repo_root" && "\${1:-}" == "fetch" ]]; then
      exit 0
    fi
    if [[ "\$worktree_path" == "\$repo_root" && "\${1:-}" == "pull" ]]; then
      exit 0
    fi
    if [[ "\$worktree_path" == "\$repo_root" && "\${1:-}" == "merge" ]]; then
      exit 1
    fi
    if [[ "\$worktree_path" == "\$repo_root" && "\${1:-}" == "diff" ]]; then
      printf "docs/dev/beads.md\n"
      exit 0
    fi
    exit 0
    ;;
  *)
    exit 0
    ;;
esac
EOF

  cat >"$tmp_dir/bin/bd" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
exit 0
EOF

  chmod +x "$tmp_dir/dev/land-the-plane" "$tmp_dir/dev/beads-finish" "$tmp_dir/bin/git" "$tmp_dir/bin/bd"

  set +e
  output="$(
    cd "$task_worktree"
    PATH="$tmp_dir/bin:$PATH" ../..//dev/land-the-plane beans-test 2>&1
  )"
  status=$?
  set -e

  if [[ $status -eq 0 ]]; then
    echo "land-the-plane should fail when the root-main merge conflicts" >&2
    exit 1
  fi

  if [[ "$output" != *"Root main merge conflict while landing codex/beans-test into main."* ]]; then
    echo "land-the-plane did not explain the root-main merge conflict" >&2
    exit 1
  fi

  if [[ "$output" != *"docs/dev/beads.md"* ]]; then
    echo "land-the-plane did not list the conflicting root-main file" >&2
    exit 1
  fi
}

run_success_scenario
run_dirty_root_failure
run_checkpoint_still_dirty_failure
run_root_merge_conflict_failure

echo "land-the-plane smoke check passed"
