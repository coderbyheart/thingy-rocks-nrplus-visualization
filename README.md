# DECT NR+ Visualizer

[![code style: Deno](https://img.shields.io/badge/code_style-Deno-ff69b4.svg)](https://docs.deno.com/runtime/manual/tools/formatter)

Visualization for DECT NR+ deployments using Nordic Semiconductor long-range chips.

Written using [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) and
[Solid](https://www.solidjs.com/).

## Setup

This project uses [Deno](https://docs.deno.com/runtime/manual/#install-deno).

```bash
deno task setup
```

## Running

```bash
deno task dev
```

## Deno related TODOs

- [ ] get commitlint to work: https://github.com/denoland/deno/issues/17175
- [ ] get semantic release to work
- [ ] the `solid-js` types work, but show an error in VSCode, however using `npm:solid-js` makes
      VSCode happy, but this crashes vite
  ```typescript
  // @deno-types="npm:solid-js"
  import { createSignal } from 'solid-js'
  //                           ^ Relative import path "solid-js" not prefixed with / or ./ or ../deno(import-prefix-missing)
  ```
- [ ] manage dependencies using [`deno-udd`](https://github.com/hayd/deno-udd)
- [ ] [Renovate support is missing](https://github.com/renovatebot/renovate/issues/6237)https://github.com/renovatebot/renovate/issues/6237
