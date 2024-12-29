import { createTsconfigPathsPlugin } from '@strictly/support-vite/plugins/tsconfig_paths'
import { type TsconfigJson } from '@strictly/support-vite/types'
import { type ViteUserConfig } from 'vitest/config'

export function createVitestUserConfig(tsconfigJson: TsconfigJson): ViteUserConfig {
  return {
    plugins: [createTsconfigPathsPlugin(tsconfigJson)],
    test: {
      include: ['**/specs/(*.)+(tests).[jt]s?(x)'],
      exclude: [
        '.out',
        'dist',
      ],
      globals: true,
    },
  }
}
