import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ItemLibrary } from '../shared/classes/item-library.class';
import { LibraryItem } from '../shared/interfaces/library-item.interface';
import { ImageService } from './image.service';

import { LibraryState } from '../shared/interfaces/service.interface';
import { BehaviorSubject } from 'rxjs';
import { Storage } from '@ionic/storage';
import { StorageKey } from '../shared/enums/storage-key.enum';
import { createOrCopyID } from '../shared/utilities/utils';
import { TagService } from './tag.service';
import { PopulatedItem } from '../shared/interfaces/populated-item.interface';

@Injectable({
	providedIn: 'root',
})
export class LibraryService {
	private currentStateVersion = '2.0';
	private defaultCompatibleState = {
		itemLibrary: { items: new Map(), sortMode: null, sortDirection: null },
	};
	private defaultState: LibraryState = {
		itemLibrary: new ItemLibrary(new Map<string, LibraryItem>()),
		stateVersion: this.currentStateVersion,
	};
	private libraryState: LibraryState = cloneDeep(this.defaultState);

	libraryChanges: BehaviorSubject<LibraryState> =
		new BehaviorSubject<LibraryState>(this.libraryState);

	constructor(
		private storage: Storage,
		private imageService: ImageService,
		private tagService: TagService
	) {
		this.initializeService();
	}

	async initializeService() {
		const loadedLibraryState = await this.storage.get(StorageKey.Library);
		const oldState = await this.storage.get(StorageKey.LibraryOld);
		const compatibleState = await this.ensureCompatibility(
			loadedLibraryState,
			oldState
		);
		const updatedLibrary: ItemLibrary = cloneDeep(
			this.libraryState.itemLibrary
		);

		const compatibleLibrary = compatibleState.itemLibrary;

		updatedLibrary.items = compatibleLibrary.items;
		updatedLibrary.sortDetails = {
			sortMode: compatibleLibrary.sortMode,
			sortDirection: compatibleLibrary.sortDirection,
		};
		this.libraryState = {
			...cloneDeep(this.libraryState),
			itemLibrary: updatedLibrary,
			stateVersion: this.currentStateVersion,
		};

		this.libraryChanges.next(this.libraryState);
	}

	addLibraryItem(item: LibraryItem, itemId: string | null = null): string {
		const updatedLibrary = cloneDeep(this.libraryState.itemLibrary);
		const newId: string = createOrCopyID(itemId);
		const newItem: LibraryItem = { ...item, id: newId };

		updatedLibrary.addItem(newId, newItem);
		this.libraryState = cloneDeep(this.libraryState);
		this.libraryState.itemLibrary = updatedLibrary;
		this.updateState();
		return newId;
	}

	updateLibraryItem(updatedItem: LibraryItem): void {
		const updatedLibrary = cloneDeep(this.libraryState.itemLibrary);

		updatedLibrary.updateItem(updatedItem.id, updatedItem);
		this.libraryState = cloneDeep(this.libraryState);
		this.libraryState.itemLibrary = updatedLibrary;
		this.updateState();
	}

	updateLibraryItemFromShoppingList(updatedItem: PopulatedItem): string {
		const libId = updatedItem.libraryId || '';
		const hasItem = this.libraryState.itemLibrary.has(libId);
		const libItem: LibraryItem = {
			id: libId,
			name: updatedItem.name,
			tags: updatedItem.tags,
			amount: updatedItem.amount,
			currency: updatedItem.currency,
			imgData: updatedItem.imgData,
			price: updatedItem.price,
			unit: updatedItem.unit,
		};
		if (!hasItem) {
			return this.addLibraryItem(libItem);
		}

		const updatedLibrary = cloneDeep(this.libraryState.itemLibrary);
		updatedLibrary.updateItem(libId, libItem);
		this.libraryState = cloneDeep(this.libraryState);
		this.libraryState.itemLibrary = updatedLibrary;
		this.updateState();
		return updatedItem.libraryId!;
	}

	updateSortDetails(sortMode: number, sortDirection: number): void {
		const updatedLibrary = cloneDeep(this.libraryState.itemLibrary);
		updatedLibrary.sortDetails = { sortMode, sortDirection };
		this.libraryState = cloneDeep(this.libraryState);
		this.libraryState.itemLibrary = updatedLibrary;
		this.updateState();
	}

	removeLibraryItem(itemId: string): void {
		const updatedLibrary = cloneDeep(this.libraryState.itemLibrary);
		const deprecatedItem = updatedLibrary.getItem(itemId);
		if (!deprecatedItem) return;
		const associatedImg = deprecatedItem.imgData;

		if (associatedImg) {
			this.imageService.deleteImage(associatedImg.fileName);
		}
		updatedLibrary.removeItem(itemId);
		this.libraryState = cloneDeep(this.libraryState);
		this.libraryState.itemLibrary = updatedLibrary;

		this.updateState();
	}

	private convertUndefinedState(oldState: any) {
		const compatibleState = cloneDeep(this.defaultCompatibleState);
		if (typeof oldState === 'object') {
			compatibleState.itemLibrary = oldState;
		}
		return compatibleState;
	}

	private async ensureCompatibility(
		newState: any,
		oldState: any
	): Promise<LibraryState> {
		if (newState) {
			return newState;
		}

		if (!oldState) {
			return cloneDeep(this.defaultState);
		}

		let compatibleState: any;
		switch (oldState.stateVersion) {
			case undefined:
			case null:
				compatibleState = this.convertUndefinedState(oldState);
				this.storage.set(StorageKey.Library, compatibleState);
				return await this.ensureCompatibility(null, compatibleState);
			case '1.0':
				compatibleState = cloneDeep(this.defaultState);
				oldState.itemLibrary.items.forEach((item: any) => {
					console.log(item);
					const compatibleItem = cloneDeep(item);
					compatibleItem.tags = [];
					const oldTags = [...compatibleItem.tags];
					for (let tag of oldTags) {
						const compatibleTag = this.tagService.addTag(tag);
						compatibleItem.tags.push(compatibleTag);
					}
					compatibleState.itemLibrary.addItem(item.itemId, compatibleItem);
				});
				this.storage.set(StorageKey.Library, compatibleState);
				return compatibleState;
			default:
				this.storage.set(StorageKey.Library, oldState);
				return oldState;
		}
	}

	private async updateState(): Promise<void> {
		await this.storage.set(StorageKey.Library, this.libraryState);
		this.libraryChanges.next(this.libraryState);
	}
}
