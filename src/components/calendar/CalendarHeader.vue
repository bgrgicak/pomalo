<script setup lang="ts">
import __ from '@/helper/translations';
import { defaultView } from '@/plugins/vuecal';
import type { PropType } from 'vue';
import { computed } from 'vue';
import type VueCal from 'vue-cal';

const props = defineProps({
	vuecal: {
		type: Object as PropType<VueCal>,
		default: undefined,
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

const title = computed(() => {
	if (!props.vuecal) {
		return '';
	}
	const options: any = { year: 'numeric' };
	if ('month' === props.activeView || 'week' === props.activeView ) {
		options.month = 'long';
	} else if ('day' === props.activeView ) {
		options.month = 'long';
		options.day = 'numeric';
	}
	return props.vuecal.view.startDate.toLocaleDateString(undefined, options);
});

const previous = () => {
	if (!props.vuecal) {
		return;
	}
	props.vuecal.previous();
};

const next = () => {
	if (!props.vuecal) {
		return;
	}
	props.vuecal.next();
};

const today = () => {
	if (!props.vuecal) {
		return;
	}
	props.vuecal.switchView(props.activeView, new Date());
};


</script>
<template>
  <v-row
    v-if="props.vuecal"
    class="pb-0 pt-2 px-2"
  >
    <v-col
      cols="9"
      :md="6"
      :offset-md="3"
      class="d-flex flex-column align-start align-md-center justify-center pa-0"
    >
      <v-btn-toggle
        :model-value="props.activeView"
        rounded="0"
        group
        density="compact"
        class="calendar-header__toggle"
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
      class="d-flex flex-column align-end pa-0"
    >
      <v-btn
        icon="mdi-plus"
        variant="text"
        @click="(event: any) => emit('addEvent')"
      />
    </v-col>
  </v-row>
  <v-row class="pb-4 px-2">
    <v-col
      cols="6"
      class="d-flex align-center pa-0"
    >
      <h2 class="m-0 text-subtitle-2 text-md-h6">
        {{ title }}
      </h2>
    </v-col>
    <v-col
      cols="6"
      class="d-flex align-center pa-0"
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
<style lang="scss">
.calendar-header__toggle {
  .v-btn {
    min-width: 0; 
    padding: 0 0.5rem;
  }
}
</style>