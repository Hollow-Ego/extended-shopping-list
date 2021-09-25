import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { Storage } from '@ionic/storage';
import { cloneDeep } from 'lodash';
import { ShoppingList } from '../shared/classes/shopping-list.class';
import * as Constants from '../shared/constants';

import { PopulatedItem } from '../shared/models/populated-item.model';
import { AlertController } from '@ionic/angular';
import { TranslationService } from '../shared/i18n/translation.service';
import { createOrCopyID } from '../shared/utils';
import { BehaviorSubject } from 'rxjs';
import { ShoppingListServiceState } from './../shared/models/service-models';

@Injectable({
	providedIn: 'root',
})
export class ShoppingListService {
	private currentStateVersion = '1.0';
	private defaultState: ShoppingListServiceState = {
		shoppingLists: new Map<string, ShoppingList>(),
		activeList: '',
		stateVersion: this.currentStateVersion,
	};
	private listState: ShoppingListServiceState = cloneDeep(this.defaultState);

	shoppingListChanges: BehaviorSubject<ShoppingListServiceState> =
		new BehaviorSubject<ShoppingListServiceState>(this.listState);

	constructor(
		private storage: Storage,
		private alertController: AlertController,
		private translate: TranslationService
	) {
		this.initializeService();
	}

	async initializeService() {
		const loadedListState = await this.storage.get(Constants.SHOPPING_LIST_KEY);
		const compatibleState = this.ensureCompatibility(loadedListState);
		const updatedListMap = cloneDeep(this.listState.shoppingLists);

		compatibleState.shoppingLists.forEach(rawList => {
			const list = new ShoppingList(
				rawList.shoppingItems,
				rawList.name,
				rawList.id,
				rawList.mode,
				rawList.sortMode,
				rawList.sortDirection
			);
			updatedListMap.set(list.getListID(), list);
		});

		let updatedActiveList = compatibleState.activeList;

		this.listState = {
			...this.listState,
			shoppingLists: updatedListMap,
			activeList: updatedActiveList,
			stateVersion: this.currentStateVersion,
		};
		this.shoppingListChanges.next(this.listState);
	}

	ensureCompatibility(loadedListState: any) {
		switch (loadedListState.stateVersion) {
			case undefined:
			case null:
				const compatibleState = this.convertUndefinedState(loadedListState);
				return compatibleState;
			default:
				return loadedListState;
		}
	}

	convertUndefinedState(oldState: any) {
		const compatibleState = { shoppingLists: new Map(), activeList: '' };
		if (oldState.constructor === Map) {
			compatibleState.shoppingLists = oldState;
		}
		return compatibleState;
	}

	async addListItem(
		item: PopulatedItem,
		amount: number,
		listId: string = null
	) {
		const updatedListMap = cloneDeep(this.listState.shoppingLists);
		const itemId: string = createOrCopyID(item.itemId);
		const newItem = { ...item, amount, itemId };
		if (!listId) {
			listId = this.listState.activeList;
		}
		let activeList: ShoppingList = updatedListMap.get(listId);

		if (!activeList) {
			activeList = new ShoppingList(
				new Map(),
				Constants.DEFAULT_SHOPPING_LIST_NAME,
				uuidv4()
			);

			updatedListMap.set(activeList.getListID(), activeList);
		}

		const activeListCopy: ShoppingList = cloneDeep(activeList);

		activeListCopy.add(newItem);
		updatedListMap.set(activeListCopy.getListID(), activeListCopy);
		this.listState = {
			...this.listState,
			shoppingLists: updatedListMap,
			activeList: activeListCopy.getListID(),
		};
		await this.storage.set(Constants.SHOPPING_LIST_KEY, this.listState);
		this.shoppingListChanges.next(this.listState);
	}

	async updateListItem(item: PopulatedItem, listId: string = null) {
		const updatedListMap = cloneDeep(this.listState.shoppingLists);
		if (!listId) {
			listId = this.listState.activeList;
		}
		const activeList: ShoppingList = updatedListMap.get(listId);
		const activeListCopy: ShoppingList = cloneDeep(activeList);

		activeListCopy.update(item);
		updatedListMap.set(activeListCopy.getListID(), activeListCopy);

		this.listState = {
			...this.listState,
			shoppingLists: updatedListMap,
		};
		await this.storage.set(Constants.SHOPPING_LIST_KEY, this.listState);
		this.shoppingListChanges.next(this.listState);
	}

