<script setup lang="ts">
const props = defineProps<{
    filename: string
}>()
defineEmits<{
    click: [filename: string]
}>()
</script>
<template>
    <div @click="$emit('click', filename)" class="item">
        {{ filename }}
    </div>
</template>
<style lang="css" scoped>
.item {
    transition: background-color;
    padding-block: 3px;
    &:hover {
        background-color: var(--color-bg-fg-800);
    }
}
</style>
