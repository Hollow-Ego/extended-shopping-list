import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { Storage } from '@ionic/storage';
import { cloneDeep } from 'lodash';

import { PopulatedItem } from '../shared/interfaces/populated-item.interface';
import { AlertController } from '@ionic/angular';
import { TranslationService } from './translation.service';

import { BehaviorSubject } from 'rxjs';
import { ShoppingListState } from '../shared/interfaces/service.interface';
import { StorageKey } from '../shared/enums/storage-key.enum';
import { createOrCopyID } from '../shared/utilities/utils';
import { DEFAULT_SHOPPING_LIST_NAME } from '../shared/defaults/list-name.default';
import { UpdateListData } from '../shared/interfaces/update-list-data.interface';
import { TagService } from './tag.service';
import { NameIdObject } from '../shared/interfaces/name-id-object.interface';
import { ShoppingList } from './../shared/classes/shopping-list.class';

@Injectable({
	providedIn: 'root',
})
export class ShoppingListService {
	private currentStateVersion = '2.0';

	private defaultState: ShoppingListState = {
		shoppingLists: new Map<string, ShoppingList>(),
		activeList: '',
		stateVersion: this.currentStateVersion,
	};
	private listState: ShoppingListState = cloneDeep(this.defaultState);

	shoppingListChanges: BehaviorSubject<ShoppingListState> =
		new BehaviorSubject<ShoppingListState>(this.listState);
	defaultCompatibleState: any = { shoppingLists: new Map(), activeList: '' };

	constructor(
		private storage: Storage,
		private alertController: AlertController,
		private translate: TranslationService,
		private tagService: TagService
	) {
		this.initializeService();
	}

	async initializeService() {
		const loadedListState = await this.storage.get(StorageKey.ShoppingList);
		const oldState = await this.storage.get(StorageKey.ShoppingListOld);
		const compatibleState = await this.ensureCompatibility(
			loadedListState,
			oldState
		);
		const updatedListMap = cloneDeep(this.listState.shoppingLists);

		let updatedActiveList = '';
		if (compatibleState.shoppingLists.size > 0) {
			compatibleState.shoppingLists.forEach((rawList: any) => {
				const list = new ShoppingList(
					rawList.shoppingItems,
					rawList.name,
					rawList.id,
					rawList.mode,
					rawList.sortMode,
					rawList.sortDirection
				);
				updatedListMap.set(list.id, list);
			});
			if (updatedListMap.has(compatibleState.activeList)) {
				updatedActiveList = compatibleState.activeList;
			}
		}

		this.listState = {
			...this.listState,
			shoppingLists: updatedListMap,
			activeList: updatedActiveList,
			stateVersion: this.currentStateVersion,
		};
		this.shoppingListChanges.next(this.listState);
	}

	private async ensureCompatibility(
		loadedListState: any,
		oldState: any
	): Promise<ShoppingListState> {
		if (loadedListState) {
			return loadedListState;
		}

		if (!oldState) {
			return cloneDeep(this.defaultState);
		}

		let compatibleState: any;
		switch (oldState.stateVersion) {
			case undefined:
			case null:
				compatibleState = this.convertUndefinedState(oldState);
				return await this.ensureCompatibility(null, compatibleState);
			case '1.0':
				compatibleState = cloneDeep(this.defaultState);
				for (let shoppingList of oldState.shoppingLists.values()) {
					const compatibleList = cloneDeep(shoppingList);
					compatibleList.shoppingItems = new Map();
					for (let item of shoppingList.shoppingItems.values()) {
						const compatibleTags: NameIdObject[] = [];
						const compatibleItem = cloneDeep(item);
						item.tags.forEach((tag: any) => {
							let foundTag = this.tagService.findTagByName(tag);
							if (!foundTag) {
								foundTag = this.tagService.addTag(tag);
							}
							compatibleTags.push(foundTag!);
						});
						compatibleItem.tags = compatibleTags;
						compatibleList.shoppingItems.set(
							compatibleItem.itemId,
							compatibleItem
						);
					}
					compatibleState.shoppingLists.set(compatibleList.id, compatibleList);
				}
				console.log(compatibleState);

				this.storage.set(StorageKey.ShoppingList, compatibleState);
				return compatibleState;
			default:
				this.storage.set(StorageKey.ShoppingList, oldState);
				return oldState;
		}
	}

	convertUndefinedState(oldState: any) {
		const compatibleState = cloneDeep(this.defaultCompatibleState);
		if (oldState.constructor === Map) {
			compatibleState.shoppingLists = oldState;
		}
		return compatibleState;
	}

