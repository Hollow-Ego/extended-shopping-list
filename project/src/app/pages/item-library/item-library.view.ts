import { Component, OnDestroy, OnInit } from '@angular/core';
import * as fromApp from '../../store/app.reducer';
import * as SLActions from '../../store/shopping-list.actions';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { ItemGroup } from '../../shared/classes/item-group.class';
import { ItemLibrary } from '../../shared/classes/item-library.class';
import { ShoppingList } from '../../shared/classes/shopping-list.class';
import { AddEditModalComponent } from '../../components/modals/add-edit-modal/add-edit-modal.component';
import { LibraryItem } from '../../shared/models/library-item.model';
import { AddEditModalOutput } from '../../shared/models/add-edit-modal-data.model';
import {
	MODAL_EDIT_MODE,
	SORT_ASCENDING,
	SORT_BY_NAME,
	SORT_BY_TAG,
	SORT_DESCENDING,
} from '../../shared/constants';
import { PopulatedItem } from '../../shared/models/populated-item.model';
import { sortItemByName, sortItemByTag } from '../../shared/sorting';

@Component({
	selector: 'pxsl1-item-library',
	templateUrl: './item-library.view.html',
	styleUrls: ['./item-library.view.scss'],
})
export class ItemLibraryComponent implements OnInit, OnDestroy {
	public itemLibrary: ItemLibrary;
	public itemGroups: Map<string, ItemGroup>;
	public shoppingLists: Map<string, ShoppingList>;

	public currentListId: string;

	public searchTerm: string = '';
	public includeTags: boolean = true;

	public items: PopulatedItem[];
	public sortMode: string;
	public sortDirection: string;
	public SORT_BY_NAME: string = SORT_BY_NAME;
	public SORT_BY_TAG: string = SORT_BY_TAG;
	public SORT_ASCENDING: string = SORT_ASCENDING;
	public SORT_DESCENDING: string = SORT_DESCENDING;
	public arrowName: string = 'arrow-down';
	public sortingCategories = [];
	public sortedTagItems = [];

	private stateSub: Subscription;

	constructor(
		private modalCtrl: ModalController,
		private store: Store<fromApp.AppState>
	) {}

	ngOnInit() {
		this.stateSub = this.store.select('mainState').subscribe(state => {
			if (!state) {
				return;
			}
			this.itemLibrary = state.itemLibrary;
			this.shoppingLists = state.shoppingLists;
			this.currentListId = state.currentListId;

			let { sortMode, sortDirection } = this.itemLibrary.getSortDetails();

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

			const stateItemArray = Array.from(this.itemLibrary.values());

			const sortFunction =
				this.sortMode === SORT_BY_NAME ? sortItemByName : sortItemByTag;
			this.items = stateItemArray.sort(
				sortFunction.bind(this, this.sortDirection)
			);

			if (this.sortMode === SORT_BY_TAG) {
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
				this.sortDirection === SORT_ASCENDING ? 'arrow-up' : 'arrow-down';
		});
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

		this.store.dispatch(SLActions.startAddLibraryItem(itemData));
	}

	async onEditLibraryItem(item: LibraryItem) {
		const modal = await this.modalCtrl.create({
			component: AddEditModalComponent,
			componentProps: {
				availableTags: this.itemLibrary.getAllTags(),
				availableUnits: this.itemLibrary.getAllUnits(),
				item,
				mode: MODAL_EDIT_MODE,
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

		this.store.dispatch(SLActions.startUpdateLibraryItem(itemData));
	}

	changeSortDirection() {
		const sortDirection =
			this.sortDirection === SORT_ASCENDING ? SORT_DESCENDING : SORT_ASCENDING;
		this.store.dispatch(
			SLActions.startUpdateLibrary({
				sortMode: this.sortMode,
				sortDirection: sortDirection,
			})
		);
	}

	changeSortMode($event) {
		const sortMode = $event.detail.value;
		this.store.dispatch(
			SLActions.startUpdateLibrary({
				sortMode: sortMode,
				sortDirection: this.sortDirection,
			})
		);
	}

	onDeleteItem(itemID: string) {
		this.store.dispatch(SLActions.startRemoveLibraryItem({ itemID }));
	}

	onAddItemToList(item: LibraryItem) {
		this.store.dispatch(
			SLActions.startAddListItem({
				item,
				amount: item.amount,
				listId: this.currentListId,
			})
		);
	}

	getListName() {
		if (!this.shoppingLists || !this.currentListId) return '-';
		return this.shoppingLists.get(this.currentListId).getName();
	}

	ngOnDestroy() {
		this.stateSub.unsubscribe();
	}
}
