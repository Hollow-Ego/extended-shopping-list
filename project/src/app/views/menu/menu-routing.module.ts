import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuPage } from './menu.page';

const routes: Routes = [
	{
		path: '',
		component: MenuPage,
		children: [
			{
				path: 'tabs',
				loadChildren: () =>
					import('../tabs/tabs.module').then(m => m.TabsPageModule),
			},
			{
				path: 'settings',
				loadChildren: () =>
					import('../settings/settings.module').then(m => m.SettingsPageModule),
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class MenuPageRoutingModule {}
