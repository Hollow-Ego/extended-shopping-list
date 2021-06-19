import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { AddEditModalComponent } from '../../../components/modals/add-edit-modal/add-edit-modal.component';
import { ItemLibrary } from '../../../shared/classes/item-library.class';
import { AddEditModalOutput } from '../../../shared/models/add-edit-modal-data.model';
import { PopulatedItem } from '../../../shared/models/populated-item.model';
import * as fromApp from '../../../store/app.reducer';
import * as SLActions from '../../../store/shopping-list.actions';
import {
	ACTION_DELETE,
	ACTION_RENAME,
	MODAL_EDIT_MODE,
	EDIT_MODE,
	SHOPPING_MODE,
} from '../../../shared/constants';
import { selectShoppingList } from '../../../store/shopping-list.selectors';
import { Subscription } from 'rxjs';
import { ActionPopoverComponent } from '../../../components/action-popover/action-popover.component';
import { ShoppingListService } from '../../../services/shopping-list.service';
@Component({
	selector: 'pxsl1-shopping-list-page',
	templateUrl: './shopping-list.page.component.html',
	styleUrls: ['./shopping-list.page.component.scss'],
})
export class ShoppingListPageComponent implements OnInit, OnDestroy {
	@Input() listId: string;
	public library: ItemLibrary;
	public items: PopulatedItem[];
	public listName: string;
	public currentMode: string;
	public EDIT_MODE: string = EDIT_MODE;
	public SHOPPING_MODE: string = SHOPPING_MODE;

	private listSub: Subscription;

	constructor(
		private store: Store<fromApp.AppState>,
		private modalCtrl: ModalController,
		public popoverCtrl: PopoverController,
		private SLService: ShoppingListService
	) {}

	ngOnInit() {
		this.listSub = this.store
			.select(selectShoppingList({ id: this.listId }))
			.subscribe(({ list, library }) => {
				if (!list) {
					return;
				}
				this.listName = list.getName();
				const stateItemArray = Array.from(list.getAllItems().values());
				this.items = stateItemArray.sort(this.sortItemByName);
				this.currentMode = list.getMode();
				this.library = library;
			});
	}

	async onEditItem(item: PopulatedItem) {
		const modal = await this.modalCtrl.create({
			component: AddEditModalComponent,
			componentProps: {
				availableTags: this.library.getAllTags(),
				item,
				mode: MODAL_EDIT_MODE,
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
					addToListId: this.listId,
				})
			);
			return;
		}

		this.store.dispatch(
			SLActions.startUpdateListItem({
				item: itemData,
				listId: this.listId,
			})
		);
	}

	onDeleteItem(item: PopulatedItem) {
		this.store.dispatch(
			SLActions.startRemoveListItem({
				itemID: item.itemID,
				listId: this.listId,
			})
		);
	}

	onModeChange() {
		this.store.dispatch(SLActions.startToggleListMode({ listId: this.listId }));
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
		const newName = await this.SLService.getNewListName(this.listName);
		if (!newName) return;

		this.store.dispatch(
			SLActions.startUpdateShoppingList({ name: newName, listId: this.listId })
		);
	}

	async removeList() {
		const confirmed = await this.SLService.confirmRemoval();
		if (!confirmed) return;
		this.store.dispatch(
			SLActions.startRemoveShoppingList({ listId: this.listId })
		);
	}

	sortItemByName(a: PopulatedItem, b: PopulatedItem) {
		var nameA = a.name.toUpperCase();
		var nameB = b.name.toUpperCase();
		if (nameA < nameB) {
			return -1;
		}
		return 1;
	}

	trackByID(index: number, item) {
		return item ? item.itemID : undefined;
	}

	ngOnDestroy() {
		this.listSub.unsubscribe();
	}
}
