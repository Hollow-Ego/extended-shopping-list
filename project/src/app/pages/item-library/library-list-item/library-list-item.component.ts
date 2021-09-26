import { Component, Input, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { ActionPopoverComponent } from '../../../components/action-popover/action-popover.component';
import { AddEditModalComponent } from '../../../components/modals/add-edit-modal/add-edit-modal.component';
import { LibraryService } from '../../../services/library.service';
import { ShoppingListService } from '../../../services/shopping-list.service';
import { ToastService } from '../../../services/toast.service';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import {
	ACTION_EDIT,
	ACTION_DELETE,
	MODAL_EDIT_MODE,
} from '../../../shared/constants';
import { TranslationService } from '../../../shared/i18n/translation.service';
import { AddEditModalOutput } from '../../../shared/models/add-edit-modal-data.model';
import { LibraryItem } from '../../../shared/models/library-item.model';
import { PopulatedItem } from '../../../shared/models/populated-item.model';

@Component({
	selector: 'pxsl1-library-list-item',
	templateUrl: './library-list-item.component.html',
	styleUrls: ['./library-list-item.component.scss'],
})
export class LibraryListItemComponent implements OnInit {
	@Input() item: LibraryItem;
	private addItemToastMessage: string;

	constructor(
		private popoverCtrl: PopoverController,
		private modalCtrl: ModalController,
		private libraryService: LibraryService,
		private SLService: ShoppingListService,
		private toastService: ToastService,
		private translate: TranslationService
	) {}

	ngOnInit() {
		this.translate
			.getTranslation('messages.addItemToast')
			.subscribe((translation: string) => {
				this.addItemToastMessage = translation;
			});
	}

	hasImage() {
		return this.item.imgData.webviewPath !== '';
	}

	async onItemActions($event) {
		const popover = await this.popoverCtrl.create({
			component: ActionPopoverComponent,
			event: $event,
			translucent: true,
			componentProps: { options: [ACTION_EDIT, ACTION_DELETE] },
		});

		await popover.present();
		const { data: action } = await popover.onDidDismiss();

		switch (action) {
			case ACTION_DELETE:
				this.onDeleteItem(this.item.itemId);
				return;
			case ACTION_EDIT:
				this.onEditItem(this.item);
				return;
			default:
				return;
		}
	}

	async onEditItem(item: LibraryItem) {
		const modal = await this.modalCtrl.create({
			component: AddEditModalComponent,
			componentProps: {
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

		this.libraryService.updateLibraryItem(itemData);
	}

	onDeleteItem(itemId: string) {
		this.libraryService.removeLibraryItem(itemId);
	}

	async onAddToList(item: LibraryItem) {
		const { amount } = item;
		const newShoppingItem: PopulatedItem = {
			amount,
			itemId: null,
			name: item.name,
			tags: [],
		};
		this.SLService.addListItem(newShoppingItem, amount);
		Haptics.notification({ type: NotificationType.Success });
		this.toastService.showSimpleToast(
			`${item.name} ${this.addItemToastMessage} `
		);
	}
}
