import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Storage } from '@ionic/storage';
import { SettingsServiceState } from './../shared/models/service-models';
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

	private settingState: SettingsServiceState = cloneDeep(this.defaultState);

	settingChanges: BehaviorSubject<SettingsServiceState> =
		new BehaviorSubject<SettingsServiceState>(this.settingState);

	constructor(private storage: Storage) {
		this.initializeService();
	}

	async initializeService() {
		const loadedSettingsState = await this.storage.get(SETTINGS_KEY);
		const compatibleState = this.ensureCompatibility(loadedSettingsState);
		console.log(loadedSettingsState);
		console.log(compatibleState);

		this.settingState = {
			...this.settingState,
			...compatibleState,
			stateVersion: this.currentStateVersion,
		};
		console.log(this.settingState);
		this.settingChanges.next(this.settingState);
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
}
