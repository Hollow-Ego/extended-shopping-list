import { ItemGroup } from '../classes/item-group.class';
import { ItemLibrary } from '../classes/item-library.class';
import { ShoppingList } from '../classes/shopping-list.class';
import { SettingsData } from './settings.model';

export interface State {
	isLoading: boolean;
	currentListId: string;
	itemLibrary: ItemLibrary;
	itemGroups: Map<string, ItemGroup>;
	shoppingLists: Map<string, ShoppingList>;
	settings: SettingsData;
	errors: string[];
}
