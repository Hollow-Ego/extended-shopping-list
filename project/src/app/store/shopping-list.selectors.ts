import { createSelector, createFeatureSelector } from '@ngrx/store';
import { State } from '../shared/models/state.model';

export const getState = createFeatureSelector<State>('mainState');

export const selectItemLibrary = createSelector(getState, (state: State) => {
	return state.itemLibrary;
});

export const selectShoppingLists = createSelector(getState, (state: State) => {
	return state.shoppingLists;
});

export const selectShoppingList = (props: { id: string }) =>
	createSelector(getState, (state: State) => {
		return {
			list: state.shoppingLists.get(props.id),
			library: state.itemLibrary,
		};
	});

export const selectListsAndLib = createSelector(getState, (state: State) => {
	return { shoppingLists: state.shoppingLists, itemLibrary: state.itemLibrary };
});

export const selectItemGroups = createSelector(getState, (state: State) => {
	return state.itemGroups;
});

export const selectAvailableTags = createSelector(getState, (state: State) => {
	return state.itemLibrary.getAllTags();
});

export const selectSettings = createSelector(getState, (state: State) => {
	return state.settings;
});
