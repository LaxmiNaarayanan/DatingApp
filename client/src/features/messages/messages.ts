import { Component, inject, OnInit, signal } from '@angular/core';
import { MessageService } from '../../core/services/message-service';
import { PaginatedResult } from '../../types/pagination';
import { Message } from '../../types/message';
import { Paginator } from "../../shared/paginator/paginator";
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-messages',
  imports: [Paginator, RouterLink, DatePipe],
  templateUrl: './messages.html',
  styleUrl: './messages.css'
})
export class Messages implements OnInit {
  private messageService = inject(MessageService);
  protected fetchedContainer = 'Inbox';
  protected container = 'Inbox';
  protected pageNumber = 1;
  protected pageSize = 10;
  protected paginatedMessages = signal<PaginatedResult<Message> | null>(null);

  tabs = [
    { label: 'Inbox', value: 'Inbox' },
    { label: 'Outbox', value: 'Outbox' }
  ];

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages() {
    this.messageService.getMessages(this.container, this.pageNumber, this.pageSize)
      .subscribe({
        next: (messages) => {
          this.paginatedMessages.set(messages);
          this.fetchedContainer = this.container;
        }
      });
  }

  deleteMessage(event: Event, messageId: string) {
    event.stopPropagation();
    this.messageService.deleteMessage(messageId).subscribe({
      next: () => {
        const current = this.paginatedMessages();
        if (current?.items) {
          this.paginatedMessages.update(prev => {
            if (!prev) return null;
            const newItems = prev.items?.filter(m => m.id !== messageId) || [];

            // Ensure we always produce a valid Pagination object (no undefined),
            // using sensible fallbacks if prev.metadata is missing.
            const fallbackPageSize = prev.metadata?.pageSize ?? this.pageSize ?? 10;
            const fallbackTotalCount = prev.metadata?.totalCount ?? (prev.items?.length ?? newItems.length);
            const fallbackCurrentPage = prev.metadata?.currentPage ?? 1;

            const totalCount = Math.max(0, fallbackTotalCount - 1);
            const totalPages = Math.max(1, Math.ceil(totalCount / fallbackPageSize));
            const currentPage = Math.min(fallbackCurrentPage, Math.max(1, Math.ceil(totalCount / fallbackPageSize)));

            const newMetadata = {
              ...prev.metadata,
              totalCount,
              totalPages,
              currentPage,
              pageSize: fallbackPageSize
            };

            return {
              items: newItems,
              metadata: newMetadata
            };
          });
        }
      }
    });
  }

  get isInbox() {
    return this.fetchedContainer === 'Inbox';
  }

  setContainer(container: string) {
    this.container = container;
    this.pageNumber = 1;
    this.loadMessages();
  }

  onPageChange(event: { pageNumber: number, pageSize: number }) {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageNumber;
    this.loadMessages();
  }

}
