import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { AddEditModalComponent } from '../components/modals/add-edit-modal/add-edit-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImagePickerComponent } from '../components/image-picker/image-picker.component';
import { ImagePreloadDirective } from './image-preload.directive';
import { LanguagePickerComponent } from '../components/language-picker/language-picker.component';
import { TagInputComponent } from '../components/tag-input/tag-input.component';

@NgModule({
	declarations: [
		AddEditModalComponent,
		ImagePickerComponent,
		ImagePreloadDirective,
		LanguagePickerComponent,
		TagInputComponent,
	],
	imports: [
		TranslateModule.forChild({ extend: true }),
		ReactiveFormsModule,
		CommonModule,
		IonicModule,
		FormsModule,
	],
	exports: [
		TranslateModule,
		ImagePreloadDirective,
		CommonModule,
		IonicModule,
		FormsModule,
		LanguagePickerComponent,
	],
})
export class SharedModule {}
