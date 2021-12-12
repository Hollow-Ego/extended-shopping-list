import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Storage } from '@ionic/storage';
import { SettingsState } from '../shared/interfaces/service.interface';
import { cloneDeep } from 'lodash';

import { StorageKey } from '../shared/enums/storage-key.enum';
import { Theme } from '../shared/enums/theme.enum';

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

	constructor(private storage: Storage) {
		this.initializeService();
	}

	async initializeService() {
		const loadedSettingsState = await this.storage.get(StorageKey.Settings);
		const compatibleState = this.ensureCompatibility(loadedSettingsState);

		this.settingsState = {
			...this.settingsState,
			...compatibleState,
			stateVersion: this.currentStateVersion,
		};
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

	setTheme(theme: string) {
		this.settingsState = { ...this.settingsState, theme };
		this.updateState();
	}

	setLanguage(language: string) {
		this.settingsState = { ...this.settingsState, language };
		this.updateState();
	}

	setDefaultCurrency(defaultCurrency: string) {
		this.settingsState = { ...this.settingsState, defaultCurrency };
		this.updateState();
	}

	async updateState() {
		await this.storage.set(StorageKey.Settings, this.settingsState);
		this.settingChanges.next(this.settingsState);
	}
}
