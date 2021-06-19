import { Store } from '@ngrx/store';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalController, IonSlides } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ItemGroup } from '../../shared/classes/item-group.class';
import { ItemLibrary } from '../../shared/classes/item-library.class';
import { ShoppingList } from '../../shared/classes/shopping-list.class';

import * as fromApp from '../../store/app.reducer';
import * as SLActions from '../../store/shopping-list.actions';

import { AddEditModalComponent } from '../../components/modals/add-edit-modal/add-edit-modal.component';
import { AddEditModalOutput } from '../../shared/models/add-edit-modal-data.model';
import { ShoppingListService } from '../../services/shopping-list.service';

@Component({
	selector: 'pxsl1-shopping-list',
	templateUrl: './shopping-list.view.html',
	styleUrls: ['./shopping-list.view.scss'],
})
export class ShoppingListView implements OnInit, OnDestroy {
	@ViewChild('slides') slides: IonSlides;

	public itemLibrary: ItemLibrary;
	public itemGroups: Map<string, ItemGroup>;
	public shoppingLists: ShoppingList[];
	public currentListId: string;
	public currentMode: string;
	private stateSub: Subscription;

	constructor(
		private modalCtrl: ModalController,
		private store: Store<fromApp.AppState>,
		private SLService: ShoppingListService
	) {}

	ngOnInit() {
		this.stateSub = this.store.select('mainState').subscribe(state => {
			if (!state) {
				return;
			}

			this.itemLibrary = state.itemLibrary;
			this.itemGroups = state.itemGroups;
			const stateListArray = Array.from(state.shoppingLists.values());
			this.shoppingLists = stateListArray.sort(this.sortListByName);
			this.currentListId = state.currentListId;
		});
	}

	async onAddItem() {
		const modal = await this.modalCtrl.create({
			component: AddEditModalComponent,
			componentProps: {
				availableTags: this.itemLibrary.getAllTags(),
				isNewLibraryItem: false,
			},
		});
		await modal.present();

		const {
			canceled,
			itemData,
			updateLibrary,
		}: {
			canceled: boolean;
			itemData: AddEditModalOutput;
			updateLibrary: boolean;
		} = (await modal.onWillDismiss()).data;

		if (canceled) {
			return;
		}

		if (updateLibrary) {
			this.store.dispatch(
				SLActions.startSyncListItemAndLibItem({
					...itemData,
					addToListId: this.currentListId,
				})
			);
			return;
		}

		this.store.dispatch(
			SLActions.startAddListItem({
				item: itemData,
				listId: this.currentListId,
			})
		);
	}

	trackById(index: number, list) {
		return list ? list.id : undefined;
	}

	async onAddNewList() {
		const name = await this.SLService.getNewListName();
		if (!name) return;
		this.store.dispatch(SLActions.startAddShoppingList({ name }));
	}

	onSlideChange($event) {
		this.slides.getActiveIndex().then(idx => {
			const newListId = this.shoppingLists[idx].getListID();
			this.store.dispatch(
				SLActions.startSetNewCurrentList({ listId: newListId })
			);
		});
	}

	sortListByName(a: ShoppingList, b: ShoppingList) {
		var nameA = a.getName().toUpperCase();
		var nameB = b.getName().toUpperCase();
		if (nameA < nameB) {
			return -1;
		}
		return 1;
	}

	ngOnDestroy() {
		this.stateSub.unsubscribe();
	}
}
