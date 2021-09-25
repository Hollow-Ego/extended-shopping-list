import { createReducer, on } from '@ngrx/store';
import { State } from '../shared/models/state.model';
import * as SLActions from './shopping-list.actions';
import {
	GeneralActionProps,
	GeneralReturnProps,
	ListIdProps,
	StateDetailsProps,
} from '../shared/models/action-props.model';
import { SettingsData } from '../shared/models/settings.model';

const initialState: State = {
	isLoading: false,
	currentListId: null,
	itemLibrary: null,
	itemGroups: null,
	shoppingLists: null,
	settings: null,
	errors: null,
};

const _shoppingListReducer = createReducer(
	initialState,
	on(
		SLActions.startInitialLoad,
		SLActions.startAddLibraryItem,
		SLActions.startRemoveLibraryItem,
		SLActions.startRemoveListItem,
		SLActions.startAddListItem,
		SLActions.startAddToItemGroup,
		SLActions.startUpdateLibraryItem,
		SLActions.startUpdateLibrary,
		SLActions.startSyncListItemAndLibItem,
		SLActions.startUpdateSettings,
		SLActions.startAddShoppingList,
		SLActions.startUpdateShoppingList,
		SLActions.startRemoveShoppingList,
		SLActions.startToggleListMode,

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
		SLActions.endUpdateLibrary,
		SLActions.endRemoveLibraryItem,
		(state, props) => {
			return updateLibraryItemState(state, props);
		}
	),
	on(SLActions.endSyncListItemAndLibItem, (state, props) => {
		return updateListsAndLib(state, props);
	}),
	on(
		SLActions.endAddListItem,
		SLActions.endUpdateListItem,
		SLActions.endRemoveListItem,
		SLActions.endUpdateShoppingList,
		SLActions.endToggleListMode,
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
	on(SLActions.endUpdateSettings, (state, props) => {
		const { type, ...newSettings } = props;
		return updateSettings(state, newSettings);
	}),
	on(SLActions.endAddShoppingList, (state, props) => {
		return endAddShoppingList(state, props);
	}),

	on(SLActions.endSetNewCurrentList, (state, props) => {
		return setNewCurrentList(state, props);
	}),
	on(SLActions.endRemoveShoppingList, (state, props) => {
		return endRemoveShoppingList(state, props);
	}),
	on(SLActions.raiseGeneralError, (state, props) => {
		return raiseGeneralError(state, props);
	})
);

function endInitialLoad(state: State, props: GeneralActionProps) {
	const { itemLibrary, itemGroups, shoppingLists, settings, currentListId } =
		props;

	return {
		...state,
		itemLibrary,
		itemGroups,
		shoppingLists,
		currentListId,
		settings,
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
	const { shoppingLists } = props;

	let currentListId = state.currentListId;

	if (props.newListId) {
		currentListId = props.newListId;
	}
	if (!currentListId) {
		currentListId = shoppingLists.keys().next().value;
	}

	return {
		...state,
		shoppingLists,
		currentListId,
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

function updateListsAndLib(state: State, props: GeneralReturnProps) {
	let newLib = props.itemLibrary;
	if (!newLib) {
		newLib = state.itemLibrary;
	}
	return {
		...state,
		shoppingLists: props.shoppingLists,
		itemLibrary: newLib,
		isLoading: false,
		errors: null,
	};
}

function updateSettings(state: State, newSettings: SettingsData) {
	return {
		...state,
		settings: newSettings,
		isLoading: false,
		errors: null,
	};
}

function endAddShoppingList(state: State, props: GeneralReturnProps) {
	const { shoppingLists, newListId } = props;

	return {
		...state,
		shoppingLists,
		currentListId: newListId,
		isLoading: false,
		errors: null,
	};
}

function endRemoveShoppingList(state: State, props: GeneralReturnProps) {
	const { shoppingLists, newListId } = props;

	return {
		...state,
		shoppingLists,
		currentListId: newListId,
		isLoading: false,
		errors: null,
	};
}
function setNewCurrentList(state: State, props: ListIdProps) {
	return {
		...state,
		currentListId: props.listId,
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
