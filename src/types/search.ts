import type { ActivityType } from './activity';

export interface SearchOptions {
    archived?: Date,
    types?: ActivityType[],
}

export interface SearchState {
    activityIds: string[];
    loading: boolean;
    searchText: string;
};