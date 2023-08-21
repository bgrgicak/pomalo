import type Activity from './activity';

export interface SearchState {
    activityIds: string[];
    loading: boolean;
    searchText: string;
};