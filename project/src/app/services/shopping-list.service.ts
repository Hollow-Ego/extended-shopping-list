import { Injectable } from '@angular/core';
import { from, throwError } from 'rxjs';
import { LibraryItem } from '../shared/models/library-item.model';
import { v4 as uuidv4 } from 'uuid';
import { Storage } from '@ionic/storage';
import { ImageService } from './image.service';
import { ItemLibrary } from '../shared/classes/item-library.class';
import { ShoppingList } from '../shared/classes/shopping-list.class';
import { ItemGroup } from '../shared/classes/item-group.class';
import * as Constants from '../shared/constants';
import {
	LibraryItemProps,
	AddListItemProps,
	ItemGroupProps,
} from '../shared/models/action-props.model';

import { PopulatedItem } from '../shared/models/populated-item.model';

@Injectable({
	providedIn: 'root',
})
export class ShoppingListService {
	constructor(private storage: Storage, private imageService: ImageService) {}

	addLibraryItem(data: LibraryItemProps, itemLibrary: ItemLibrary) {
		try {
			const newLibrary: ItemLibrary = this.cloneItemLibrary(itemLibrary);
			const { name, imgData, tags } = data;

			const newID: string = uuidv4();
			const newItem: LibraryItem = { ...data, itemID: newID };
			newLibrary.add(newID, newItem);
			return from(this.storage.set(Constants.LIBRARY_KEY, newLibrary));
		} catch (error) {
			return throwError(error);
		}
	}

	updateLibraryItem(item: LibraryItemProps, itemLibrary: ItemLibrary) {
		try {
			const newLibrary: ItemLibrary = this.cloneItemLibrary(itemLibrary);
			const updatedItem: LibraryItem = { ...item };
			newLibrary.update(item.itemID, updatedItem);
			return from(this.storage.set(Constants.LIBRARY_KEY, newLibrary));
		} catch (error) {
			return throwError(error);
		}
	}

	removeLibraryItem(itemID: string, itemLibrary: ItemLibrary) {
		try {
			const newLibrary: ItemLibrary = this.cloneItemLibrary(itemLibrary);
			const deprecatedItem = newLibrary.get(itemID);
			const associatedImg = deprecatedItem.imgData;

			if (associatedImg) {
				this.imageService.deleteImage(associatedImg.fileName);
			}
			newLibrary.remove(itemID);
			return from(this.storage.set(Constants.LIBRARY_KEY, newLibrary));
		} catch (error) {
			return throwError(error);
		}
	}

	addListItem(data: AddListItemProps, shoppingLists: ShoppingList[]) {
		try {
			const { item, amount, listIdx } = data;
			const newShoppingLists: ShoppingList[] = [...shoppingLists];
			const itemID: string = item.itemID ? item.itemID : uuidv4();
			const newItem = { ...item, amount, itemID };
			let activeList: ShoppingList = newShoppingLists[listIdx];

			if (!activeList) {
				activeList = new ShoppingList(
					new Map(),
					Constants.DEFAULT_SHOPPING_LIST_NAME
				);
				const newIdx = shoppingLists.length;
				newShoppingLists[newIdx] = activeList;
			}

			const newActiveList: ShoppingList = new ShoppingList(
				activeList.getAllItems(),
				activeList.getName()
			);
			newActiveList.add(newItem);
			newShoppingLists[listIdx] = newActiveList;

			return from(
				this.storage.set(Constants.SHOPPING_LIST_KEY, newShoppingLists)
			);
		} catch (error) {
			return throwError(error);
		}
	}

	updateListItem(
		item: PopulatedItem,
		listIdx: number,
		shoppingLists: ShoppingList[]
	) {
		try {
			const activeList: ShoppingList = shoppingLists[listIdx];
			const newShoppingLists: ShoppingList[] = [...shoppingLists];
			const newActiveList: ShoppingList = new ShoppingList(
				activeList.getAllItems(),
				activeList.getName()
			);
			newActiveList.update(item);

			newShoppingLists[listIdx] = newActiveList;
			return from(
				this.storage.set(Constants.SHOPPING_LIST_KEY, newShoppingLists)
			);
		} catch (error) {
			return throwError(error);
		}
	}

	removeListItem(
		itemID: string,
		listIdx: number,
		shoppingLists: ShoppingList[]
	) {
		try {
			const activeList: ShoppingList = shoppingLists[listIdx];
			const newShoppingLists: ShoppingList[] = [...shoppingLists];
			const newActiveList: ShoppingList = new ShoppingList(
				activeList.getAllItems(),
				activeList.getName()
			);
			newActiveList.remove(itemID);
			newShoppingLists[listIdx] = newActiveList;

			return from(
				this.storage.set(Constants.SHOPPING_LIST_KEY, newShoppingLists)
			);
		} catch (error) {
			return throwError(error);
		}
	}

	addToItemGroup(data: ItemGroupProps, itemGroups: ItemGroup[]) {
		try {
			const newItemGroup: ItemGroup[] = [...itemGroups];
			const { itemID, groupIdx } = data;
			let activeGroup = newItemGroup[groupIdx];
			activeGroup.add(itemID);
			return from(this.storage.set(Constants.ITEM_GROUP_KEY, newItemGroup));
		} catch (error) {
			return throwError(error);
		}
	}

	removeFromItemGroup(data: ItemGroupProps, itemGroups: ItemGroup[]) {
		try {
			const newItemGroup: ItemGroup[] = [...itemGroups];
			const { itemID, groupIdx } = data;
			let activeGroup = newItemGroup[groupIdx];
			activeGroup.remove(itemID);
			return from(this.storage.set(Constants.ITEM_GROUP_KEY, newItemGroup));
		} catch (error) {
			return throwError(error);
		}
	}

	cloneItemLibrary(sourceLib: ItemLibrary) {
		const newLibrary: ItemLibrary = new ItemLibrary(new Map());
		Object.assign(newLibrary, sourceLib);
		return newLibrary;
	}
}
