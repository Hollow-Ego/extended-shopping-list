import { ItemLibrary } from '../classes/item-library.class';
import { ShoppingList } from '../classes/shopping-list.class';
import { NameIdObject } from './name-id-object.interface';

export interface ShoppingListState {
	shoppingLists: Map<string, ShoppingList>;
	activeList: string;
	stateVersion: string;
}

export interface LibraryState {
	itemLibrary: ItemLibrary;
	stateVersion: string;
}

export interface SettingsState {
	language: string;
	theme: string;
	defaultCurrency: string;
	stateVersion: string;
}
