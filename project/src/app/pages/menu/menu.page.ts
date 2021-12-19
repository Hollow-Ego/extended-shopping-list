import { Component, OnInit } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';
import { ShoppingListService } from '../../services/shopping-list.service';
import { App } from '@capacitor/app';
import { LibraryService } from '../../services/library.service';
import { SettingsService } from '../../services/settings.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

@Component({
	selector: 'pxsl1-menu',
	templateUrl: './menu.page.html',
	styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
	public currentPath: string = '';
	appVersion: string = '';
	constructor(
		private router: Router,
		private SLService: ShoppingListService,
		private libService: LibraryService,
		private settingsService: SettingsService
	) {}

	ngOnInit() {
		this.router.events.subscribe((event: RouterEvent) => {
			if (event && event.url) {
				this.currentPath = event.url;
			}
		});
		App.getInfo()
			.then(appInfo => {
				this.appVersion = appInfo.version;
			})
			.catch(err => {
				this.appVersion = '0.0.0.0';
			});
	}

	async onAddShoppingList() {
		this.SLService.addShoppingList();
	}

	async onExportData() {
		const listState = JSON.stringify(this.SLService.getState());
		const libState = JSON.stringify(this.libService.getState());
		const settingsState = JSON.stringify(this.settingsService.getState());
		const exportString = `{
			"shoppingList": ${listState},
			"library": ${libState},
			"settings": ${settingsState}
		}`;

		await Filesystem.writeFile({
			path: 'app_state.json',
			data: exportString,
			directory: Directory.Data,
			encoding: Encoding.UTF8,
		});
	}
}
