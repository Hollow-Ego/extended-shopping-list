import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Storage } from '@ionic/storage';
import { SettingsServiceState } from '../shared/models/service.models';
import { cloneDeep } from 'lodash';
import { DARK_THEME, LIGHT_THEME, SETTINGS_KEY } from '../shared/constants';

@Injectable({
	providedIn: 'root',
})
export class SettingsService {
	private currentStateVersion = '1.1';
	private defaultCurrency = 'EUR';
	private defaultState: SettingsServiceState = {
		language: 'en',
		theme: window.matchMedia('(prefers-color-scheme: dark)').matches
			? DARK_THEME
			: LIGHT_THEME,
		defaultCurrency: this.defaultCurrency,
		stateVersion: this.currentStateVersion,
	};

	private settingsState: SettingsServiceState = cloneDeep(this.defaultState);

	settingChanges: BehaviorSubject<SettingsServiceState> =
		new BehaviorSubject<SettingsServiceState>(this.settingsState);

	constructor(private storage: Storage) {
		this.initializeService();
	}

	getState() {
		return this.settingsState;
	}

	async initializeService() {
		const loadedSettingsState = await this.storage.get(SETTINGS_KEY);
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
		await this.storage.set(SETTINGS_KEY, this.settingsState);
		this.settingChanges.next(this.settingsState);
	}
}
