import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsService } from '../../services/settings.service';
import { DARK_THEME, LIGHT_THEME } from '../../shared/constants';

@Component({
	selector: 'pxsl1-settings',
	templateUrl: './settings.page.html',
	styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit, OnDestroy {
	constructor(private settingsService: SettingsService) {}

	private settingsStateSub: Subscription;
	public isDarkMode = document.body.getAttribute('color-theme') === DARK_THEME;
	public language: string;

	ngOnInit() {
		this.settingsStateSub = this.settingsService.settingChanges.subscribe(
			settings => {
				this.language = settings.language;
				this.isDarkMode = settings.theme === DARK_THEME;
			}
		);
	}

	onToggleTheme() {
		const newTheme = this.getNewTheme();
		this.settingsService.setTheme(newTheme);
	}

	getNewTheme() {
		return this.isDarkMode ? LIGHT_THEME : DARK_THEME;
	}

	onUpdateLanguage(language) {
		this.settingsService.setLanguage(language);
	}

	ngOnDestroy() {
		this.settingsStateSub.unsubscribe();
	}
}
