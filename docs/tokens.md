# Participant tokens

Amazon IVS Real-Time uses **Stages** and **participant tokens**. One token grants one seat on a stage for a limited time.

## AWS setup

1. Create an IVS Real-Time stage in the [AWS console](https://console.aws.amazon.com/ivs/) or via CLI.
2. Mint a participant token with capabilities your user needs:
   - **Viewer**: `SUBSCRIBE` only
   - **Publisher**: `PUBLISH,SUBSCRIBE`

Tokens expire (default up to 20160 minutes). When a token expires mid-session, the SDK emits `token-expired`; call `renewToken(newToken)` to continue.

## CLI helper

This repo ships `scripts/ivs` — a thin wrapper around `aws ivs-realtime`.

```bash
cp scripts/ivs.env.example scripts/ivs.env
# edit IVS_STAGE_ARN, AWS_PROFILE, AWS_REGION

./scripts/ivs list-stages
./scripts/ivs create-stage my-demo-stage
./scripts/ivs token --user-id alice --username "Alice"
./scripts/ivs token --copy   # copies token to clipboard (macOS/Linux)
```

Config file keys (see `scripts/ivs.env.example`):

| Variable | Purpose |
| --- | --- |
| `IVS_STAGE_ARN` | Default stage for `token` |
| `IVS_TOKEN_USER_ID` | Stable user id on the token |
| `IVS_TOKEN_USERNAME` | Attached as `username` attribute |
| `IVS_TOKEN_CAPABILITIES` | e.g. `PUBLISH,SUBSCRIBE` |
| `IVS_TOKEN_ATTRIBUTES` | Extra `key=value` pairs (comma-separated) |

## Screen-share attribute convention

Screen share (post-v1 feature) joins as a **separate participant** with its own token. AWS composition layouts key off a standard attribute:

```bash
./scripts/ivs token --user-id screen --attr screen-share=true
```

Server-side featured layout example:

```json
{"grid":{"featuredParticipantAttribute":"screen-share"}}
```

Apps identify a screen-share tile with:

```ts
participant.attributes['screen-share'] === 'true'
```

Mint tokens with this attribute today so the convention is visible before screen capture lands in the SDK.

## Example app config

Copy `example/src/stage.config.example.ts` to `example/src/stage.config.ts` (gitignored) and paste a token:

```ts
export const STAGE_PARTICIPANT_TOKEN = 'eyJ...';
export const AUTO_JOIN_ON_LAUNCH = false;
```

## Security

- Never commit tokens or `scripts/ivs.env`.
- Mint tokens on your backend in production; the CLI is for development and release QA.
