import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ShoppingListPageRoutingModule } from './shopping-list-routing.module';

import { ShoppingListView } from './shopping-list.view';

import { ShoppingListPageComponent } from './shopping-list.page/shopping-list.page.component';
import { PopulatedItemComponent } from './shopping-list.page/populated-item/populated-item.component';

import { SharedModule } from '../../shared/shared.module';
import { ImageModalComponent } from '../../shared/components/image-modal/image-modal.component';

@NgModule({
	imports: [FormsModule, ShoppingListPageRoutingModule, SharedModule],
	declarations: [
		ShoppingListView,
		ImageModalComponent,
		ShoppingListPageComponent,
		PopulatedItemComponent,
	],
})
export class ShoppingListPageModule {}
