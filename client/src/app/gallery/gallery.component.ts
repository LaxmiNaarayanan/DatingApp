import { Component, input, OnInit } from '@angular/core';
import { GalleryItem } from './IGalleryItem';
import { LightboxModule, Lightbox } from 'ngx-lightbox';


@Component({
  standalone: true,
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  imports: [LightboxModule],
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  images = input<GalleryItem[]>([]);

  constructor(private lightbox: Lightbox) {}

  ngOnInit() {
    console.log(this.images());
  }

   open(index: number): void {
    this.lightbox.open([]);
  }
}