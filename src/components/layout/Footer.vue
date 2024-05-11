<script setup lang="ts">
import __ from '@/helper/translations';
import { useNoticeStore } from '@/stores/notices';
import type Notice from '@/types/notice';
import constants from '@/helper/constants';

const noticeStore = useNoticeStore();


const dismiss = (notice: Notice) => {
	if (!notice._id) {
		return;
	}
	noticeStore.removeNotice(notice._id);
};
</script>
<template>
  <v-snackbar
    v-for="notice in noticeStore.notices"
    :key="notice._id"
    :timeout="notice.autoDismiss ? constants.notice.dismissDelay : -1"
    :model-value="true"
    class="notice"
  >
    {{ notice.title }}

    <template #actions>
      <v-btn
        variant="text"
        icon="mdi-close"
        @click="() => dismiss(notice)"
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
</style>
```