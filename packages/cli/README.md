# @kelpie/cli

A CLI for inspecting and validating a Kelpie project. It reads `.kelpie/config.json` and never uploads local data.

```sh
kelpie init --device-id device-A
kelpie status
kelpie queue
kelpie inspect --table notes
kelpie doctor
kelpie dev   # Ink dashboard
```

Commands: `init`, `dev`, `status`, `inspect`, `queue`, `conflicts`, `logs`, `doctor`, `migrate`. Rendering sits behind a `CliRenderer` interface, so the plain renderer and the dashboard share one source of truth.

## Run

```sh
pnpm install
pnpm --filter @kelpie/cli dev -- --help
```

## License

Apache-2.0.