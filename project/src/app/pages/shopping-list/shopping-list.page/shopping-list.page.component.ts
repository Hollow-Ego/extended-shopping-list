import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { AddEditModalComponent } from '../../../components/modals/add-edit-modal/add-edit-modal.component';
import { ItemLibrary } from '../../../shared/classes/item-library.class';
import { ShoppingList } from '../../../shared/classes/shopping-list.class';
import { AddEditModalOutput } from '../../../shared/models/add-edit-modal-data.model';
import { PopulatedItem } from '../../../shared/models/populated-item.model';
import * as fromApp from '../../../store/app.reducer';
import * as SLActions from '../../../store/shopping-list.actions';
import * as Modes from '../../../shared/constants';
@Component({
	selector: 'pxsl1-shopping-list-page',
	templateUrl: './shopping-list.page.component.html',
	styleUrls: ['./shopping-list.page.component.scss'],
})
export class ShoppingListPageComponent implements OnInit {
	@Input() shoppingList: ShoppingList;
	@Input() listIdx: number;
	@Input() library: ItemLibrary;
	public items: PopulatedItem[] = [];

	constructor(
		private store: Store<fromApp.AppState>,
		private modalCtrl: ModalController
	) {}

	ngOnInit() {
		this.items = [];
		const itemMap = this.shoppingList.getAllItems();
		itemMap.forEach(listItem => {
			this.items.push(listItem);
		});
	}

	// ngOnChanges() {
	// 	this.items = [];
	// 	const itemMap = this.shoppingList.getAllItems();
	// 	itemMap.forEach(listItem => {
	// 		this.items.push(listItem);
	// 	});
	// }

	onEditName() {}

	async onEditItem(item: PopulatedItem) {
		const modal = await this.modalCtrl.create({
			component: AddEditModalComponent,
			componentProps: {
				availableTags: this.library.getAllTags(),
				item,
				mode: Modes.MODAL_EDIT_MODE,
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
			SLActions.startUpdateListItem({
				item: itemData,
				listIdx: this.listIdx,
			})
		);
	}

	onDeleteItem(item: PopulatedItem) {
		this.store.dispatch(
			SLActions.startRemoveListItem({
				itemID: item.itemID,
				listIdx: this.listIdx,
			})
		);
	}
}
