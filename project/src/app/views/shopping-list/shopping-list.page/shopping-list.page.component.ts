import { Component, Input, OnDestroy, OnChanges } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { AddEditModalComponent } from '../../../shared/components/add-edit-modal/add-edit-modal.component';
import { AddEditModalOutput } from '../../../shared/interfaces/add-edit-modal-data.interface';
import { PopulatedItem } from '../../../shared/interfaces/populated-item.interface';

import { Subscription } from 'rxjs';
import { ActionPopoverComponent } from '../../../shared/components/action-popover/action-popover.component';
import { ShoppingListService } from '../../../services/shopping-list.service';

import { ShoppingList } from '../../../shared/classes/shopping-list.class';
import { Mode } from '../../../shared/enums/mode.enum';
import { Sort } from '../../../shared/enums/sorting.enum';
import { ModalMode } from '../../../shared/enums/modal-mode.enum';
import { ModalAction } from '../../../shared/enums/modal-action.enum';
import { Arrow } from '../../../shared/enums/arrow.enum';
import { ShoppingListState } from '../../../shared/interfaces/service.interface';
import {
	sortItemByName,
	sortItemByTag,
} from '../../../shared/utilities/sorting';
import { NameIdObject } from '../../../shared/interfaces/name-id-object.interface';
@Component({
	selector: 'pxsl1-shopping-list-page',
	templateUrl: './shopping-list.page.component.html',
	styleUrls: ['./shopping-list.page.component.scss'],
})
export class ShoppingListPageComponent implements OnChanges, OnDestroy {
	@Input() listId: string | undefined;

	public arrowName: string = Arrow.Down;

	public items: PopulatedItem[] | undefined;
	public list: ShoppingList = new ShoppingList(
		new Map(),
		'Uninitialized List',
		''
	);
	public mode = Mode;

	public sort = Sort;
	public sortDirection: number = Sort.Ascending;
	public sortedTagItems: PopulatedItem[][] = [];
	public sortingCategories: string[] = [];
	public sortMode: number = Sort.ByName;

	private listSub: Subscription | undefined;

	constructor(
		private modalCtrl: ModalController,
		public popoverCtrl: PopoverController,
		private SLService: ShoppingListService
	) {}

	ngOnChanges() {
		if (this.listSub) this.listSub.unsubscribe();
		this.listSub = this.SLService.shoppingListChanges.subscribe(
			(listState: ShoppingListState) => {
				const loadedList = listState.shoppingLists.get(this.listId!);
				if (!loadedList) return;
				this.list = loadedList;

				let { sortMode, sortDirection } = this.list.getSortDetails();

				this.sortMode = sortMode;
				this.sortDirection = sortDirection;
				this.sortingCategories = [];
				this.sortedTagItems = [];

				const stateItemArray = Array.from(this.list!.getAllItems().values());

				const sortFunction =
					this.sortMode === Sort.ByName ? sortItemByName : sortItemByTag;

				this.items = stateItemArray.sort(
					sortFunction.bind(this, this.sortDirection)
				);

				if (this.sortMode === Sort.ByTag) {
					this.items.forEach(item => {
						let tags = item.tags;
						let tag: NameIdObject = tags[0];
						if (!tag) {
							tag = {
								name: 'aboutItems.undefinedTagName',
								id: 'dummy',
							};
						}

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
		const sortDirection =
			this.sortDirection === Sort.Ascending ? Sort.Descending : Sort.Ascending;
		this.SLService.updateShoppingList({ sortDirection });
	}

	changeSortMode($event: any): void {
		const sortMode = $event.detail.value;
		this.SLService.updateShoppingList({ sortMode });
	}

	async onAddItem(): Promise<void> {
		const modal = await this.modalCtrl.create({
			component: AddEditModalComponent,
			componentProps: {
				isNewLibraryItem: false,
			},
		});
		await modal.present();

		const {
			canceled,
			itemData,
		}: {
			canceled: boolean;
			itemData: AddEditModalOutput;
		} = (await modal.onWillDismiss()).data;

		if (canceled) {
			return;
		}

		const { amount } = itemData;
		itemData.libraryId = null;

		this.SLService.addListItem(itemData, amount);
	}

	onDeleteItem(item: PopulatedItem): void {
		this.SLService.removeListItem(item.id);
	}

	async onEditItem(item: PopulatedItem): Promise<void> {
		const modal = await this.modalCtrl.create({
			component: AddEditModalComponent,
			componentProps: {
				item,
				mode: ModalMode.Edit,
				isNewLibraryItem: false,
			},
		});
		await modal.present();

		const {
			canceled,
			itemData,
		}: {
			canceled: boolean;
			itemData: AddEditModalOutput;
			updateLibrary: boolean;
		} = (await modal.onWillDismiss()).data;

		if (canceled) {
			return;
		}
		this.SLService.updateListItem(itemData);
	}

	async onListActions($event: any): Promise<void> {
		const popover = await this.popoverCtrl.create({
			component: ActionPopoverComponent,
			event: $event,
			translucent: true,
			componentProps: { options: [ModalAction.Rename, ModalAction.Delete] },
		});

		await popover.present();
		const { data: action } = await popover.onDidDismiss();

		switch (action) {
			case ModalAction.Delete:
				this.removeList();
				return;
			case ModalAction.Rename:
				this.renameList();
				return;
			default:
				return;
		}
	}

	onModeChange(): void {
		if (!this.list) return;
		this.SLService.toggleListMode(this.list.id);
	}

	async removeList(): Promise<void> {
		if (!this.list) return;
		const confirmed = await this.SLService.confirmRemoval();
		if (!confirmed) return;
		this.SLService.removeShoppingList(this.list.id);
	}

	async renameList(): Promise<void> {
		if (!this.list) return;
		this.SLService.renameList(this.list.name);
	}

	trackByID(index: number, item: PopulatedItem): string | undefined {
		return item ? item.id : undefined;
	}

	ngOnDestroy() {
		if (this.listSub) this.listSub.unsubscribe();
	}
}
