<script setup lang="ts">
import __ from '@/helper/translations';
import { useNoticeStore } from '@/stores/notices';
import type Notice from '@/types/notice';
import { computed } from 'vue';

const noticeStore = useNoticeStore();

const timeout = 5000;

const dismiss = (notice: Notice) => {
	console.log(notice);
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
    :timeout="timeout"
    :model-value="true"
  >
    {{ noticeStore.notices }}
    {{ notice.title }}

    <template #actions>
      <v-btn
        color="blue"
        variant="text"
        @click="() => dismiss(notice)"
      >
        {{ __('Close') }}
      </v-btn>
    </template>
  </v-snackbar>
</template>