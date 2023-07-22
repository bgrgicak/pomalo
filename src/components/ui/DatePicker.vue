<script setup lang="ts">
import { getSystemDateFormat, toLocaleDateString } from '@/helper/date';
import { computed } from 'vue';

const props = defineProps(['value', 'label']);

const emit = defineEmits(['onChange']);

const systemDateFormat = getSystemDateFormat();

const value = computed(() => {
    if (!props.value) {
        return undefined;
    }
    return toLocaleDateString(new Date(props.value));
});

const modelValueChanged = (newValue: string) => {
    const date = newValue ? new Date(newValue) : undefined;
    emit('onChange', date);
};
</script>
<template>
    <v-text-field :label="label"
                  :value="value"
                  @update:modelValue="modelValueChanged"
                  type="date"
                  :pattern="systemDateFormat" />
</template>