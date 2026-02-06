import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TARGET = (process.env.BROWSER || 'chrome').toLowerCase()
const manifestPath = path.resolve(__dirname, `./src/manifest.${TARGET}.json`)
if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest for target '${TARGET}' not found at ${manifestPath}`)
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))

// https://vitejs.dev/config/
const isChrome = TARGET === 'chrome'
export default defineConfig({
    plugins: [
        react(),
        ...(isChrome ? [crx({ manifest })] : []),
        // for firefox build we will copy and transform the manifest into the outDir after build
        {
            name: 'write-manifest-for-firefox',
            closeBundle() {
                if (!isChrome) {
                    const out = path.resolve(__dirname, `dist/${TARGET}`)
                    const dest = path.join(out, 'manifest.json')
                    fs.mkdirSync(out, { recursive: true })

                    // load original manifest
                    const mf = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))

                    // map background scripts to built entry filenames
                    if (mf.background && Array.isArray(mf.background.scripts)) {
                        mf.background.scripts = mf.background.scripts.map((p: string) => {
                            // assume input key names used in rollup input: 'background' -> background.js
                            if (p.endsWith('index.ts') || p.endsWith('index.tsx')) return 'background.js'
                            return path.basename(p).replace(/\.(ts|tsx)$/, '.js')
                        })
                    }

                    // map content script paths to generated content.js
                    if (mf.content_scripts && Array.isArray(mf.content_scripts)) {
                        mf.content_scripts = mf.content_scripts.map((cs: any) => {
                            const copy = { ...cs }
                            if (Array.isArray(copy.js)) {
                                copy.js = copy.js.map((p: string) => {
                                    if (p.includes('content')) return 'content.js'
                                    return path.basename(p).replace(/\.(ts|tsx)$/, '.js')
                                })
                            }
                            return copy
                        })
                    }

                    // ensure sidepanel path points to built html location (we output src/sidepanel/index.html)
                    if (mf.sidebar_action && mf.sidebar_action.default_panel) {
                        // keep as-is since we build to src/sidepanel/index.html
                    }

                    fs.writeFileSync(dest, JSON.stringify(mf, null, 4), 'utf-8')
                }
            },
        },
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        outDir: path.resolve(__dirname, `dist/${TARGET}`),
        rollupOptions: {
            input: isChrome
                ? {
                      offscreen: path.resolve(__dirname, 'src/offscreen/pdf.html'),
                  }
                : {
                      offscreen: path.resolve(__dirname, 'src/offscreen/pdf.html'),
                      content: path.resolve(__dirname, 'src/content/index.tsx'),
                      background: path.resolve(__dirname, 'src/background/index.ts'),
                      sidepanel: path.resolve(__dirname, 'src/sidepanel/index.html'),
                  },
            ...(isChrome
                ? {}
                : {
                      output: {
                          entryFileNames: '[name].js',
                          chunkFileNames: 'assets/[name]-[hash].js',
                          assetFileNames: 'assets/[name]-[hash][extname]',
                      },
                  }),
        },
    },
})
