import { Injectable } from '@angular/core';
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
	ListItemProps,
	ItemGroupProps,
	AddShoppingListProps,
	UpdateShoppingListProps,
	ListIdProps,
} from '../shared/models/action-props.model';

import { PopulatedItem } from '../shared/models/populated-item.model';
import { AlertController } from '@ionic/angular';
import { TranslationService } from '../shared/i18n/translation.service';

@Injectable({
	providedIn: 'root',
})
export class ShoppingListService {
	constructor(
		private storage: Storage,
		private imageService: ImageService,
		private alertController: AlertController,
		private translate: TranslationService
	) {}

	addLibraryItem(data: LibraryItemProps, itemLibrary: ItemLibrary) {
		try {
			const newLibrary: ItemLibrary = this.cloneItemLibrary(itemLibrary);
			const newID: string = this.createCopyID(data.itemID);
			const newItem: LibraryItem = { ...data, itemID: newID };
			newLibrary.add(newID, newItem);
			return this.storage.set(Constants.LIBRARY_KEY, newLibrary);
		} catch (error) {
			throw Error(error);
		}
	}
	createCopyID(itemID: string): string {
		return itemID ? itemID : uuidv4();
	}

	updateLibraryItem(item: LibraryItemProps, itemLibrary: ItemLibrary) {
		try {
			const newLibrary: ItemLibrary = this.cloneItemLibrary(itemLibrary);
			const updatedItem: LibraryItem = { ...item };
			newLibrary.update(item.itemID, updatedItem);
			return this.storage.set(Constants.LIBRARY_KEY, newLibrary);
		} catch (error) {
			throw Error(error);
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
			return this.storage.set(Constants.LIBRARY_KEY, newLibrary);
		} catch (error) {
			throw Error(error);
		}
	}

	async syncListAndLibrary(
		data: LibraryItemProps,
		shoppingLists: Map<string, ShoppingList>,
		itemLibrary: ItemLibrary
	) {
		try {
			const newID: string = this.createCopyID(data.itemID);
			const newItem: LibraryItem = { ...data, itemID: newID };
			const modifiedProps: LibraryItemProps = { ...data, itemID: newID };
			const newListItem: ListItemProps = {
				item: newItem,
				listId: data?.addToListId,
			};

			const newLibrary = await this.addLibraryItem(modifiedProps, itemLibrary);
			const newLists = await this.addListItem(newListItem, shoppingLists);
			return { shoppingLists: newLists, itemLibrary: newLibrary };
		} catch (error) {
			throw Error(error);
		}
	}

	addListItem(data: ListItemProps, shoppingLists: Map<string, ShoppingList>) {
		try {
			const { item, amount, listId } = data;
			const newShoppingLists: Map<string, ShoppingList> = new Map(
				shoppingLists
			);
			const itemID: string = this.createCopyID(item.itemID);
			const newItem = { ...item, amount, itemID };
			let activeList: ShoppingList = newShoppingLists.get(listId);

			if (!activeList) {
				console.log('NO list found');

				activeList = new ShoppingList(
					new Map(),
					Constants.DEFAULT_SHOPPING_LIST_NAME,
					uuidv4()
				);

				newShoppingLists.set(activeList.getListID(), activeList);
			}

			const newActiveList: ShoppingList = this.cloneShoppingList(activeList);
			newActiveList.add(newItem);
			newShoppingLists.set(newActiveList.getListID(), newActiveList);

			return this.storage.set(Constants.SHOPPING_LIST_KEY, newShoppingLists);
		} catch (error) {
			throw Error(error);
		}
	}

	updateListItem(
		item: PopulatedItem,
		listId: string,
		shoppingLists: Map<string, ShoppingList>
	) {
		try {
			const activeList: ShoppingList = shoppingLists.get(listId);
			const newShoppingLists: Map<string, ShoppingList> = new Map(
				shoppingLists
			);
			const newActiveList: ShoppingList = this.cloneShoppingList(activeList);
			newActiveList.update(item);

			newShoppingLists.set(newActiveList.getListID(), newActiveList);
			return this.storage.set(Constants.SHOPPING_LIST_KEY, newShoppingLists);
		} catch (error) {
			throw Error(error);
		}
	}

	removeListItem(
		itemID: string,
		listId: string,
		shoppingLists: Map<string, ShoppingList>
	) {
		try {
			const activeList: ShoppingList = shoppingLists.get(listId);
			const newShoppingLists: Map<string, ShoppingList> = new Map(
				shoppingLists
			);
			const newActiveList: ShoppingList = this.cloneShoppingList(activeList);
			newActiveList.remove(itemID);
			newShoppingLists.set(newActiveList.getListID(), newActiveList);

			return this.storage.set(Constants.SHOPPING_LIST_KEY, newShoppingLists);
		} catch (error) {
			throw Error(error);
		}
	}

	addToItemGroup(data: ItemGroupProps, itemGroups: Map<string, ItemGroup>) {
		try {
			const newItemGroup: Map<string, ItemGroup> = new Map(itemGroups);
			const { itemID, groupId: groupIdx } = data;
			let activeGroup = newItemGroup[groupIdx];
			activeGroup.add(itemID);
			return this.storage.set(Constants.ITEM_GROUP_KEY, newItemGroup);
		} catch (error) {
			throw Error(error);
		}
	}

	removeFromItemGroup(
		data: ItemGroupProps,
		itemGroups: Map<string, ItemGroup>
	) {
		try {
			const newItemGroup: Map<string, ItemGroup> = new Map(itemGroups);
			const { itemID, groupId: groupIdx } = data;
			let activeGroup = newItemGroup[groupIdx];
			activeGroup.remove(itemID);
			return this.storage.set(Constants.ITEM_GROUP_KEY, newItemGroup);
		} catch (error) {
			throw Error(error);
		}
	}

