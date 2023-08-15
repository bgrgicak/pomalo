<script setup lang="ts">
import __ from '@/helper/translations';
import Search from '../search/Search.vue';

const props = defineProps(['event', 'openInSidebar', 'type', 'visible']);

</script>
<template>
    <v-row class="new-activity">
        <v-col cols="12">
            <Search :openInSidebar="props.openInSidebar"
                    :event="props.event"
                    :newTypes="props.type ? [props.type] : undefined"
                    :autofocus="true"
                    variant="underlined"
                    :placeholder="__('Title')"
                    :visible="true" />
        </v-col>
    </v-row>
</template>
<style lang="scss">
.new-activity {
    .search {
        .v-field__append-inner {
            display: none;
        }
    }
}
</style>