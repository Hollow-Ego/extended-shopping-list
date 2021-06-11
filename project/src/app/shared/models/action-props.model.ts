import { ItemGroup } from '../classes/item-group.class';
import { ItemLibrary } from '../classes/item-library.class';

import { ShoppingList } from '../classes/shopping-list.class';
import { Image } from './image.model';

import { singleCurrencyData } from './currency-data.model';
import { PopulatedItem } from './populated-item.model';

export interface GeneralActionProps {
	mode: string;
	itemLibrary?: ItemLibrary;
	itemGroups?: ItemGroup[];
	shoppingLists?: ShoppingList[];
}

export interface GeneralReturnProps {
	mode?: Symbol;
	itemLibrary?: ItemLibrary;
	itemGroups?: ItemGroup[];
	shoppingLists?: ShoppingList[];
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
	addToListIdx?: number;
}

export interface AddListItemProps {
	item: PopulatedItem;
	amount?: number;
	listIdx: number;
	itemLibrary?: ItemLibrary;
}

export interface UpdateListItemProps {
	item: PopulatedItem;
	listIdx: number;
}

export interface RemoveListItemProps {
	itemID: string;
	listIdx: number;
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
	groupIdx: number;
}

export interface AddItemShortProps {
	itemID: string;
}

export interface RemoveItemShortProps {
	itemID: string;
}
