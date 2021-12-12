import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShoppingListView } from './shopping-list.view';

const routes: Routes = [
	{
		path: '',
		component: ShoppingListView,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ShoppingListPageRoutingModule {}
