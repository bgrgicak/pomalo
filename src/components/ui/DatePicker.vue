<script setup lang="ts">
import { getSystemDateFormat, isValidDate } from '@/helper/date';
import __ from '@/helper/translations';
import type { Ref } from 'vue';
import type { PropType } from 'vue';
import { ref } from 'vue';
import { computed } from 'vue';

const props = defineProps({
	value: {
		type: Date,
		default: undefined,
	},
	label: {
		type: String,
		default: '',
	},
	time: {
		type: Boolean,
		default: false,
	},
	hint: {
		type: String,
		default: '',
	},
	variant: {
		type: String as PropType<any>,
		default: undefined,
	},
	readonly: {
		type: Boolean,
		default: false,
	},
	min: {
		type: Date,
		default: undefined,
	},
	max: {
		type: Date,
		default: undefined,
	},
});

const emit = defineEmits(['change']);

const systemDateFormat = getSystemDateFormat();

const showDatepicker = ref(false);
const timeValue: Ref<string> = ref(
	props.value
		? props.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
		: ''
);
const timeError: Ref<string> = ref('');

const showTime = computed(() => true === props.time);

const dateValue = computed(() => {
	if (!props.value) {
		return undefined;
	}
	if (props.time) {
		return props.value.toLocaleString();
	}
	return props.value.toLocaleDateString();
});

const minDate = computed(() => {
	if (!props.min) {
		return undefined;
	}
	return props.min.toLocaleDateString();
});

const maxDate = computed(() => {
	if (!props.max) {
		return undefined;
	}
	return props.max.toLocaleDateString();
});

const getNewValue = (newValue: any) => {
	if (timeValue.value) {
		newValue = new Date(
			newValue.toLocaleDateString() + ' ' + timeValue.value
		);
	}
	return newValue;
};

const onSave = (value: Date|undefined) => {
	if ('' !== timeError.value) {
		return false; 
	}
	// trigger save if only time changed
	if (undefined === value) {
		onChangeDate(props.value);
	}
};

const onChangeDate = (newValue: any) => {
	if(!isValidDate(newValue)){
		return;
	}
	showDatepicker.value = false;
	emit('change', getNewValue(newValue));
};

const onChangeTime = (value: string) => {
	timeError.value = '';
	timeValue.value = value;
	const newValue = getNewValue(props.value);
	if (props.max && newValue > props.max) {
		timeError.value = __('Date must be before ') + props.max.toLocaleString();
		return false;
	} else if (props.min && newValue < props.min) {
		timeError.value =  __('Date must be after ') + props.min.toLocaleString();
		return false;
	}
};

const show = () => {
	showDatepicker.value = true;
};
const hide = () => {
	showDatepicker.value = false;
};
const clickOutsideConditional = (event: any) => {
	if (event.target) {
		return ! event.target.classList.contains('v-list-item-title');
	}
	return true;
};
</script>
<template>
  <div
    :class="{ 'date-picker': true, 'date-picker--has-time': showTime }"
  >
    <v-text-field
      :label="label"
      :model-value="dateValue"
      class="date-picker__date"
      :pattern="systemDateFormat"
      :hint="props.hint"
      :variant="props.variant"
      :readonly="true"
      @click="show"
    />
    <v-date-picker
      v-if="showDatepicker && !props.readonly"
      v-click-outside.self="{
        handler: hide,
        closeConditional: clickOutsideConditional
      }"
      title=""
      :model-value="value as any"
      :min="minDate"
      :max="maxDate"
      @update:modelValue="onChangeDate"
      @click:cancel="hide"
      @click:save="onSave"
    >
      <template #header>
        <v-text-field
          v-if="showTime"
          class="date-picker__time"
          :label="__('Time')"
          :readonly="props.readonly"
          :model-value="timeValue"
          type="time"
          @update:modelValue="onChangeTime"
        />
        <v-alert
          v-if="timeError"
          type="error"
          class="mx-4 mb-6"
        >
          {{ timeError }}
        </v-alert>
      </template>
    </v-date-picker>
  </div>
</template>
<style lang="scss">
.date-picker {
	position: relative;
    &.date-picker--has-time {
        display: flex;

        .date-picker__time {
            position: relative;
            left: -1px;
        }
    }

	.v-picker {
		display: flex;
		flex-direction: column;
		z-index: 1;
		position: absolute;
		//Picker width is forced to 360px, so we need to adjust the position and scale
		transform: scale(0.8);
		left: -36px;
		top: 0;

		.v-picker__header {
			order: 2;
		}
		.v-picker__body {
			order: 1;
		}
		.v-picker__actions {
			order: 3;
		}
	}
}

.date-picker__date {
    min-width: 148px;
}

.date-picker__time {
    width: 100%;
    border-left: unset;
	padding-inline-start: 24px;
	padding-top: 4px;
	padding-bottom: 4px;
	padding-inline-end: 12px;

	.v-select {
		display: inline-block;
		width: 50%;
		.v-list-item-title {
			pointer-events: none;
		}
	}

    .v-field__input {
        padding-left: 6px;
    }
}
</style>

