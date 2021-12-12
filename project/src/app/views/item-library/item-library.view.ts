import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ItemGroup } from '../../shared/classes/item-group.class';
import { ItemLibrary } from '../../shared/classes/item-library.class';
import { AddEditModalComponent } from '../../shared/components/add-edit-modal/add-edit-modal.component';
import { LibraryItem } from '../../shared/interfaces/library-item.interface';
import { AddEditModalOutput } from '../../shared/interfaces/add-edit-modal-data.interface';

import { PopulatedItem } from '../../shared/interfaces/populated-item.interface';
import { sortItemByName, sortItemByTag } from '../../shared/utilities/sorting';
import { LibraryService } from '../../services/library.service';
import { Sort } from '../../shared/enums/sorting.enum';

@Component({
	selector: 'pxsl1-item-library',
	templateUrl: './item-library.view.html',
	styleUrls: ['./item-library.view.scss'],
})
export class ItemLibraryComponent implements OnInit, OnDestroy {
	public itemLibrary: ItemLibrary;
	public itemGroups: Map<string, ItemGroup>;

	public searchTerm: string = '';
	public includeTags: boolean = true;

	public items: PopulatedItem[];
	public sortMode: number;
	public sortDirection: number;
	public sort = Sort;

	public arrowName: string = 'arrow-down';
	public sortingCategories = [];
	public sortedTagItems = [];

	private libraryStateSub: Subscription;

	constructor(
		private modalCtrl: ModalController,
		private libraryService: LibraryService
	) {}

	ngOnInit() {
		this.libraryStateSub = this.libraryService.libraryChanges.subscribe(
			libraryState => {
				this.itemLibrary = libraryState.itemLibrary;

				let { sortMode, sortDirection } = this.itemLibrary.getSortDetails();
				if (!sortMode) {
					sortMode = Sort.ByName;
				}
				if (!sortDirection) {
					sortDirection = Sort.Ascending;
				}
				this.sortMode = sortMode;
				this.sortDirection = sortDirection;
				this.sortingCategories = [];
				this.sortedTagItems = [];
				const stateItemArray = Array.from(this.itemLibrary.values());
				const sortFunction =
					this.sortMode === Sort.ByName ? sortItemByName : sortItemByTag;
				this.items = stateItemArray.sort(
					sortFunction.bind(this, this.sortDirection)
				);
				if (this.sortMode === Sort.ByName) {
					this.items.forEach(item => {
						let tag = item.tags[0];
						if (typeof tag === 'undefined') {
							tag = 'aboutItems.undefinedTagName';
						}
						if (!this.sortingCategories.includes(tag)) {
							const newIndex = this.sortingCategories.push(tag);
							this.sortedTagItems[newIndex - 1] = [];
						}
						const categoryIndex = this.sortingCategories.indexOf(tag);
						this.sortedTagItems[categoryIndex].push(item);
					});
				}
				this.arrowName =
					this.sortDirection === Sort.Ascending ? 'arrow-up' : 'arrow-down';
			}
		);
	}

	onSearchChange($event) {
		this.searchTerm = $event.target.value;
	}

	shouldBeVisible(item: LibraryItem) {
		const searchValue = this.searchTerm.toLowerCase();
		const { name, tags } = item;
		const nameContainsTerm = name.toLowerCase().indexOf(searchValue) > -1;
		const tagString = tags.toString();
		const tagsContainsTerm = tagString.toLowerCase().indexOf(searchValue) > -1;

		return nameContainsTerm || (tagsContainsTerm && this.includeTags);
	}

	async onNewLibraryItem() {
		const modal = await this.modalCtrl.create({
			component: AddEditModalComponent,
			componentProps: {
				availableTags: this.itemLibrary.getAllTags(),
				availableUnits: this.itemLibrary.getAllUnits(),
			},
		});
		await modal.present();
		const {
			canceled,
			itemData,
		}: { canceled: boolean; itemData: AddEditModalOutput } = (
			await modal.onWillDismiss()
		).data;

		if (canceled) {
			return;
		}
		this.libraryService.addLibraryItem(itemData);
	}

	changeSortDirection() {
		const sortDirection =
			this.sortDirection === Sort.Ascending ? Sort.Descending : Sort.Ascending;
		this.libraryService.updateSortDetails(this.sortMode, sortDirection);
	}

	changeSortMode($event) {
		const sortMode = $event.detail.value;
		this.libraryService.updateSortDetails(sortMode, this.sortDirection);
	}

	ngOnDestroy() {
		this.libraryStateSub.unsubscribe();
	}
}
