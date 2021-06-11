import { Store } from '@ngrx/store';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ItemGroup } from '../../shared/classes/item-group.class';
import { ItemLibrary } from '../../shared/classes/item-library.class';
import { ShoppingList } from '../../shared/classes/shopping-list.class';

import * as fromApp from '../../store/app.reducer';
import * as SLActions from '../../store/shopping-list.actions';
import * as Modes from '../../shared/constants';
import { AddEditModalComponent } from '../../components/modals/add-edit-modal/add-edit-modal.component';
import { AddEditModalOutput } from '../../shared/models/add-edit-modal-data.model';

@Component({
	selector: 'pxsl1-shopping-list',
	templateUrl: './shopping-list.view.html',
	styleUrls: ['./shopping-list.view.scss'],
})
export class ShoppingListView implements OnInit, OnDestroy {
	public itemLibrary: ItemLibrary;
	public itemGroups: ItemGroup[];
	public shoppingLists: ShoppingList[];

	public currentListIdx: number;
	public currentMode: string;
	public isLoading: boolean;

	private stateSub: Subscription;

	public modes = Modes;

	constructor(
		private modalCtrl: ModalController,
		private store: Store<fromApp.AppState>
	) {}

	ngOnInit() {
		this.stateSub = this.store.select('shoppingList').subscribe(state => {
			if (!state) {
				return;
			}
			this.itemLibrary = state.itemLibrary;
			this.itemGroups = state.itemGroups;
			this.shoppingLists = state.shoppingLists;
			this.currentMode = state.mode;
			this.currentListIdx = state.currentListIdx;
			this.isLoading = state.isLoading;
		});
	}

	async onAddItem() {
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

		this.store.dispatch(
			SLActions.startAddListItem({
				item: itemData,
				listIdx: this.currentListIdx,
			})
		);
	}

	onModeChange($event) {
		// dispatch action to change mode
	}

	ngOnDestroy() {
		this.stateSub.unsubscribe();
	}
}
