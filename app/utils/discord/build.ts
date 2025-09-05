import { saveWebpackModules } from "~/store/modules"
import { parseScript } from "../parser/parse"
import { getWebpackBootstrap, type WebpackBootstrap } from "../parser/webpack"
import type { ScrapeResult } from "./assets"
import { fetchDiscordAsset } from "./fetch"
import type { Build } from "./types"
import { GlobalEnvParser } from "../ast/globalEnv/GlobalEnvParser";

export function saveFromScrapeResult(scrape: ScrapeResult) {
    const envVars: Record<string, string> = {}
    for (const [key, value] of Object.entries(scrape.envVars)) {
        envVars[key] = !GlobalEnvParser.isLiteral(value) ? value.expression : JSON.stringify(value)
    }

    const build: Build = {
        id: scrape.buildId,
        entryScripts: scrape.entryScripts,
        envVars,
        chunks: {},
    }

    setBuild(build.id, build)
}

export async function findWebpackChunk(build: Build) {
    const potentials = await Promise.all(build.entryScripts.map(async (scriptName) => {
        const entryScript = await fetchDiscordAsset(scriptName)
        const entryProgram = parseScript(await entryScript.text())
        const webpack = getWebpackBootstrap(entryProgram)
        return webpack
    }))

    const webpackIdx = potentials.findIndex(v => v != null)
    if (webpackIdx === -1) return null

    const chunk = build.entryScripts[webpackIdx]!.replace(/\.js$/, '')
    const webpack = potentials[webpackIdx]!

    return { chunk, webpack }
}

export async function saveBuildWebpack(build: Build, webpackChunk: string, webpack: WebpackBootstrap) {
    await saveWebpackModules(webpackChunk, webpack.modules)

    build.webpack = {
        entryChunk: webpackChunk,
        chunks: webpack.chunks,
    }
    build.chunks[webpackChunk] = Object.keys(webpack.modules)
}
