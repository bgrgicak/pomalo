import type { ActivityType } from './activity';

export interface SearchOptions {
    archived?: boolean,
    types?: ActivityType[],
}

export interface SearchState {
    activityIds: string[];
    loading: boolean;
    searchText: string;
};