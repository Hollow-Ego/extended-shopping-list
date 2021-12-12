import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { AddEditModalComponent } from '../../../shared/components/add-edit-modal/add-edit-modal.component';
import { AddEditModalOutput } from '../../../shared/interfaces/add-edit-modal-data.interface';
import { PopulatedItem } from '../../../shared/interfaces/populated-item.interface';

import { Subscription } from 'rxjs';
import { ActionPopoverComponent } from '../../../shared/components/action-popover/action-popover.component';
import { ShoppingListService } from '../../../services/shopping-list.service';
import {
	sortItemByName,
	sortItemByTag,
} from '../../../shared/utilities/sorting';
import { ShoppingList } from '../../../shared/classes/shopping-list.class';
import { Mode } from '../../../shared/enums/mode.enum';
import { Sort } from '../../../shared/enums/sorting.enum';
import { ModalMode } from '../../../shared/enums/modal-mode.enum';
import { ModalAction } from '../../../shared/enums/modal-action.enum';
@Component({
	selector: 'pxsl1-shopping-list-page',
	templateUrl: './shopping-list.page.component.html',
	styleUrls: ['./shopping-list.page.component.scss'],
})
export class ShoppingListPageComponent implements OnInit, OnDestroy {
	@Input() listId: string | undefined;
	public list: ShoppingList | undefined;
	public items: PopulatedItem[] | undefined;
	public listName: string | undefined;
	public sortMode: string | undefined;
	public sortDirection: string | undefined;
	public viewMode: string | undefined;

	public mode = Mode;
	public sort = Sort;

	public arrowName: string = 'arrow-down';
	public sortingCategories: string[] = [];
	public sortedTagItems: PopulatedItem[][] = [];
	private listSub: Subscription | undefined;

	constructor(
		private modalCtrl: ModalController,
		public popoverCtrl: PopoverController,
		private SLService: ShoppingListService
	) {}

	ngOnInit() {
		this.listSub = this.SLService.shoppingListChanges.subscribe(listState => {
			this.list = listState.shoppingLists.get(this.listId!);
			let { sortMode, sortDirection } = this.list!.getSortDetails();
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
			const stateItemArray = Array.from(this.list!.getAllItems().values());
			const sortFunction =
				this.sortMode === Sort.ByName ? sortItemByName : sortItemByTag;
			this.items = stateItemArray.sort(
				sortFunction.bind(this, this.sortDirection)
			);
			if (this.sortMode === Sort.ByTag) {
				this.items.forEach(item => {
					let tags = item.tags;
					let tag;
					if (typeof tags === 'undefined') {
						tag = 'aboutItems.undefinedTagName';
					} else {
						tag = tags[0];
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
			this.listName = this.list!.getName();
			this.viewMode = this.list!.getMode();
		});
	}

	async onAddItem() {
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

		this.SLService.addListItem(itemData, amount);
	}

	async onEditItem(item: PopulatedItem) {
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

	onDeleteItem(item: PopulatedItem) {
		this.SLService.removeListItem(item.itemId);
	}

	onModeChange() {
		this.SLService.toggleListMode();
	}

	async onListActions($event: any) {
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

	async renameList() {
		this.SLService.renameList(this.listName);
	}

	changeSortMode($event: any) {
		const sortMode = $event.detail.value;
		this.SLService.updateShoppingList({ sortMode });
	}

	changeSortDirection() {
		const sortDirection =
			this.sortDirection === Sort.Ascending ? Sort.Descending : Sort.Ascending;
		this.SLService.updateShoppingList({ sortDirection });
	}

	async removeList() {
		const confirmed = await this.SLService.confirmRemoval();
		if (!confirmed) return;
		this.SLService.removeShoppingList();
	}

	trackByID(index: number, item: PopulatedItem) {
		return item ? item.itemId : undefined;
	}

	ngOnDestroy() {
		if (this.listSub) this.listSub.unsubscribe();
	}
}
