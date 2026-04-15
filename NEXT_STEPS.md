# NEXT STEPS

1. Add CLI snapshot tests for text and JSON outputs to guard against accidental output-contract drift.
2. Add command-level integration tests that execute the built `prd` binary end-to-end (not just `runCli`) for `pack`, `validate`, and `inspect`.
3. Document the stable CLI output contract in package-level CLI docs so downstream tooling can rely on it explicitly.
