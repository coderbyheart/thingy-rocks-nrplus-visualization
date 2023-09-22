# DECT NR+ Visualizer

[![code style: Deno](https://img.shields.io/badge/code_style-Deno-ff69b4.svg)](https://docs.deno.com/runtime/manual/tools/formatter)

Visualization for DECT NR+ deployments using Nordic Semiconductor long-range chips.

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
