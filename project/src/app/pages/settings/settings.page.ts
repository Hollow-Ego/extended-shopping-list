import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import * as fromApp from '../../store/app.reducer';
import * as SLActions from '../../store/shopping-list.actions';
import { selectSettings } from '../../store/shopping-list.selectors';
import * as Constants from '../..//shared/constants';
import { SettingsData } from '../../shared/models/settings.model';

@Component({
	selector: 'pxsl1-settings',
	templateUrl: './settings.page.html',
	styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit, OnDestroy {
	constructor(private store: Store<fromApp.AppState>) {}

	private stateSub: Subscription;
	public isDarkMode =
		document.body.getAttribute('color-theme') === Constants.DARK_THEME;
	public language: string;
	public settings: SettingsData;

	ngOnInit() {
		this.stateSub = this.store.select(selectSettings).subscribe(settings => {
			if (!settings) return;
			this.settings = { ...settings };
		});
	}

	onToggleTheme() {
		this.store.dispatch(
			SLActions.startUpdateSettings({
				...this.settings,
				theme: this.getNewTheme(),
			})
		);
	}

	getNewTheme() {
		return this.isDarkMode ? Constants.LIGHT_THEME : Constants.DARK_THEME;
	}

	onUpdateLanguage(language) {
		this.store.dispatch(
			SLActions.startUpdateSettings({
				...this.settings,
				language,
			})
		);
	}

	ngOnDestroy() {
		this.stateSub.unsubscribe();
	}
}