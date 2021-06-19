import { ItemGroup } from '../classes/item-group.class';
import { ItemLibrary } from '../classes/item-library.class';

import { ShoppingList } from '../classes/shopping-list.class';
import { Image } from './image.model';

import { singleCurrencyData } from './currency-data.model';
import { PopulatedItem } from './populated-item.model';
import { SettingsData as SettingsData } from './settings.model';

export interface GeneralActionProps {
	mode?: string;
	itemLibrary?: ItemLibrary;
	itemGroups?: Map<string, ItemGroup>;
	shoppingLists?: Map<string, ShoppingList>;
	settings?: SettingsData;
	currentListId?: string;
}

export interface GeneralReturnProps {
	mode?: Symbol;
	itemLibrary?: ItemLibrary;
	itemGroups?: Map<string, ItemGroup>;
	shoppingLists?: Map<string, ShoppingList>;
	newListId?: string;
	errors?: string[];
}

export interface LibraryItemProps {
	itemID: string;
	name: string;
	amount: number;
	imgData: Image;
	tags: string[];
	unit: string;
	price: number;
	currency: singleCurrencyData;
	addToListId?: string;
}

export interface ListItemProps {
	item: PopulatedItem;
	amount?: number;
	listId: string;
	itemLibrary?: ItemLibrary;
}

export interface UpdateListItemProps {
	item: PopulatedItem;
	listId: string;
}

export interface RemoveListItemProps {
	itemID: string;
	listId: string;
}

export interface LoadShoppingListProps {
	listIdx: number;
	fullReload?: boolean;
}

export interface ShoppingListReturnProps {
	list: ShoppingList;
}

export interface ItemGroupProps {
	itemID: string;
	groupId: string;
}

export interface AddShoppingListProps {
	name: string;
}
export interface UpdateShoppingListProps {
	name?: string;
	listId: string;
}

export interface RemoveItemShortProps {
	itemID: string;
}

export interface ListIdProps {
	listId: string;
}
