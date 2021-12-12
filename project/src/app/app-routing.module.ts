import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: 'menu',
		loadChildren: () =>
			import('./views/menu/menu.module').then(m => m.MenuPageModule),
	},
	{
		path: '',
		redirectTo: 'menu/tabs',
		pathMatch: 'full',
	},
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, {
			preloadingStrategy: PreloadAllModules,
			relativeLinkResolution: 'legacy',
		}),
	],
	exports: [RouterModule],
})
export class AppRoutingModule {}
