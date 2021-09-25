import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { ItemLibrary } from '../shared/classes/item-library.class';
import { LibraryItem } from '../shared/models/library-item.model';
import * as Constants from '../shared/constants';
import { ImageService } from './image.service';
import { createOrCopyID } from '../shared/utils';
import { LibraryServiceState } from '../shared/models/service-models';
import { BehaviorSubject } from 'rxjs';
import { Storage } from '@ionic/storage';

@Injectable({
	providedIn: 'root',
})
export class LibraryService {
	private currentStateVersion = '1.0';
	private defaultState: LibraryServiceState = {
		itemLibrary: new ItemLibrary(new Map<string, LibraryItem>()),
		tagLibrary: [],
		unitLibrary: [],
		stateVersion: this.currentStateVersion,
	};
	private libraryState: LibraryServiceState = cloneDeep(this.defaultState);

	libraryChanges: BehaviorSubject<LibraryServiceState> =
		new BehaviorSubject<LibraryServiceState>(this.libraryState);

	constructor(private storage: Storage, private imageService: ImageService) {
		this.initializeService();
	}

	async initializeService() {
		const loadedLibraryState = await this.storage.get(Constants.LIBRARY_KEY);
		const compatibleState = this.ensureCompatibility(loadedLibraryState);

		const updatedLibrary: ItemLibrary = cloneDeep(
			this.libraryState.itemLibrary
		);
		const compatibleLibrary = compatibleState.itemLibrary;
		updatedLibrary.setItems(compatibleLibrary.items);
		updatedLibrary.setSortDetails(
			compatibleLibrary.sortMode,
			compatibleLibrary.sortDirection
		);

		const loadedTags = updatedLibrary.getAllTags();
		const loadedUnits = updatedLibrary.getAllUnits();
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
		const compatibleState = {
			itemLibrary: {},
			tagLibrary: [],
			unitLibrary: [],
		};
		if (typeof oldState === 'object') {
			compatibleState.itemLibrary = oldState;
		}
		return compatibleState;
	}

	async addLibraryItem(item: LibraryItem, itemId: string = null) {
		const updatedLibrary = cloneDeep(this.libraryState.itemLibrary);
		const newId: string = createOrCopyID(itemId);
		const newItem: LibraryItem = { ...item, itemId: newId };

		updatedLibrary.add(newId, newItem);

		this.libraryState = { ...this.libraryState, itemLibrary: updatedLibrary };
		await this.storage.set(Constants.LIBRARY_KEY, this.libraryState);
		this.libraryChanges.next(this.libraryState);
	}

	async updateLibraryItem(updatedItem: LibraryItem) {
		const updatedLibrary = cloneDeep(this.libraryState.itemLibrary);

		updatedLibrary.update(updatedItem.itemId, updatedItem);

		this.libraryState = { ...this.libraryState, itemLibrary: updatedLibrary };
		await this.storage.set(Constants.LIBRARY_KEY, this.libraryState);
		this.libraryChanges.next(this.libraryState);
	}

	async updateSortDetails(sortMode: string, sortDirection: string) {
		const updatedLibrary = cloneDeep(this.libraryState.itemLibrary);

		updatedLibrary.setSortDetails(sortMode, sortDirection);

		this.libraryState = { ...this.libraryState, itemLibrary: updatedLibrary };
		await this.storage.set(Constants.LIBRARY_KEY, this.libraryState);
		this.libraryChanges.next(this.libraryState);
	}

	async removeLibraryItem(itemId: string) {
		const updatedLibrary = cloneDeep(this.libraryState.itemLibrary);
		const deprecatedItem = updatedLibrary.get(itemId);

		const associatedImg = deprecatedItem.imgData;

		if (associatedImg) {
			this.imageService.deleteImage(associatedImg.fileName);
		}
		updatedLibrary.remove(itemId);

		this.libraryState = { ...this.libraryState, itemLibrary: updatedLibrary };
		await this.storage.set(Constants.LIBRARY_KEY, this.libraryState);
		this.libraryChanges.next(this.libraryState);
	}
}
