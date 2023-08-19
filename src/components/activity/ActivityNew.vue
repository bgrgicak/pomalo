<script setup lang="ts">
import __ from '@/helper/translations';
import Search from '../search/Search.vue';

const props = defineProps(['event', 'openInSidebar', 'type', 'visible']);

</script>
<template>
  <v-row class="new-activity">
    <v-col cols="12">
      <Search
        :open-in-sidebar="props.openInSidebar"
        :event="props.event"
        :new-types="props.type ? [props.type] : undefined"
        :autofocus="true"
        :placeholder="__('Title')"
        :visible="true"
        :hide-icon="true"
      />
    </v-col>
  </v-row>
</template>