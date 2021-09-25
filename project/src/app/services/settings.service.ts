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
	private currentStateVersion = '1.0';
	private defaultState: SettingsServiceState = {
		language: 'en',
		theme: window.matchMedia('(prefers-color-scheme: dark)').matches
			? DARK_THEME
			: LIGHT_THEME,
		stateVersion: this.currentStateVersion,
	};

	private settingsState: SettingsServiceState = cloneDeep(this.defaultState);

	settingChanges: BehaviorSubject<SettingsServiceState> =
		new BehaviorSubject<SettingsServiceState>(this.settingsState);

	constructor(private storage: Storage) {
		this.initializeService();
	}

	async initializeService() {
		const loadedSettingsState = await this.storage.get(SETTINGS_KEY);
		const compatibleState = this.ensureCompatibility(loadedSettingsState);

		this.settingsState = {
			...this.settingsState,
			...compatibleState,
			stateVersion: this.currentStateVersion,
		};
		console.log(this.settingsState);
		this.settingChanges.next(this.settingsState);
	}

	ensureCompatibility(loadedListState: any) {
		switch (loadedListState.stateVersion) {
			case undefined:
			case null:
				const compatibleState = this.convertUndefinedState(loadedListState);
				return compatibleState;
			default:
				return loadedListState;
		}
	}

	convertUndefinedState(oldState: any) {
		const compatibleState = cloneDeep(this.defaultState);
		return { ...compatibleState, ...oldState };
	}

	async setTheme(theme: string) {
		this.settingsState = { ...this.settingsState, theme };
		this.updateState();
	}

	async setLanguage(language: string) {
		this.settingsState = { ...this.settingsState, language };
		this.updateState();
	}

	async updateState() {
		await this.storage.set(SETTINGS_KEY, this.settingsState);
		this.settingChanges.next(this.settingsState);
	}
}
