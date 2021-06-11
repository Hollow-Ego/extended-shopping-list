import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as Modes from '../../../shared/constants';

import { PopulatedItem } from '../../../shared/models/populated-item.model';
import { ModalController } from '@ionic/angular';
import { singleCurrencyData } from '../../../shared/models/currency-data.model';
import { LibraryItem } from '../../../shared/models/library-item.model';
import * as data from '../../../shared/i18n/currencymap.json';
import { ImageService } from '../../../services/image.service';
@Component({
	selector: 'pxsl1-add-edit-modal',
	templateUrl: './add-edit-modal.component.html',
	styleUrls: ['./add-edit-modal.component.scss'],
})
export class AddEditModalComponent implements OnInit {
	constructor(
		public formBuilder: FormBuilder,
		public modalController: ModalController,
		private imageService: ImageService
	) {}

	@Input() item: PopulatedItem | LibraryItem = null;
	@Input() mode: string = Modes.MODAL_ADD_MODE;
	@Input() availableTags: string[];

	public itemForm: FormGroup;

	public allCurrencyData: singleCurrencyData[];
	// To be refactored into a setting
	private defaultCurrency: singleCurrencyData = {
		symbol: '\u20AC',
		code: 'EUR',
		symbol_native: '\u20AC',
		decimal_digits: 2,
		rounding: 0.0,
	};

	ngOnInit() {
		this.allCurrencyData = Object.values(data['default'].currencies);
		if (!this.item) {
			this.item = {
				itemID: null,
				name: null,
				imgData: { filepath: '', fileName: '', webviewPath: '' },
				amount: null,
				tags: [],
				unit: null,
				price: null,
				currency: this.defaultCurrency,
			};
		}

		this.itemForm = this.formBuilder.group({
			itemID: this.item.itemID,
			name: [this.item.name, [Validators.required, Validators.minLength(3)]],
			amount: this.item.amount,
			imgData: this.item.imgData,
			tags: [[...this.item.tags]],
			unit: this.item.unit,
			price: this.item.price,
			currency: this.item.currency,
		});

		// this.itemForm.valueChanges.subscribe(() => {
		// 	console.log(this.itemForm.value);
		// 	console.log(this.itemForm);
		// });
	}

	onSubmit() {
		this.dismissModal();
	}

	isNewItem() {
		return this.mode === Modes.MODAL_ADD_MODE;
	}

	compareWith(cur1: singleCurrencyData, cur2: singleCurrencyData) {
		return cur1 && cur2 ? cur1.code === cur2.code : cur1 === cur2;
	}

	dismissModal(canceled = false) {
		const itemData = this.itemForm.value;
		if (!this.itemForm.dirty) {
			canceled = true;
		}
		if (canceled) {
			this.imageService.clearDeletionStack();
		}
		this.imageService.deleteImagesFromStack();

		this.modalController.dismiss({ canceled, itemData });
	}

	cancelInput() {
		this.dismissModal(true);
	}
}