	addShoppingList(
		data: AddShoppingListProps,
		shoppingLists: Map<string, ShoppingList>
	) {
		try {
			const newShoppingLists: Map<string, ShoppingList> = new Map(
				shoppingLists
			);
			const newListId = uuidv4();
			const listName: string = data.name;
			const newShoppingList: ShoppingList = new ShoppingList(
				new Map(),
				listName,
				newListId
			);
			newShoppingLists.set(newListId, newShoppingList);
			return this.storage
				.set(Constants.SHOPPING_LIST_KEY, newShoppingLists)
				.then(shoppingLists => {
					return Promise.resolve({
						shoppingLists,
						newListId: newShoppingList.getListID(),
					});
				});
		} catch (error) {
			throw Error(error);
		}
	}

	updateShoppingList(
		data: UpdateShoppingListProps,
		shoppingLists: Map<string, ShoppingList>
	) {
		try {
			const newShoppingLists: Map<string, ShoppingList> = new Map(
				shoppingLists
			);
			const originalList = newShoppingLists.get(data.listId);
			const listName: string = data.name;
			const newShoppingList: ShoppingList =
				this.cloneShoppingList(originalList);
			newShoppingList.updateName(listName);
			newShoppingLists.set(originalList.getListID(), newShoppingList);
			return this.storage.set(Constants.SHOPPING_LIST_KEY, newShoppingLists);
		} catch (error) {
			throw Error(error);
		}
	}

	removeShoppingList(
		data: ListIdProps,
		shoppingLists: Map<string, ShoppingList>
	) {
		try {
			const newShoppingLists: Map<string, ShoppingList> = new Map(
				shoppingLists
			);
			newShoppingLists.delete(data.listId);
			return this.storage
				.set(Constants.SHOPPING_LIST_KEY, newShoppingLists)
				.then(shoppingLists => {
					return Promise.resolve({
						shoppingLists,
						newListId: shoppingLists.entries().next().value,
					});
				});
		} catch (error) {
			throw Error(error);
		}
	}

	toggleListMode(
		data: UpdateShoppingListProps,
		shoppingLists: Map<string, ShoppingList>
	) {
		try {
			const originalList = shoppingLists.get(data.listId);
			const newShoppingLists: Map<string, ShoppingList> = new Map(
				shoppingLists
			);
			const newShoppingList: ShoppingList =
				this.cloneShoppingList(originalList);
			newShoppingList.toggleMode();
			newShoppingLists.set(originalList.getListID(), newShoppingList);
			return this.storage.set(Constants.SHOPPING_LIST_KEY, newShoppingLists);
		} catch (error) {
			throw Error(error);
		}
	}

	updateStateDetails(data: ListIdProps) {
		//  To-Do: Implement saving of additional state state

		return Promise.resolve(data.listId);
	}

	cloneItemLibrary(sourceLib: ItemLibrary) {
		const newItemMap = new Map(sourceLib.getAllItems());
		const newLibrary: ItemLibrary = new ItemLibrary(newItemMap);
		return newLibrary;
	}

	cloneShoppingList(sourceList: ShoppingList) {
		const newItemMap = new Map(sourceList.getAllItems());
		return new ShoppingList(
			newItemMap,
			sourceList.getName(),
			sourceList.getListID(),
			sourceList.getMode()
		);
	}

	async createShoppingListNameAlert(prevName: string) {
		const translations = await this.translate
			.getTranslations([
				'shoppingList.nameInputPlaceholder',
				'shoppingList.newListNameHeader',
				'common.cancelText',
				'common.confirmText',
				prevName,
			])
			.toPromise();

		const nameInputText = translations['shoppingList.nameInputPlaceholder'];
		const headerText = translations['shoppingList.newListNameHeader'];
		const cancelText = translations['common.cancelText'];
		const confirmText = translations['common.confirmText'];
		const translatedPrevName = translations[prevName];

		const alert = await this.alertController.create({
			header: headerText,
			inputs: [
				{
					name: 'listName',
					type: 'text',
					placeholder: nameInputText,
					value: translatedPrevName,
				},
			],
			buttons: [
				{
					text: cancelText,
					role: 'cancel',
					cssClass: 'secondary',
				},
				{
					text: confirmText,
				},
			],
		});
		return alert;
	}

	async getNewListName(prevName: string = '') {
		const alert = await this.createShoppingListNameAlert(prevName);
		alert.present();
		const { data, role } = await alert.onDidDismiss();
		if (role === 'cancel' || !data) return null;

		const newName = data.values.listName;
		const needDefaultName = newName.trim().length <= 0;

		return needDefaultName ? Constants.DEFAULT_SHOPPING_LIST_NAME : newName;
	}

	async confirmRemoval() {
		const translations = await this.translate
			.getTranslations([
				'shoppingList.confirmRemovalQuestion',
				'shoppingList.removalHeader',
				'common.cancelText',
				'common.confirmText',
			])
			.toPromise();

		const confirmQuestion = translations['shoppingList.confirmRemovalQuestion'];
		const headerText = translations['shoppingList.removalHeader'];
		const cancelText = translations['common.cancelText'];
		const confirmText = translations['common.confirmText'];

		const alert = await this.alertController.create({
			header: headerText,
			message: confirmQuestion,
			buttons: [
				{
					text: cancelText,
					role: 'cancel',
					cssClass: 'secondary',
				},
				{
					text: confirmText,
					role: 'confirm',
				},
			],
		});

		await alert.present();
		const { role } = await alert.onDidDismiss();
		return role === 'confirm';
	}
}