	addListItem(
		item: PopulatedItem,
		amount: number,
		listId: string | null = null
	) {
		const updatedListMap = cloneDeep(this.listState.shoppingLists);
		const itemId: string = createOrCopyID(item.id);
		const newItem = { ...item, amount, itemId };
		if (!listId) {
			listId = this.listState.activeList;
		}
		let activeList: ShoppingList | undefined = updatedListMap.get(listId);

		if (!activeList) {
			activeList = new ShoppingList(
				new Map(),
				DEFAULT_SHOPPING_LIST_NAME,
				uuidv4()
			);

			updatedListMap.set(activeList.id, activeList);
		}

		const activeListCopy: ShoppingList = cloneDeep(activeList);

		activeListCopy.addItem(newItem);
		updatedListMap.set(activeListCopy.id, activeListCopy);
		this.listState = {
			...this.listState,
			shoppingLists: updatedListMap,
			activeList: activeListCopy.id,
		};
		this.updateState();
	}

	updateListItem(item: PopulatedItem, listId: string | null = null) {
		const updatedListMap = cloneDeep(this.listState.shoppingLists);
		if (!listId) {
			listId = this.listState.activeList;
		}
		const activeList: ShoppingList | undefined = updatedListMap.get(listId);
		const activeListCopy: ShoppingList | undefined = cloneDeep(activeList);
		if (!activeListCopy) return;
		activeListCopy.updateItem(item);
		updatedListMap.set(activeListCopy.id, activeListCopy);

		this.listState = {
			...this.listState,
			shoppingLists: updatedListMap,
		};
		this.updateState();
	}

	removeListItem(itemId: string, listId: string | null = null) {
		const updatedListMap = cloneDeep(this.listState.shoppingLists);
		if (!listId) {
			listId = this.listState.activeList;
		}
		const activeList: ShoppingList | undefined = updatedListMap.get(listId);
		const activeListCopy: ShoppingList | undefined = cloneDeep(activeList);
		if (!activeListCopy) return;
		activeListCopy.removeItem(itemId);
		updatedListMap.set(activeListCopy.id, activeListCopy);

		this.listState = {
			...this.listState,
			shoppingLists: updatedListMap,
		};
		this.updateState();
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
		this.updateState();
	}

	updateShoppingList(
		updatedData: UpdateListData,
		listId: string | null = null
	) {
		const updatedListMap = cloneDeep(this.listState.shoppingLists);
		if (!listId) {
			listId = this.listState.activeList;
		}

		const originalList = updatedListMap.get(listId);
		const updatedShoppingList: ShoppingList | undefined =
			cloneDeep(originalList);
		const { sortMode: oSortMode, sortDirection: oSortDirection } =
			originalList!.getSortDetails();
		let {
			listName = originalList!.name,
			sortMode = oSortMode,
			sortDirection = oSortDirection,
		} = updatedData;
		updatedShoppingList!.updateName(listName);
		updatedShoppingList!.setSortDetails(+sortMode, +sortDirection);
		updatedListMap.set(originalList!.id, updatedShoppingList!);

		this.listState = {
			...this.listState,
			shoppingLists: updatedListMap,
		};
		this.updateState();
	}

	removeShoppingList(listId: string) {
		const updatedListMap = cloneDeep(this.listState.shoppingLists);

		updatedListMap.delete(listId);

		this.listState = {
			...this.listState,
			shoppingLists: updatedListMap,
			activeList: updatedListMap.keys().next().value,
		};
		this.updateState();
	}

	toggleListMode(listId: string) {
		const updatedListMap = cloneDeep(this.listState.shoppingLists);
		if (!listId) {
			listId = this.listState.activeList;
		}
		const updatedShoppingList: ShoppingList | undefined =
			updatedListMap.get(listId);
		updatedShoppingList!.toggleMode();

		this.listState = {
			...this.listState,
			shoppingLists: updatedListMap,
		};
		this.updateState();
	}

	setActiveList(newActiveListId: any) {
		this.listState = {
			...this.listState,
			activeList: newActiveListId,
		};
		this.updateState();
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

	async renameList(prevName: string = '', listId: string | null = null) {
		const { data, role } = await this.showNamingModal();
		if (role === 'cancel' || !data) return null;

		let newName = data.values.listName;
		const needDefaultName = newName.trim().length <= 0;
		if (!listId) {
			listId = this.listState.activeList;
		}

		if (needDefaultName) {
			newName = DEFAULT_SHOPPING_LIST_NAME;
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

	async updateState() {
		await this.storage.set(StorageKey.ShoppingList, this.listState);
		this.shoppingListChanges.next(this.listState);
	}
}
