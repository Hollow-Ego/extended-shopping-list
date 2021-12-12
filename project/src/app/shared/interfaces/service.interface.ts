import { ItemLibrary } from '../classes/item-library.class';
import { ShoppingList } from '../classes/shopping-list.class';

export interface ShoppingListServiceState {
	shoppingLists: Map<string, ShoppingList>;
	activeList: string;
	stateVersion: string;
}

export interface LibraryServiceState {
	itemLibrary: ItemLibrary;
	tagLibrary: string[];
	unitLibrary: string[];
	stateVersion: string;
}

export interface SettingsServiceState {
	language: string;
	theme: string;
	defaultCurrency: string;
	stateVersion: string;
}
