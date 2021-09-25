import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DARK_THEME, LIGHT_THEME } from '../../shared/constants';
import { SettingsData } from '../../shared/models/settings.model';

@Component({
	selector: 'pxsl1-settings',
	templateUrl: './settings.page.html',
	styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit, OnDestroy {
	constructor() {}

	private stateSub: Subscription;
	public isDarkMode = document.body.getAttribute('color-theme') === DARK_THEME;
	public language: string;
	public settings: SettingsData;

	ngOnInit() {
		// this.stateSub = this.store.select(selectSettings).subscribe(settings => {
		// 	if (!settings) return;
		// 	this.settings = { ...settings };
		// });
	}

	onToggleTheme() {
		// this.store.dispatch(
		// 	SLActions.startUpdateSettings({
		// 		...this.settings,
		// 		theme: this.getNewTheme(),
		// 	})
		// );
	}

	getNewTheme() {
		return this.isDarkMode ? LIGHT_THEME : DARK_THEME;
	}

	onUpdateLanguage(language) {
		// this.store.dispatch(
		// 	SLActions.startUpdateSettings({
		// 		...this.settings,
		// 		language,
		// 	})
		// );
	}

	ngOnDestroy() {
		this.stateSub.unsubscribe();
	}
}
