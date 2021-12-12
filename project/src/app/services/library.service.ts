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

@Injectable({
	providedIn: 'root',
})
export class LibraryService {
	private currentStateVersion = '1.0';
	private defaultCompatibleState = {
		itemLibrary: { items: new Map(), sortMode: null, sortDirection: null },
		tagLibrary: [],
		unitLibrary: [],
	};
	private defaultState: LibraryState = {
		itemLibrary: new ItemLibrary(new Map<string, LibraryItem>()),
		tagLibrary: [],
		unitLibrary: [],
		stateVersion: this.currentStateVersion,
	};
	private libraryState: LibraryState = cloneDeep(this.defaultState);

	libraryChanges: BehaviorSubject<LibraryState> =
		new BehaviorSubject<LibraryState>(this.libraryState);

	constructor(private storage: Storage, private imageService: ImageService) {
		this.initializeService();
	}

	async initializeService() {
		const loadedLibraryState = await this.storage.get(StorageKey.Library);
		const compatibleState = this.ensureCompatibility(loadedLibraryState);

		const updatedLibrary: ItemLibrary = cloneDeep(
			this.libraryState.itemLibrary
		);

		const compatibleLibrary = compatibleState.itemLibrary;

		updatedLibrary.items = compatibleLibrary.items;
		updatedLibrary.sortDetails = {
			sortMode: compatibleLibrary.sortMode,
			sortDirection: compatibleLibrary.sortDirection,
		};

		const loadedTags = updatedLibrary.tags;
		const loadedUnits = updatedLibrary.units;
		this.libraryState = {
			...this.libraryState,
			itemLibrary: updatedLibrary,
			tagLibrary: loadedTags,
			unitLibrary: loadedUnits,
			stateVersion: this.currentStateVersion,
		};

		this.libraryChanges.next(this.libraryState);
	}

	ensureCompatibility(loadedLibraryState: any) {
		if (!loadedLibraryState) {
			return cloneDeep(this.defaultCompatibleState);
		}
		switch (loadedLibraryState.stateVersion) {
			case undefined:
			case null:
				const compatibleState = this.convertUndefinedState(loadedLibraryState);
				return compatibleState;
			default:
				return loadedLibraryState;
		}
	}

	convertUndefinedState(oldState: any) {
		const compatibleState = cloneDeep(this.defaultCompatibleState);
		if (typeof oldState === 'object') {
			compatibleState.itemLibrary = oldState;
		}
		return compatibleState;
	}

	addLibraryItem(item: LibraryItem, itemId: string | null = null) {
		const updatedLibrary = cloneDeep(this.libraryState.itemLibrary);
		const newId: string = createOrCopyID(itemId);
		const newItem: LibraryItem = { ...item, itemId: newId };

		updatedLibrary.addItem(newId, newItem);

		this.libraryState = { ...this.libraryState, itemLibrary: updatedLibrary };
		this.updateState();
	}

	updateLibraryItem(updatedItem: LibraryItem) {
		const updatedLibrary = cloneDeep(this.libraryState.itemLibrary);

		updatedLibrary.updateItem(updatedItem.itemId, updatedItem);

		this.libraryState = { ...this.libraryState, itemLibrary: updatedLibrary };
		this.updateState();
	}

	updateSortDetails(sortMode: number, sortDirection: number) {
		const updatedLibrary = cloneDeep(this.libraryState.itemLibrary);

		updatedLibrary.sortDetails = { sortMode, sortDirection };

		this.libraryState = { ...this.libraryState, itemLibrary: updatedLibrary };
		this.updateState();
	}

	removeLibraryItem(itemId: string) {
		const updatedLibrary = cloneDeep(this.libraryState.itemLibrary);
		const deprecatedItem = updatedLibrary.getItem(itemId);
		if (!deprecatedItem) return;
		const associatedImg = deprecatedItem.imgData;

		if (associatedImg) {
			this.imageService.deleteImage(associatedImg.fileName);
		}
		updatedLibrary.removeItem(itemId);

		this.libraryState = { ...this.libraryState, itemLibrary: updatedLibrary };
		this.updateState();
	}

	async updateState() {
		await this.storage.set(StorageKey.Library, this.libraryState);
		this.libraryChanges.next(this.libraryState);
	}
}
