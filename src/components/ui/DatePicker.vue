<script setup lang="ts">
import { getSystemDateFormat, toInputDateString, getLocalDate, isValidDate } from '@/helper/date';
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
		default: null,
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
});

const emit = defineEmits(['change']);

const showDatepicker = ref(false);

const systemDateFormat = getSystemDateFormat();


const showTime = computed(() => true === props.time);

const dateValue = computed(() => {
	if (!props.value) {
		return undefined;
	}
	return toInputDateString(props.value);
});

const timeValue = computed(() => {
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
});

const onChangeDate = (newValue: any) => {
	if(!isValidDate(newValue)){
		return;
	}
	newValue.setHours(timeValue.value.hours);
	newValue.setMinutes(timeValue.value.minutes);
	emit('change', newValue);
	showDatepicker.value = false;
};
const onChangeTime = (newValue: any) => {
	const newDate = getLocalDate(props.value);
	newDate.setHours(
		parseInt(
			undefined === newValue.hours
				? timeValue.value.hours
				: newValue.hours
		)
	);
	newDate.setMinutes(
		parseInt(
			undefined === newValue.minutes
				? timeValue.value.minutes
				: newValue.minutes
		)
	);
	emit('change', newDate);
};

const show = () => {
	showDatepicker.value = true;
};
const hide = () => {
	showDatepicker.value = false;
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
      v-click-outside="hide"
      title=""
      :model-value="[value]"
      @update:modelValue="onChangeDate"
      @click:cancel="hide"
    />
    <div
      v-if="showTime"
      class="date-picker__time"
    >
      <v-select
        label=""
        :readonly="props.readonly"
        :value="timeValue.hours"
        :items="hourOptions"
        variant="underlined"
        @update:modelValue="(value: any) => onChangeTime({hours: value})"
      />
      <v-select
        label=""
        :readonly="props.readonly"
        :value="timeValue.minutes"
        :items="minuteOptions"
        variant="underlined"
        @update:modelValue="(value: any) => onChangeTime({minutes: value})"
      />
    </div>
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
		z-index: 1;
		position: absolute;
		//Picker width is forced to 360px, so we need to adjust the position and scale
		transform: scale(0.8);
		left: -36px;
		top: 0;
	}
}

.date-picker__date {
    min-width: 148px;
}

.date-picker__time {
    min-width: 130px;
    max-width: 130px;
    border-left: unset;

	.v-select {
		display: inline-block;
		width: 50%;
	}

    .v-field__input {
        padding-left: 6px;
    }
}
</style>

