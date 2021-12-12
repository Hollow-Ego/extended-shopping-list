import { ItemLibrary } from '../classes/item-library.class';
import { ShoppingList } from '../classes/shopping-list.class';

export interface ShoppingListState {
	shoppingLists: Map<string, ShoppingList>;
	activeList: string;
	stateVersion: string;
}

export interface LibraryState {
	itemLibrary: ItemLibrary;
	tagLibrary: string[];
	unitLibrary: string[];
	stateVersion: string;
}

export interface SettingsState {
	language: string;
	theme: string;
	defaultCurrency: string;
	stateVersion: string;
}
