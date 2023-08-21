import { newId } from '@/data/pouchdb';
import type Notice from '@/types/notice';
import { defineStore } from 'pinia';
import { type Ref, computed, ref } from 'vue';

interface NoticeState {
    notices: Notice[]
}

export const useNoticeStore = defineStore(
	'notices',
	() => {
		const state: Ref<NoticeState> = ref({
			notices: [],
		});
		const notices = computed(() => state.value.notices);

		const addNotice = (notice: Notice) => {
			if (!notice._id) {
				notice._id = newId();
			}
			state.value.notices.push(notice);
		};
		const removeNotice = (noticeId: string) => {
			state.value.notices = state.value.notices.filter((notice) => notice._id !== noticeId);
		};

		return {
			notices,
			addNotice,
			removeNotice,
		};
	}
);
