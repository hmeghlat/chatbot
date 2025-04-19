import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReportService } from '../services/report.service';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportsComponent implements OnInit {
  conversations: any[] = [];
  generatingGeneral = false;
  generatingConvId: string | null = null;

  constructor(
    private reportService: ReportService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    this.chatService.getConversations().subscribe({
      next: (data) => this.conversations = data,
      error: (error) => console.error('Error loading conversations', error)
    });
  }

  generateGeneralReport(): void {
    this.generatingGeneral = true;
    this.reportService.generateGeneralReport().subscribe({
      next: (blob) => {
        this.reportService.downloadReport(blob, 'general_report.pdf');
        this.generatingGeneral = false;
      },
      error: (error) => {
        console.error('Error generating general report', error);
        this.generatingGeneral = false;
      }
    });
  }

  generateConversationReport(convId: string): void {
    this.generatingConvId = convId;
    this.reportService.generateConversationReport(convId).subscribe({
      next: (blob) => {
        this.reportService.downloadReport(blob, `conversation_report_${convId}.pdf`);
        this.generatingConvId = null;
      },
      error: (error) => {
        console.error(`Error generating report for conversation ${convId}`, error);
        this.generatingConvId = null;
      }
    });
  }

  goToChat(): void {
    this.router.navigate(['/chat']);
  }
}