	async removeListItem(itemId: string, listId: string = null) {
		const updatedListMap = cloneDeep(this.listState.shoppingLists);
		if (!listId) {
			listId = this.listState.activeList;
		}
		const activeList: ShoppingList = updatedListMap.get(listId);
		const activeListCopy: ShoppingList = cloneDeep(activeList);
		activeListCopy.remove(itemId);
		updatedListMap.set(activeListCopy.getListID(), activeListCopy);

		this.listState = {
			...this.listState,
			shoppingLists: updatedListMap,
		};
		await this.storage.set(Constants.SHOPPING_LIST_KEY, this.listState);
		this.shoppingListChanges.next(this.listState);
	}

	async addShoppingList() {
		const { data, role } = await this.showNamingModal();
		if (role === 'cancel' || !data) return null;

		let listName = data.values.listName;
		const updatedListMap = cloneDeep(this.listState.shoppingLists);

		const newListId = uuidv4();
		const newShoppingList: ShoppingList = new ShoppingList(
			new Map(),
			listName,
			newListId
		);
		updatedListMap.set(newListId, newShoppingList);

		this.listState = {
			...this.listState,
			shoppingLists: updatedListMap,
			activeList: newListId,
		};
		await this.storage.set(Constants.SHOPPING_LIST_KEY, this.listState);
		this.shoppingListChanges.next(this.listState);
	}

	async updateShoppingList(
		updatedData: {
			listName?: string;
			sortDirection?: string;
			sortMode?: string;
		},
		listId: string = null
	) {
		const updatedListMap = cloneDeep(this.listState.shoppingLists);
		if (!listId) {
			listId = this.listState.activeList;
		}

		const originalList = updatedListMap.get(listId);
		const updatedShoppingList: ShoppingList = cloneDeep(originalList);
		const { sortMode: oSortMode, sortDirection: oSortDirection } =
			originalList.getSortDetails();
		let {
			listName = originalList.getName(),
			sortMode = oSortMode,
			sortDirection = oSortDirection,
		} = updatedData;
		updatedShoppingList.updateName(listName);
		updatedShoppingList.setSortDetails(sortMode, sortDirection);
		updatedListMap.set(originalList.getListID(), updatedShoppingList);

		this.listState = {
			...this.listState,
			shoppingLists: updatedListMap,
		};
		await this.storage.set(Constants.SHOPPING_LIST_KEY, this.listState);
		this.shoppingListChanges.next(this.listState);
	}

	async removeShoppingList(listId: string = null) {
		const updatedListMap = cloneDeep(this.listState.shoppingLists);

		updatedListMap.delete(listId);

		this.listState = {
			...this.listState,
			shoppingLists: updatedListMap,
			activeList: updatedListMap.keys().next().value,
		};
		await this.storage.set(Constants.SHOPPING_LIST_KEY, this.listState);
		this.shoppingListChanges.next(this.listState);
	}

	async toggleListMode(listId: string = null) {
		const updatedListMap = cloneDeep(this.listState.shoppingLists);
		if (!listId) {
			listId = this.listState.activeList;
		}
		const originalList = updatedListMap.get(listId);
		const updatedShoppingList: ShoppingList = cloneDeep(originalList);

		updatedShoppingList.toggleMode();

		this.listState = {
			...this.listState,
			shoppingLists: updatedListMap,
		};
		await this.storage.set(Constants.SHOPPING_LIST_KEY, this.listState);
		this.shoppingListChanges.next(this.listState);
	}

	async setActiveList(newActiveListId) {
		this.listState = {
			...this.listState,
			activeList: newActiveListId,
		};
		await this.storage.set(Constants.SHOPPING_LIST_KEY, this.listState);
		this.shoppingListChanges.next(this.listState);
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

	async renameList(prevName: string = '', listId: string = null) {
		const { data, role } = await this.showNamingModal();
		if (role === 'cancel' || !data) return null;

		let newName = data.values.listName;
		const needDefaultName = newName.trim().length <= 0;
		if (!listId) {
			listId = this.listState.activeList;
		}

		if (needDefaultName) {
			newName = Constants.DEFAULT_SHOPPING_LIST_NAME;
		}
		this.updateShoppingList({ listName: newName }, listId);
	}

	async showNamingModal(prevName: string = '') {
		const alert = await this.createShoppingListNameAlert(prevName);
		alert.present();
		const { data, role } = await alert.onDidDismiss();
		return { data, role };
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
