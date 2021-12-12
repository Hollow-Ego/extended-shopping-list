import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { AddEditModalComponent } from '../../../shared/components/add-edit-modal/add-edit-modal.component';
import { AddEditModalOutput } from '../../../shared/interfaces/add-edit-modal-data.interface';
import { PopulatedItem } from '../../../shared/interfaces/populated-item.interface';
import {
	ACTION_DELETE,
	ACTION_RENAME,
	MODAL_EDIT_MODE,
	EDIT_MODE,
	SHOPPING_MODE,
	SORT_BY_NAME,
	SORT_ASCENDING,
	SORT_BY_TAG,
	SORT_DESCENDING,
} from '../../../shared/constants';
import { Subscription } from 'rxjs';
import { ActionPopoverComponent } from '../../../shared/components/action-popover/action-popover.component';
import { ShoppingListService } from '../../../services/shopping-list.service';
import { sortItemByName, sortItemByTag } from '../../../shared/sorting';
import { ShoppingList } from '../../../shared/classes/shopping-list.class';
@Component({
	selector: 'pxsl1-shopping-list-page',
	templateUrl: './shopping-list.page.component.html',
	styleUrls: ['./shopping-list.page.component.scss'],
})
export class ShoppingListPageComponent implements OnInit, OnDestroy {
	@Input() listId: string;
	public list: ShoppingList;
	public items: PopulatedItem[];
	public listName: string;
	public sortMode: string;
	public sortDirection: string;
	public viewMode: string;

	public EDIT_MODE: string = EDIT_MODE;
	public SHOPPING_MODE: string = SHOPPING_MODE;
	public SORT_BY_NAME: string = SORT_BY_NAME;
	public SORT_BY_TAG: string = SORT_BY_TAG;
	public SORT_ASCENDING: string = SORT_ASCENDING;
	public SORT_DESCENDING: string = SORT_DESCENDING;

	public arrowName: string = 'arrow-down';
	public sortingCategories = [];
	public sortedTagItems = [];
	private listSub: Subscription;

	constructor(
		private modalCtrl: ModalController,
		public popoverCtrl: PopoverController,
		private SLService: ShoppingListService
	) {}

	ngOnInit() {
		this.listSub = this.SLService.shoppingListChanges.subscribe(listState => {
			this.list = listState.shoppingLists.get(this.listId);
			let { sortMode, sortDirection } = this.list.getSortDetails();
			if (!sortMode) {
				sortMode = SORT_BY_NAME;
			}
			if (!sortDirection) {
				sortDirection = SORT_ASCENDING;
			}
			this.sortMode = sortMode;
			this.sortDirection = sortDirection;
			this.sortingCategories = [];
			this.sortedTagItems = [];
			const stateItemArray = Array.from(this.list.getAllItems().values());
			const sortFunction =
				this.sortMode === SORT_BY_NAME ? sortItemByName : sortItemByTag;
			this.items = stateItemArray.sort(
				sortFunction.bind(this, this.sortDirection)
			);
			if (this.sortMode === SORT_BY_TAG) {
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
				this.sortDirection === SORT_ASCENDING ? 'arrow-up' : 'arrow-down';
			this.listName = this.list.getName();
			this.viewMode = this.list.getMode();
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
				mode: MODAL_EDIT_MODE,
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

	async onListActions($event) {
		const popover = await this.popoverCtrl.create({
			component: ActionPopoverComponent,
			event: $event,
			translucent: true,
			componentProps: { options: [ACTION_RENAME, ACTION_DELETE] },
		});

		await popover.present();
		const { data: action } = await popover.onDidDismiss();

		switch (action) {
			case ACTION_DELETE:
				this.removeList();
				return;
			case ACTION_RENAME:
				this.renameList();
				return;
			default:
				return;
		}
	}

	async renameList() {
		this.SLService.renameList(this.listName);
	}

	changeSortMode($event) {
		const sortMode = $event.detail.value;
		this.SLService.updateShoppingList({ sortMode });
	}

	changeSortDirection() {
		const sortDirection =
			this.sortDirection === SORT_ASCENDING ? SORT_DESCENDING : SORT_ASCENDING;
		this.SLService.updateShoppingList({ sortDirection });
	}

	async removeList() {
		const confirmed = await this.SLService.confirmRemoval();
		if (!confirmed) return;
		this.SLService.removeShoppingList();
	}

	trackByID(index: number, item) {
		return item ? item.itemId : undefined;
	}

	ngOnDestroy() {
		this.listSub.unsubscribe();
	}
}
