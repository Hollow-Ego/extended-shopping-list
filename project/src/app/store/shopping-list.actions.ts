import { createAction, props, union } from '@ngrx/store';
import {
	GeneralActionProps,
	LibraryItemProps,
	GeneralReturnProps,
	AddListItemProps,
	RemoveItemShortProps,
	ItemGroupProps,
	UpdateListItemProps,
	RemoveListItemProps,
	LoadShoppingListProps,
	ShoppingListReturnProps,
} from '../shared/models/action-props.model';

export const startInitialLoad = createAction(
	'[SSL] START_INITIAL_LOAD',
	props<GeneralActionProps>()
);

export const endInitialLoad = createAction(
	'[SSL] END_INITIAL_LOAD',
	props<GeneralActionProps>()
);

export const startAddLibraryItem = createAction(
	'[SSL] START_ADD_LIBRARY_ITEM',
	props<LibraryItemProps>()
);

export const endAddLibraryItem = createAction(
	'[SSL] END_ADD_LIBRARY_ITEM',
	props<GeneralReturnProps>()
);

export const startUpdateLibraryItem = createAction(
	'[SSL] START_UPDATE_LIBRARY_ITEM',
	props<LibraryItemProps>()
);

export const endUpdateLibraryItem = createAction(
	'[SSL] END_UPDATE_LIBRARY_ITEM',
	props<GeneralReturnProps>()
);

export const startRemoveLibraryItem = createAction(
	' [SSL] START_REMOVE_LIBRARY_ITEM',
	props<RemoveItemShortProps>()
);

export const endRemoveLibraryItem = createAction(
	' [SSL] END_REMOVE_LIBRARY_ITEM',
	props<GeneralReturnProps>()
);

export const startAddListItem = createAction(
	'[SSL] START_ADD_LIST_ITEM',
	props<AddListItemProps>()
);

export const endAddListItem = createAction(
	'[SSL] END_ADD_LIST_ITEM',
	props<GeneralReturnProps>()
);

export const startUpdateListItem = createAction(
	'[SSL] START_UPDATE_LIST_ITEM',
	props<UpdateListItemProps>()
);

export const endUpdateListItem = createAction(
	'[SSL] END_UPDATE_LIST_ITEM',
	props<GeneralReturnProps>()
);

export const startRemoveListItem = createAction(
	' [SSL] START_REMOVE_LIST_ITEM',
	props<RemoveListItemProps>()
);

export const endRemoveListItem = createAction(
	' [SSL] END_REMOVE_LIST_ITEM',
	props<GeneralReturnProps>()
);

export const startLoadShoppingList = createAction(
	'[SSL] START_LOAD_SHOPPING_LIST',
	props<LoadShoppingListProps>()
);

export const endLoadShoppingList = createAction(
	'[SSL] END_LOAD_SHOPPING_LIST',
	props<ShoppingListReturnProps>()
);

export const startAddToItemGroup = createAction(
	'[SSL] START_ADD_TO_ITEM_GROUP',
	props<ItemGroupProps>()
);

export const endAddToItemGroup = createAction(
	'[SSL] END_ADD_TO_ITEM_GROUP',
	props<GeneralReturnProps>()
);

export const startRemoveFromItemGroup = createAction(
	' [SSL] START_REMOVE_FROM_ITEM_GROUP',
	props<ItemGroupProps>()
);

export const endRemoveFromItemGroup = createAction(
	' [SSL] END_REMOVE_FROM_ITEM_GROUP',
	props<GeneralReturnProps>()
);

export const raiseGeneralError = createAction(
	'[SSL] RAISE_GENERAL_ERROR',
	props<GeneralReturnProps>()
);

const actions = union({
	startInitialLoad,
	endInitialLoad,

	startAddLibraryItem,
	endAddLibraryItem,
	startUpdateLibraryItem,
	endUpdateLibraryItem,
	startRemoveLibraryItem,
	endRemoveLibraryItem,

	startAddListItem,
	endAddListItem,
	startUpdateListItem,
	endUpdateListItem,
	startRemoveListItem,
	endRemoveListItem,
	startLoadShoppingList,
	endLoadShoppingList,

	startAddToItemGroup,
	endAddToItemGroup,
	startRemoveFromItemGroup,
	endRemoveFromItemGroup,

	raiseGeneralError,
});

export type ActionsUnion = typeof actions;
