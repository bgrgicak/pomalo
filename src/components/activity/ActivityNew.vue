<script setup lang="ts">
import __ from '@/helper/translations';
import Search from '../search/Search.vue';

const props = defineProps(['event', 'openInSidebar', 'type', 'visible']);

</script>
<template>
    <v-row>
        <v-col cols="12">
            <Search :openInSidebar="props.openInSidebar"
                    :event="props.event"
                    :newTypes="props.type ? [props.type] : undefined"
                    :visible="true" />
        </v-col>
    </v-row>
</template>