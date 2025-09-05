import type { DiscordReleaseChannel } from "./types"
import { fetchDiscordApp } from "./fetch"
import { GlobalEnvParser, type EnvBuildVars } from "../ast/globalEnv/GlobalEnvParser";

export type ScrapeSource =
| {
    type: "latest"
    releaseChannel: DiscordReleaseChannel
}
| {
    type: "archive"
    releaseChannel: DiscordReleaseChannel
    // something else?
}
export type ScrapeOptions = {
    source: ScrapeSource
}
export type ScrapeResult = {
    buildId: string
    releaseChannel: DiscordReleaseChannel
    envVars: EnvBuildVars
    entryScripts: string[]
    scrapedAt: Date
}

const DEFAULT_SCRAPE_OPTIONS: ScrapeOptions = {
    source: { type: "latest", releaseChannel: 'stable' }
}

export async function scrapeForBuild(options: Partial<ScrapeOptions> = {}): Promise<ScrapeResult> {
    const fullOptions = { ...DEFAULT_SCRAPE_OPTIONS, ...options }

    if (fullOptions.source.type !== "latest") throw new Error("TODO")

    const { releaseChannel } = fullOptions.source
    const blob = await fetchDiscordApp(releaseChannel)
    if (blob.type !== 'text/html') throw new Error('Not a text/html response')

    const html = await blob.text()
    const doc = new DOMParser().parseFromString(html, blob.type)
    const scriptEls = [...doc.querySelectorAll("script")]

    const envScriptEl = scriptEls.find(scriptEl => scriptEl.textContent?.includes("window.GLOBAL_ENV ="))
    if (!envScriptEl) throw new Error("Could not find window.GLOBAL_ENV script")

    const parser = new GlobalEnvParser(envScriptEl.textContent!)
    const envVars = parser.getGlobalEnvObject();
    if (!envVars) throw new Error("Could not parse window.GLOBAL_ENV")

    const entryScriptNames = scriptEls
        .filter(scriptEl => scriptEl.src.startsWith(location.origin))
        .map(scriptEl => scriptEl.src.slice(location.origin.length))
        .filter(pathname => pathname.startsWith("/assets/"))
        .map(pathname => pathname.replace("/assets/", ""))

    const buildId = parser.buildId;
    if (!buildId) throw new Error("Could not find build id")

    return {
        buildId,
        releaseChannel,
        envVars,
        entryScripts: entryScriptNames,
        scrapedAt: new Date(),
    }
}

export function getBuildId(envVars: EnvBuildVars): string | null {
    const { SENTRY_TAGS } = envVars
    if (SENTRY_TAGS == null || typeof SENTRY_TAGS !== "object") return null
    if (!('buildId' in SENTRY_TAGS) || typeof SENTRY_TAGS.buildId !== "string") return null
    return SENTRY_TAGS.buildId
}

// TODO: https://archive.org/developers/wayback-cdx-server.html

// export function useDiscordApp(options: MaybeRefOrGetter<DiscordAppOptions> = DEFAULT_APP_OPTIONS) {
//     return useAsyncState()
// }
