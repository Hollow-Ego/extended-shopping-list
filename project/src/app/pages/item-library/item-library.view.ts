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
import { MODAL_EDIT_MODE } from '../../shared/constants';

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
		if (!this.shoppingLists || !this.currentListId) return;
		return this.shoppingLists.get(this.currentListId).getName();
	}

	ngOnDestroy() {
		this.stateSub.unsubscribe();
	}
}
