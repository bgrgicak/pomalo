<script setup lang="ts">
import __ from '@/helper/translations';
import { useNoticeStore } from '@/stores/notices';
import type Notice from '@/types/notice';
import constants from '@/helper/constants';
import { onMounted } from 'vue';

const noticeStore = useNoticeStore();


const dismiss = (event : any, notice: Notice) => {
	event.stopPropagation();
	if (!notice._id) {
		return;
	}
	if ( notice.onDismiss ) {
		notice.onDismiss(notice);
	} else {
		noticeStore.removeNotice(notice._id);
	}
};
const click = (notice: Notice) => {
	if (!notice._id) {
		return;
	}
	if (notice.onClick) {
		notice.onClick(notice);
	}
};

onMounted(() => {
	noticeStore.checkPermissions();
});

</script>
<template>
  <v-snackbar
    v-for="notice in noticeStore.notices"
    :key="notice._id"
    :timeout="notice.autoDismiss ? constants.notice.dismissDelay : -1"
    :model-value="true"
    class="notice"
    :class="{'notice--clickable': notice.onClick}"
    @click="() => click(notice)"
  >
    {{ notice.title }}

    <template #actions>
      <v-btn
        variant="text"
        icon="mdi-close"
        @click="(event: any) => dismiss(event, notice)"
      />
    </template>
  </v-snackbar>
</template>
<style lang="scss">
.notice .v-snackbar__wrapper {
	right: 0;
	left: unset !important;
	transform: unset !important;
}
.notice--clickable .v-snackbar__content {
	cursor: pointer;
}
</style>
```