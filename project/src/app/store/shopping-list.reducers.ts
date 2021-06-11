import { createReducer, createSelector, on } from '@ngrx/store';
import { ItemLibrary } from '../shared/classes/item-library.class';
import { State } from '../shared/models/state.model';
import * as Modes from '../shared/constants';
import * as SLActions from './shopping-list.actions';
import {
	GeneralActionProps,
	GeneralReturnProps,
} from '../shared/models/action-props.model';

const initialState: State = {
	isLoading: false,
	mode: Modes.EDIT_MODE,
	currentListIdx: 0,
	itemLibrary: null,
	itemGroups: null,
	shoppingLists: null,
	errors: null,
};

const _shoppingListReducer = createReducer(
	initialState,
	on(
		SLActions.startInitialLoad,
		SLActions.startAddLibraryItem,
		SLActions.startAddListItem,
		SLActions.startAddToItemGroup,
		SLActions.startUpdateLibraryItem,
		state => ({
			...state,
			isLoading: true,
			errors: null,
		})
	),
	on(SLActions.endInitialLoad, (state, props) => {
		return endInitialLoad(state, props);
	}),
	on(
		SLActions.endAddLibraryItem,
		SLActions.endUpdateLibraryItem,
		SLActions.endRemoveLibraryItem,
		(state, props) => {
			return updateLibraryItemState(state, props);
		}
	),
	on(
		SLActions.endAddListItem,
		SLActions.endUpdateListItem,
		SLActions.endRemoveListItem,
		(state, props) => {
			return updateListItemState(state, props);
		}
	),
	on(
		SLActions.endAddToItemGroup,
		SLActions.endRemoveFromItemGroup,
		(state, props) => {
			return updateItemGroupState(state, props);
		}
	),
	on(SLActions.raiseGeneralError, (state, props) => {
		return raiseGeneralError(state, props);
	})
);

function endInitialLoad(state: State, props: GeneralActionProps) {
	const { itemLibrary, itemGroups, shoppingLists } = props;

	return {
		...state,
		itemLibrary,
		itemGroups,
		shoppingLists,
		isLoading: false,
		errors: null,
	};
}

function updateLibraryItemState(state: State, props: GeneralReturnProps) {
	return {
		...state,
		itemLibrary: props.itemLibrary,
		isLoading: false,
		errors: null,
	};
}

function updateListItemState(state: State, props: GeneralReturnProps) {
	return {
		...state,
		shoppingLists: props.shoppingLists,
		isLoading: false,
		errors: null,
	};
}

function updateItemGroupState(state: State, props: GeneralReturnProps) {
	return {
		...state,
		itemGroups: props.itemGroups,
		isLoading: false,
		errors: null,
	};
}

function raiseGeneralError(state: State, props: GeneralReturnProps) {
	return {
		...state,
		isLoading: false,
		errors: props.errors,
	};
}

export function reducer(
	state: State | undefined,
	action: SLActions.ActionsUnion
) {
	return _shoppingListReducer(state, action);
}
