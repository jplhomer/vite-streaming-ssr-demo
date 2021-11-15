# Vite: React 18 Streaming SSR

This is a code example which demonstrates building a React 18 (alpha) application with Vite and streaming a SSR response to both Node.js and Workers runtimes.

## Development

```bash
yarn
```

Run the Vite dev server (Node.js runtime):

```bash
yarn dev
```

Run the Miniflare dev server (Workers runtime):

```bash
yarn build && yarn workers
```
