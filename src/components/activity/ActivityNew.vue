<script setup lang="ts">
import __ from '@/helper/translations';
import Search from '../search/Search.vue';
import type { ActivityEvent } from '@/types/activity';
import type { PropType } from 'vue';

const props = defineProps({
  event: {
    type: Object as PropType<ActivityEvent>,
    default: undefined,
  },
  openInSidebar: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: undefined,
  },
  visible: {
    type: Boolean,
    default: false,
  },
});

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