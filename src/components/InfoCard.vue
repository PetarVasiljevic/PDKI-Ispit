<script lang="ts" setup>
export interface InfoCardProps {
    title?: string
}

const { title } = defineProps<InfoCardProps>()
</script>

<template>
    <div class="card info-card text-center mb-4 border-success shadow-sm">
        <div class="card-header bg-success text-white">
            <strong><i class="fa-solid fa-seedling me-2"></i>{{ title ?? 'Informacija' }}</strong>
        </div>
        <div class="card-body mx-auto py-4">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
.info-card {
    max-width: 520px;
    margin-left: auto;
    margin-right: auto;
}
</style>
