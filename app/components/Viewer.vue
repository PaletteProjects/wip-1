<script setup lang="ts">
import { computedAsync } from '@vueuse/core';
import { MainChunkParser } from '~/utils/ast/chunk/MainChunkParser';
import { scrapeForBuild } from '~/utils/discord/assets';
import { fetchDiscordAsset } from '~/utils/discord/fetch';

const isLoading = ref<boolean | string>(false);
const scrapeResult = computedAsync(async () => {
    const scrape = await scrapeForBuild({
        source: {
            releaseChannel: "stable",
            type: "latest"
        }
    })
    const webJsURL = scrape.entryScripts.find(s => s.startsWith("web."));
    if (!webJsURL) {
        throw new Error("Could not find web.js URL");
    }
    const webJsContent = await (await fetchDiscordAsset(webJsURL)).text();
    const parser = new MainChunkParser(webJsContent);
    const modules = parser.getDefinedModules();
    return {
        modules
    };
}, null, {
    evaluating: isLoading,
    onError(e) {
        isLoading.value = (e as Error).message;
    }
});
const currentModule = ref<string | null>(null);
const moduleMap = computed(() => {
    return scrapeResult.value?.modules
})
const modules = computed(() => {
    return Object.keys(moduleMap.value ?? {});
})

</script>
<template>
    <div class="height">
        <div class="wrapper">
            <header>Discord Module Browser</header>
            <div v-if="isLoading === false" class="main">
                <div class="sidebar">
                    <ScrollArea class="scroller">
                        <FileListItem v-for="module in modules" :filename="module" @click="currentModule = module"/>
                    </ScrollArea>
                </div>
                <div class="content">
                    <ScrollArea class="scroller">
                        <code v-if="currentModule && moduleMap">{{ moduleMap[currentModule] }}</code>
                    </ScrollArea>
                </div>
            </div>
            <div v-else-if="typeof isLoading === 'string'">
                <div>
                    An error occurred loading the webpack chunk
                    <code>
                        {{ isLoading }}
                    </code>
                </div>
            </div>
            <div v-else>
                Loading...
            </div>
        </div>
    </div>
</template>
<style lang="css" scoped>
.content {
    width: 100%;
    max-height: 100%;
    .scroller {
        max-height: 100%;
    }
}
.height {
    height: 100vh;
}
.main {
    display: flex;
    position: relative;
    max-height: 100%;
    overflow-y: hidden;
}
.sidebar {
    display: flex;
    width: 10%;
    max-height: 100%;
    overflow-y: hidden;
    & .scroller {
        display: flex;
        flex-direction: column;
        max-height: 100%;
    }
}
.wrapper {
    display: grid;
    position: relative;
    height: 100%;
    grid-template-rows: min-content 1fr;
    & > * {
        margin: 8px;
    }
}
</style>
