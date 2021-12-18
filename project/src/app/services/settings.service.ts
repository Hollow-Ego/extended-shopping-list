import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Storage } from '@ionic/storage';
import { SettingsState } from '../shared/interfaces/service.interface';
import { cloneDeep } from 'lodash';

import { StorageKey } from '../shared/enums/storage-key.enum';
import { Theme } from '../shared/enums/theme.enum';
import { CurrencyService } from './currency.service';
import { SingleCurrencyData } from '../shared/interfaces/currency-data.interface';

@Injectable({
	providedIn: 'root',
})
export class SettingsService {
	private currentStateVersion = '1.1';
	private defaultCurrency = 'EUR';
	private defaultState: SettingsState = {
		language: 'en',
		theme: window.matchMedia('(prefers-color-scheme: dark)').matches
			? Theme.Dark
			: Theme.Light,
		defaultCurrency: this.defaultCurrency,
		stateVersion: this.currentStateVersion,
	};

	private settingsState: SettingsState = cloneDeep(this.defaultState);

	settingChanges: BehaviorSubject<SettingsState> =
		new BehaviorSubject<SettingsState>(this.settingsState);

	constructor(
		private storage: Storage,
		private currencyService: CurrencyService
	) {
		this.initializeService();
	}

	async initializeService() {
		const loadedSettingsState = await this.storage.get(StorageKey.Settings);
		const compatibleState = this.ensureCompatibility(loadedSettingsState);

		this.settingsState = compatibleState;
		this.settingChanges.next(this.settingsState);
	}

	ensureCompatibility(loadedSettingsState: any) {
		if (!loadedSettingsState) {
			return cloneDeep(this.defaultState);
		}
		switch (loadedSettingsState.stateVersion) {
			case undefined:
			case null:
				const compatibleState = this.convertUndefinedState(loadedSettingsState);
				return compatibleState;
			case '1.0':
				return {
					...loadedSettingsState,
					defaultCurrency: this.defaultCurrency,
				};
			default:
				return loadedSettingsState;
		}
	}

	convertUndefinedState(oldState: any) {
		const compatibleState = cloneDeep(this.defaultState);
		return { ...compatibleState, ...oldState };
	}

	getDefaultCurrency(): SingleCurrencyData {
		let key = this.settingsState.defaultCurrency;
		if (!key) key = this.defaultCurrency;
		return this.currencyService.getCurrency(key);
	}

	getDefaultLanguage(): string {
		return this.defaultState.language;
	}

	getLanguage(): string {
		return this.settingsState.language;
	}

	setDefaultCurrency(defaultCurrency: string) {
		this.settingsState = { ...this.settingsState, defaultCurrency };
		this.updateState();
	}

	setLanguage(language: string) {
		this.settingsState = { ...this.settingsState, language };
		this.updateState();
	}

	setTheme(theme: string) {
		this.settingsState = { ...this.settingsState, theme };
		this.updateState();
	}

	async updateState() {
		await this.storage.set(StorageKey.Settings, this.settingsState);
		this.settingChanges.next(this.settingsState);
	}
}
