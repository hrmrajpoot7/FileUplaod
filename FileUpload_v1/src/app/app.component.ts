import { Component } from '@angular/core';
import { from, Observable } from 'rxjs';
import { combineAll, map } from 'rxjs/operators';
import { ISasToken } from './azure-storage/azureStorage';
import { BlobStorageService } from './azure-storage/blob-storage.service';

interface IUploadProgress {
  filename: string;
  progress: number;
}

@Component({
  selector: 'app-root',
  template: `
  <div style="text-align:center">
    <h1>
      Welcome to blob-storage-upload
    </h1>
  </div>
  <input type="file" multiple="multiple" (change)="onFileChange($event)">

  <div *ngIf="filesSelected">
    <h2>Upload Progress</h2> 
    <pre>{{uploadProgress$ | async | json}}</pre>
  </div>
  `,
  styles: []
})
export class AppComponent {
  uploadProgress$: Observable<IUploadProgress[]>;
  filesSelected = false;

  constructor(private blobStorage: BlobStorageService) {}

  onFileChange(event: any): void {
    this.filesSelected = true;

    this.uploadProgress$ = from(event.target.files as FileList).pipe(
      map(file => this.uploadFile(file)),
      combineAll()
    );
  }

  uploadFile(file: File): Observable<IUploadProgress> {
    const accessToken: ISasToken = {
      container: 'sample-sales-data',
      filename: file.name,
      storageAccessToken:
        '?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupitfx&se=2022-05-30T19:38:53Z&st=2022-04-11T11:38:53Z&spr=https,http&sig=s6Uk5xYRi2PLFywwn2ET6v99lqVmxguAAfEaFiI%2Fyng%3D',
      storageUri: 'https://irisstorageaccountdev.blob.core.windows.net'
    };

    return this.blobStorage
      .uploadToBlobStorage(accessToken, file)
      .pipe(map(progress => this.mapProgress(file, progress)));
  }

  private mapProgress(file: File, progress: number): IUploadProgress {
    return {
      filename: file.name,
      progress: progress
    };
  }
}
