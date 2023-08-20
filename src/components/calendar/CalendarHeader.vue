<script setup lang="ts">
import __ from '@/helper/translations';
import { defaultView } from '@/plugins/vuecal';
import type { PropType } from 'vue';
import type VueCal from 'vue-cal';

// const props = defineProps(['vuecal', 'activeView', 'views']);
const props = defineProps({
    vuecal: {
        type: Object as PropType<VueCal>,
        required: true,
    },
    activeView: {
        type: String,
        default: defaultView,
    },
    views: {
        type: Array as PropType<string[]>,
        default: () => [],
    },
});
const emit = defineEmits(['update:activeView', 'addEvent']);

const previous = () => {
    props.vuecal.previous();
};

const next = () => {
    props.vuecal.next();
};

const today = () => {
    props.vuecal.switchView(props.activeView, new Date());
};


</script>
<template>
  <v-row
    v-if="props.vuecal"
    class="pb-0"
  >
    <v-col
      cols="9"
      :md="6"
      :offset-md="3"
      class="d-flex flex-column align-start align-md-center"
    >
      <v-btn-toggle
        :model-value="props.activeView"
        rounded="0"
        group
        @update:modelValue="(value) => emit('update:activeView', value)"
      >
        <v-btn
          v-for="view in props.views"
          :key="view"
          :value="view"
        >
          {{ view }}
        </v-btn>
      </v-btn-toggle>
    </v-col>
    <v-col
      cols="3"
      class="d-flex flex-column align-end"
    >
      <v-btn
        icon="mdi-plus"
        variant="text"
        @click="(event: any) => emit('addEvent')"
      />
    </v-col>
  </v-row>
  <v-row class="pb-2">
    <v-col
      cols="6"
      class="d-flex align-center"
    >
      <h2 class="m-0 text-subtitle-2 text-md-h6">
        {{ (props.vuecal as any)?.viewTitle }}
      </h2>
    </v-col>
    <v-col
      cols="6"
      class="d-flex align-center"
    >
      <v-spacer />
      <v-btn
        icon="mdi-arrow-left"
        variant="text"
        @click="previous"
      />
      <v-btn
        icon="mdi-calendar-today"
        variant="text"
        @click="today"
      />
      <v-btn
        icon="mdi-arrow-right"
        variant="text"
        @click="next"
      />
    </v-col>
  </v-row>
</template>