# Vite: React 18 Streaming SSR

This is a code example which demonstrates building a React 18 (alpha) application with Vite and streaming a SSR response to both Node.js and Workers runtimes.

It is meant to be a Vite version of the [official React 18 Streaming SSR example](https://codesandbox.io/s/kind-sammet-j56ro), only modified to support Vite and its way of detecting and bundling assets.

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

## Learn more

- [New Suspense SSR Architecture in React 18](https://github.com/reactwg/react-18/discussions/37)
