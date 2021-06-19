import { createAction, props, union } from '@ngrx/store';
import {
	GeneralActionProps,
	LibraryItemProps,
	GeneralReturnProps,
	ListItemProps,
	RemoveItemShortProps,
	ItemGroupProps,
	RemoveListItemProps,
	LoadShoppingListProps,
	ShoppingListReturnProps,
	AddShoppingListProps,
	UpdateShoppingListProps,
	ListIdProps,
} from '../shared/models/action-props.model';
import { SettingsData } from '../shared/models/settings.model';

export const startInitialLoad = createAction(
	'[PSXL1] START_INITIAL_LOAD',
	props<GeneralActionProps>()
);

export const endInitialLoad = createAction(
	'[PSXL1] END_INITIAL_LOAD',
	props<GeneralActionProps>()
);

export const startAddLibraryItem = createAction(
	'[PSXL1] START_ADD_LIBRARY_ITEM',
	props<LibraryItemProps>()
);

export const endAddLibraryItem = createAction(
	'[PSXL1] END_ADD_LIBRARY_ITEM',
	props<GeneralReturnProps>()
);

export const startUpdateLibraryItem = createAction(
	'[PSXL1] START_UPDATE_LIBRARY_ITEM',
	props<LibraryItemProps>()
);

export const endUpdateLibraryItem = createAction(
	'[PSXL1] END_UPDATE_LIBRARY_ITEM',
	props<GeneralReturnProps>()
);

export const startRemoveLibraryItem = createAction(
	' [PSXL1] START_REMOVE_LIBRARY_ITEM',
	props<RemoveItemShortProps>()
);

export const endRemoveLibraryItem = createAction(
	' [PSXL1] END_REMOVE_LIBRARY_ITEM',
	props<GeneralReturnProps>()
);

export const startSyncListItemAndLibItem = createAction(
	'[PSXL1] START_SNY_LIST_ITEM_AND_LIB_ITEM',
	props<LibraryItemProps>()
);

export const endSyncListItemAndLibItem = createAction(
	'[PSXL1] END_SNY_LIST_ITEM_AND_LIB_ITEM',
	props<GeneralReturnProps>()
);

export const startAddListItem = createAction(
	'[PSXL1] START_ADD_LIST_ITEM',
	props<ListItemProps>()
);

export const endAddListItem = createAction(
	'[PSXL1] END_ADD_LIST_ITEM',
	props<GeneralReturnProps>()
);

export const startUpdateListItem = createAction(
	'[PSXL1] START_UPDATE_LIST_ITEM',
	props<ListItemProps>()
);

export const endUpdateListItem = createAction(
	'[PSXL1] END_UPDATE_LIST_ITEM',
	props<GeneralReturnProps>()
);

export const startRemoveListItem = createAction(
	' [PSXL1] START_REMOVE_LIST_ITEM',
	props<RemoveListItemProps>()
);

export const endRemoveListItem = createAction(
	' [PSXL1] END_REMOVE_LIST_ITEM',
	props<GeneralReturnProps>()
);

export const startLoadShoppingList = createAction(
	'[PSXL1] START_LOAD_SHOPPING_LIST',
	props<LoadShoppingListProps>()
);

export const endLoadShoppingList = createAction(
	'[PSXL1] END_LOAD_SHOPPING_LIST',
	props<ShoppingListReturnProps>()
);

export const startAddToItemGroup = createAction(
	'[PSXL1] START_ADD_TO_ITEM_GROUP',
	props<ItemGroupProps>()
);

export const endAddToItemGroup = createAction(
	'[PSXL1] END_ADD_TO_ITEM_GROUP',
	props<GeneralReturnProps>()
);

export const startRemoveFromItemGroup = createAction(
	'[PSXL1] START_REMOVE_FROM_ITEM_GROUP',
	props<ItemGroupProps>()
);

export const endRemoveFromItemGroup = createAction(
	'[PSXL1] END_REMOVE_FROM_ITEM_GROUP',
	props<GeneralReturnProps>()
);

export const startUpdateSettings = createAction(
	'[PSXL1] START_UPDATE_SETTINGS',
	props<SettingsData>()
);

export const endUpdateSettings = createAction(
	'[PSXL1] END_UPDATE_SETTINGS',
	props<SettingsData>()
);

export const startAddShoppingList = createAction(
	'[PSXL1] START_ADD_SHOPPING_LIST',
	props<AddShoppingListProps>()
);

export const endAddShoppingList = createAction(
	'[PSXL1] END_ADD_SHOPPING_LIST',
	props<GeneralReturnProps>()
);

export const startUpdateShoppingList = createAction(
	'[PSXL1] START_UPDATE_SHOPPING_LIST',
	props<UpdateShoppingListProps>()
);

export const endUpdateShoppingList = createAction(
	'[PSXL1] END_UPDATE_SHOPPING_LIST',
	props<GeneralReturnProps>()
);

export const startRemoveShoppingList = createAction(
	'[PSXL1] START_REMOVE_SHOPPING_LIST',
	props<ListIdProps>()
);

export const endRemoveShoppingList = createAction(
	'[PSXL1] END_REMOVE_SHOPPING_LIST',
	props<GeneralReturnProps>()
);

export const startToggleListMode = createAction(
	'[PSXL1] START_CHANGE_LIST_MODE',
	props<UpdateShoppingListProps>()
);
export const endToggleListMode = createAction(
	'[PSXL1] END_CHANGE_LIST_MODE',
	props<GeneralReturnProps>()
);

export const startSetNewCurrentList = createAction(
	'[PSXL1] START_SET_NEW_CURRENT_LIST',
	props<ListIdProps>()
);

export const endSetNewCurrentList = createAction(
	'[PSXL1] END_SET_NEW_CURRENT_LIST',
	props<ListIdProps>()
);

export const raiseGeneralError = createAction(
	'[PSXL1] RAISE_GENERAL_ERROR',
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

	startSyncListItemAndLibItem,
	endSyncListItemAndLibItem,

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

	startUpdateSettings,
	endUpdateSettings,

	startAddShoppingList,
	endAddShoppingList,

	startChangeListMode: startToggleListMode,
	endChangeListMode: endToggleListMode,

	startSetNewCurrentList,
	endSetNewCurrentList,

	raiseGeneralError,
});

export type ActionsUnion = typeof actions;
