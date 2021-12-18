import { Injectable } from '@angular/core';
import { currencies } from '../i18n/currency-map';

@Injectable({
	providedIn: 'root',
})
export class CurrencyService {
	constructor() {}

	getCurrency(currency: string) {
		return currencies[currency];
	}

	getAllCurrencies() {
		return Object.values(currencies);
	}
}
