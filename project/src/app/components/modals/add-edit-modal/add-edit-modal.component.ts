import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { PopulatedItem } from '../../../shared/models/populated-item.model';
import { AlertController, ModalController } from '@ionic/angular';
import { SingleCurrencyData } from '../../../shared/models/currency-data.model';
import { LibraryItem } from '../../../shared/models/library-item.model';
import * as data from '../../../shared/i18n/currency-map.json';
import { ImageService } from '../../../services/image.service';
import { MODAL_ADD_MODE } from '../../../shared/constants';
@Component({
	selector: 'pxsl1-add-edit-modal',
	templateUrl: './add-edit-modal.component.html',
	styleUrls: ['./add-edit-modal.component.scss'],
})
export class AddEditModalComponent implements OnInit {
	constructor(
		public formBuilder: FormBuilder,
		public modalController: ModalController,
		public alertController: AlertController,
		private imageService: ImageService
	) {}

	@Input() item: PopulatedItem | LibraryItem = null;
	@Input() mode: string = MODAL_ADD_MODE;
	@Input() availableTags: string[];
	@Input() availableUnits: string[];
	@Input() isNewLibraryItem: boolean = true;

	public itemForm: FormGroup;
	public updateLibrary = false;

	public allCurrencyData: SingleCurrencyData[];
	// To be refactored into a setting
	private defaultCurrency: SingleCurrencyData = {
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
	}

	async onUnitChanged(unitSelect) {
		const selectedUnit = unitSelect.value;
		if (selectedUnit === 'new') {
			const newUnit = await this.inputNewUnit();
			if (!newUnit || newUnit.length <= 0) {
				this.itemForm.controls['unit'].reset();
				return;
			}
			if (!this.availableUnits.includes(newUnit)) {
				this.availableUnits.push(newUnit);
			}
			this.itemForm.controls['unit'].setValue(newUnit);
		}
	}

	async inputNewUnit() {
		const inputAlert = await this.alertController.create({
			inputs: [
				{
					type: 'text',
					attributes: { autoComplete: 'off' },
				},
			],
			buttons: [{ text: 'Cancel' }, { text: 'Ok' }],
		});
		await inputAlert.present();
		const { data } = await inputAlert.onDidDismiss();
		if (!data.values) {
			data.values = [];
		}
		const newUnit = data.values[0];
		return newUnit;
	}

	onSubmit() {
		this.dismissModal();
	}

	isNewItem() {
		return this.mode === MODAL_ADD_MODE;
	}

	compareWith(cur1: SingleCurrencyData, cur2: SingleCurrencyData) {
		return cur1 && cur2 ? cur1.code === cur2.code : cur1 === cur2;
	}

	dismissModal(canceled = false) {
		const itemData = this.itemForm.value;
		if (!this.itemForm.dirty) {
			canceled = true;
		}
		if (canceled || (!this.isNewItem() && !this.updateLibrary)) {
			this.imageService.clearDeletionStack();
		}
		this.imageService.deleteImagesFromStack();

		this.modalController.dismiss({
			canceled,
			itemData,
			updateLibrary: this.updateLibrary,
		});
	}

	cancelInput() {
		this.dismissModal(true);
	}
}
