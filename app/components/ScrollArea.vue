<script setup lang="ts">
const el = ref<HTMLDivElement | null>(null);
provide(ScrollArea, el);
</script>
<template>
    <div ref="el" class="scroller">
        <slot />
    </div>
</template>
<style scoped>
.scroller {
    min-width: 100%;
    position: relative;
    max-height: 400px;
    /*
     * not compatible with scrollbar styles
     */
    resize: none;
    overflow: hidden scroll;
    &::-webkit-scrollbar {
        height: 16px;
        width: 16px;
    }
    &::-webkit-scrollbar-track {
        background-color: var(--scrollbar-track-color);
    }
    &::-webkit-scrollbar-thumb {
        background-color: var(--scrollbar-thumb-color);
        min-height: 40px;
    }
    &::-webkit-scrollbar-thumb, &::-webkit-scrollbar-track {
        background-clip: padding-box;
        border: 4px solid transparent;
        border-radius: 8px;
    }
    &::-webkit-scrollbar-corner {
        background-color: transparent;
    }
}
</style>
