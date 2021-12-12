import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsService } from '../../services/settings.service';
import { DARK_THEME, LIGHT_THEME } from '../../shared/constants';
import { SingleCurrencyData } from '../../shared/interfaces/currency-data.interface';
import * as data from '../../i18n/currency-map.json';

@Component({
	selector: 'pxsl1-settings',
	templateUrl: './settings.page.html',
})
export class SettingsPage implements OnInit, OnDestroy {
	constructor(private settingsService: SettingsService) {}

	private settingsStateSub: Subscription;
	public isDarkMode = document.body.getAttribute('color-theme') === DARK_THEME;
	public language: string;
	public allCurrencyData: SingleCurrencyData[];

	defaultCurrency: string;

	ngOnInit() {
		this.allCurrencyData = Object.values(data['default'].currencies);
		this.settingsStateSub = this.settingsService.settingChanges.subscribe(
			settings => {
				this.language = settings.language;
				this.isDarkMode = settings.theme === DARK_THEME;
				this.defaultCurrency = settings.defaultCurrency;
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

	onUpdateCurrency(event) {
		const currency = event.detail.value;
		console.log(currency);

		this.settingsService.setDefaultCurrency(currency);
	}

	ngOnDestroy() {
		this.settingsStateSub.unsubscribe();
	}

	compareWith(cur1: SingleCurrencyData, cur2: SingleCurrencyData) {
		return cur1 && cur2 ? cur1.code === cur2.code : cur1 === cur2;
	}
}
