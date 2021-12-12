import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ItemLibraryComponent } from './item-library.view';

const routes: Routes = [
	{
		path: '',
		component: ItemLibraryComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ItemLibraryRoutingModule {}
