# Contributing

## Prerequisites

- Node 22.11+ (`.nvmrc`)
- Yarn 4 (`corepack enable`)
- Xcode 15+ (iOS), Android Studio / SDK (Android)
- AWS CLI + `jq` for `scripts/ivs` (optional)

## Setup

```bash
git clone https://github.com/WebRTCventures/amazon-ivs-react-native-sdk.git
cd amazon-ivs-react-native-sdk
yarn install
yarn prepare          # bob build → lib/
```

## Development loop

| Task | Command |
| --- | --- |
| Lint | `yarn lint` |
| Typecheck | `yarn typecheck` |
| Unit tests | `yarn test` |
| Example Metro | `yarn example start` |
| Example iOS | `yarn example ios` |
| Example Android | `yarn example android` |

Configure the example:

```bash
cp example/src/stage.config.example.ts example/src/stage.config.ts
# paste participant token
```

iOS example Podfile already includes `AmazonIVSBroadcastStages` from `vendor/`.

## Project layout

See [docs/architecture.md](docs/architecture.md). Changes that touch the bridge follow [docs/adding-a-feature.md](docs/adding-a-feature.md).

## Tests

- **Jest** — core, provider, parity (`src/__tests__/`)
- **XCTest** — `ios/Tests/IvsMappingTests.mm`
- **JUnit** — `android/src/test/java/.../IvsMappingTest.kt`

Run native mapping tests locally before PRs that edit `IvsMapping`.

## Changesets

User-facing changes need a changeset:

```bash
yarn changeset
```

Release maintainers run `yarn release` after merging version PRs.

## Pull requests

- One concern per PR when possible
- Parity test must stay green
- Update docs/example for API changes; `docs/api.md` is generated — run `yarn docs:api` instead of editing it by hand
- Do not commit secrets (`stage.config.ts`, `scripts/ivs.env`)

## Code style

- ESLint + Prettier (repo configs)
- Match existing naming: IVS prefix on public types, AWS terminology (Stage, Participant, publish/subscribe)

## Questions

See [docs/adr/](docs/adr/) for design context. Open a GitHub issue for bugs or feature requests.
