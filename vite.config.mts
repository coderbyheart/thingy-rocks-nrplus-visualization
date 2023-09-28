import chalk from 'npm:chalk'
import Handlebars from 'npm:handlebars'
import { defineConfig } from 'npm:vite@^4.3.9'
import solid from 'npm:vite-plugin-solid@^2.7.0'

import 'npm:solid-js@^1.7.2'
import 'https://esm.sh/solid-js/jsx-runtime'
import 'npm:@solid-primitives/resize-observer'

const version = Deno.env.get('VERSION') ?? '0.0.0-development'
const homepage = 'https://github.com/coderbyheart/thingy-rocks-nrplus'

// Optional environment variables
const sentryDSN = Deno.env.get('SENTRY_DSN')
if (sentryDSN === undefined) {
  console.debug(chalk.yellow(`Sentry`), chalk.red('disabled'))
} else {
  console.debug(chalk.yellow(`Sentry DSN`), chalk.blue(sentryDSN))
}
const replaceInIndex = (data: Record<string, string>) => ({
  name: 'replace-in-index',
  transformIndexHtml: (source: string): string => {
    const template = Handlebars.compile(source)
    return template(data)
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    solid(),
    replaceInIndex({
      version,
    }),
  ],
  base: `${(Deno.env.get('BASE_URL') ?? '').replace(/\/+$/, '')}/`,
  preview: {
    host: 'localhost',
    port: 8080,
  },
  server: {
    host: 'localhost',
    port: 8080,
  },
  build: {
    outDir: './build',
    sourcemap: true,
  },
  // string values will be used as raw expressions, so if defining a string constant, it needs to be explicitly quoted
  define: {
    HOMEPAGE: JSON.stringify(homepage),
    VERSION: JSON.stringify(version ?? Date.now()),
    SENTRY_DSN: JSON.stringify(sentryDSN),
    BUILD_TIME: JSON.stringify(new Date().toISOString()),
  },
})
