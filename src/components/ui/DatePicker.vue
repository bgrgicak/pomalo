<script setup lang="ts">
import { getSystemDateFormat, toInputDateString, getLocalDate, isValidDate } from '@/helper/date';
import __ from '@/helper/translations';
import { useNoticeStore } from '@/stores/notices';
import { NoticeType } from '@/types/notice';
import type { PropType } from 'vue';
import { ref } from 'vue';
import { computed } from 'vue';
const hourOptions = Array.from(Array(24).keys()).map((hour) => {
	return hour.toString().padStart(2, '0');
});
const minuteOptions = Array.from(Array(60).keys()).map((minute) => {
	return minute.toString().padStart(2, '0');
});

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

const noticeStore = useNoticeStore();

const showDatepicker = ref(false);

const systemDateFormat = getSystemDateFormat();


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
	return toInputDateString(props.min);
});

const maxDate = computed(() => {
	if (!props.max) {
		return undefined;
	}
	return toInputDateString(props.max);
});

const getTimeValue = (date: Date | undefined) => {
	if (!props.value) {
		return {
			hours: '00',
			minutes: '00',
		};
	}
	let hours: string | number = props.value.getHours();
	if (hours < 10) {
		hours = '0' + hours;
	}
	let minutes: string | number = props.value.getMinutes();
	if (minutes < 10) {
		minutes = '0' + minutes;
	}
	return {
		hours,
		minutes,
	};
};

const timeValue = ref(getTimeValue(props.value));

const onChangeDate = (newValue: any) => {
	if(!isValidDate(newValue)){
		return;
	}
	if (timeValue.value.hours) {
		newValue.setHours(
			parseInt(
				timeValue.value.hours as string
			)
		);
	}
	if (timeValue.value.minutes) {
		newValue.setMinutes(
			parseInt(
				timeValue.value.minutes as string
			));
	}
	showDatepicker.value = false;

	if (props.max && newValue.getTime() > props.max.getTime()) {
		noticeStore.addNotice({
			type: NoticeType.Error,
			title: __('The date is after the maximum date.'),
		});
	} else if (props.min && newValue.getTime() < props.min.getTime()) {
		noticeStore.addNotice({
			type: NoticeType.Error,
			title: __('The date is before the minimum date.'),
		});
	} else {
		emit('change', newValue);
	}
};
const onChangeTime = (newValue: any) => {
	timeValue.value = {
		...timeValue.value,
		...newValue,
	};
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
      :readonly="props.readonly"
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
    >
      <template #header>
        <div
          v-if="showTime"
          class="date-picker__time"
        >
          <h3 class="mt-3">
            {{ __('Time') }}
          </h3>
          <v-select
            class="included"
            label=""
            :readonly="props.readonly"
            :value="timeValue.hours"
            :items="hourOptions"
            @update:modelValue="(value: any) => onChangeTime({hours: value})"
          />
          <v-select
            label=""
            :readonly="props.readonly"
            :value="timeValue.minutes"
            :items="minuteOptions"
            @update:modelValue="(value: any) => onChangeTime({minutes: value})"
          />
        </div>
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

