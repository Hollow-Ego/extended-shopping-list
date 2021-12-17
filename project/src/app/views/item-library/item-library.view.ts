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
import { Arrow } from '../../shared/enums/arrow.enum';
import { LibraryState } from '../../shared/interfaces/service.interface';
import { NameIdObject } from '../../shared/interfaces/name-id-object.interface';

@Component({
	selector: 'pxsl1-item-library',
	templateUrl: './item-library.view.html',
	styleUrls: ['./item-library.view.scss'],
})
export class ItemLibraryComponent implements OnInit, OnDestroy {
	public arrowName: string = Arrow.Down;
	public includeTags: boolean = true;
	public itemGroups: Map<string, ItemGroup> | undefined;
	public itemLibrary: ItemLibrary = new ItemLibrary();
	public items: PopulatedItem[] | undefined;

	public searchTerm: string = '';
	public sort = Sort;
	public sortDirection: number = Sort.Ascending;
	public sortedTagItems: PopulatedItem[][] = [];
	public sortingCategories: string[] = [];

	private libraryStateSub: Subscription | undefined;

	constructor(
		private modalCtrl: ModalController,
		private libraryService: LibraryService
	) {}

	ngOnInit() {
		this.libraryStateSub = this.libraryService.libraryChanges.subscribe(
			(libraryState: LibraryState) => {
				this.itemLibrary = libraryState.itemLibrary;

				let { sortMode, sortDirection } = this.itemLibrary.sortDetails;

				this.sortDirection = sortDirection;
				this.sortingCategories = [];
				this.sortedTagItems = [];
				const stateItemArray = this.itemLibrary.itemsArray;
				const sortFunction =
					sortMode === Sort.ByName ? sortItemByName : sortItemByTag;
				this.items = stateItemArray.sort(
					sortFunction.bind(this, this.sortDirection)
				);

				if (sortMode === Sort.ByName) {
					this.items.forEach(item => {
						let tag: NameIdObject = item.tags[0];
						if (!tag) return;
						if (!this.sortingCategories.includes(tag.name)) {
							const newIndex = this.sortingCategories.push(tag.name);
							this.sortedTagItems[newIndex - 1] = [];
						}
						const categoryIndex = this.sortingCategories.indexOf(tag.name);
						this.sortedTagItems[categoryIndex].push(item);
					});
				}
				this.arrowName =
					this.sortDirection === Sort.Ascending ? Arrow.Up : Arrow.Down;
			}
		);
	}

	changeSortDirection(): void {
		const sortMode = this.itemLibrary.sortMode;
		const sortDirection =
			this.itemLibrary.sortDirection === Sort.Ascending
				? Sort.Descending
				: Sort.Ascending;
		this.libraryService.updateSortDetails(sortMode, sortDirection);
	}

	changeSortMode(event: any): void {
		const sortMode = event.detail.value;
		this.libraryService.updateSortDetails(sortMode, this.sortDirection);
	}

	async onNewLibraryItem(): Promise<void> {
		const modal = await this.modalCtrl.create({
			component: AddEditModalComponent,
			componentProps: {
				availableTags: this.itemLibrary.tags,
				availableUnits: this.itemLibrary.units,
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

	onSearchChange(event: any): void {
		this.searchTerm = event.target.value;
	}

	shouldBeVisible(item: LibraryItem): boolean {
		const searchValue = this.searchTerm.toLowerCase();
		const { name, tags } = item;
		const nameContainsTerm = name.toLowerCase().indexOf(searchValue) > -1;
		const tagString = tags.toString();
		const tagsContainsTerm = tagString.toLowerCase().indexOf(searchValue) > -1;

		return nameContainsTerm || (tagsContainsTerm && this.includeTags);
	}

	ngOnDestroy() {
		if (this.libraryStateSub) this.libraryStateSub.unsubscribe();
	}
}
