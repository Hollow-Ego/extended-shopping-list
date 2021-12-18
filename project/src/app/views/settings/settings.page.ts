import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsService } from '../../services/settings.service';
import { SingleCurrencyData } from '../../shared/interfaces/currency-data.interface';
import { Theme } from '../../shared/enums/theme.enum';
import { SettingsState } from '../../shared/interfaces/service.interface';
import { CurrencyService } from '../../services/currency.service';

@Component({
	selector: 'pxsl1-settings',
	templateUrl: './settings.page.html',
})
export class SettingsPage implements OnInit, OnDestroy {
	public allCurrencyData: SingleCurrencyData[] = [];

	public defaultCurrency: string = '';
	public isDarkMode = document.body.getAttribute('color-theme') === Theme.Dark;
	public language: string = 'en';

	private settingsStateSub: Subscription | undefined;

	constructor(
		private settingsService: SettingsService,
		private currencyService: CurrencyService
	) {}

	ngOnInit() {
		this.allCurrencyData = this.currencyService.getAllCurrencies();
		this.settingsStateSub = this.settingsService.settingChanges.subscribe(
			(settings: SettingsState) => {
				this.language = settings.language;
				this.isDarkMode = settings.theme === Theme.Dark;
				this.defaultCurrency = settings.defaultCurrency;
			}
		);
	}

	onToggleTheme(): void {
		const newTheme = this.getNewTheme();
		this.settingsService.setTheme(newTheme);
	}

	getNewTheme(): string {
		return this.isDarkMode ? Theme.Light : Theme.Dark;
	}

	onUpdateLanguage(language: string): void {
		this.settingsService.setLanguage(language);
	}

	onUpdateCurrency(event: any): void {
		const currency = event.detail.value;
		this.settingsService.setDefaultCurrency(currency);
	}

	compareWith(cur1: SingleCurrencyData, cur2: SingleCurrencyData): boolean {
		return cur1 && cur2 ? cur1.code === cur2.code : cur1 === cur2;
	}
	ngOnDestroy() {
		if (this.settingsStateSub) this.settingsStateSub.unsubscribe();
	}
}
