import type Activity from './activity';

export interface SearchState {
    activities: Activity[];
    loading: boolean;
    searchText: string;
};