import type Notice from '@/types/notice';
import { defineStore } from 'pinia';

interface NoticeState {
    notices: Notice[]
}

// TODO Show notices in the UI
export const useNoticeStore = defineStore(
    'notices',
    {
        state: (): NoticeState => {
            return {
                notices: [],
            };
        },
        getters: {
            notices: (state) => state.notices,
        },
        actions: {
            addNotice(notice: Notice) {
                this.notices.push(notice);
            },
            removeNotice(noticeId: string) {
                const noticeIndex = this.notices.findIndex(notice => notice._id === noticeId);
                if (noticeIndex !== -1) {
                    this.notices.splice(noticeIndex, 1);
                }
            }
        }
    },
);
