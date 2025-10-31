{{ getDisplayValue(item)?.replace(/\s*-\s*$/, '') }}


const val = keyDetails?.get('greenSustainableField')?.value;

let greenSustainableField = this.writeOpportunity.getValueFromLov(
  val == null
    ? []
    : Array.isArray(val)
    ? val
    : typeof val === 'object' && val.value
    ? [val.value]
    : [val]
);

excel-page.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-excel-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './excel-page.component.html',
  styleUrls: ['./excel-page.component.css']
})
export class ExcelPageComponent {
  data: any[] = [];
  columns: string[] = [];
  fileName = 'data.xlsx'; // will update to uploaded file name if provided
  hasFile = false;

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.fileName = file.name;
    const reader = new FileReader();

    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];

      // defval:'' keeps empty cells instead of dropping keys
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      this.data = json;
      this.columns = this.extractColumns(json);
      this.hasFile = true;
    };

    reader.readAsArrayBuffer(file);
  }

  extractColumns(rows: any[]): string[] {
    const set = new Set<string>();
    rows.forEach(r => Object.keys(r).forEach(k => set.add(k)));
    const cols = Array.from(set);
    // keep a stable order: as-is from first row, then extras
    if (rows.length) {
      const first = Object.keys(rows[0]);
      const extras = cols.filter(c => !first.includes(c));
      return [...first, ...extras];
    }
    return cols;
  }

  addRow() {
    const newRow: any = {};
    this.columns.forEach(c => newRow[c] = '');
    this.data = [...this.data, newRow];
  }

  deleteRow(index: number) {
    const copy = [...this.data];
    copy.splice(index, 1);
    this.data = copy;
  }

  addColumn() {
    const colName = prompt('Enter new column name:');
    if (!colName) return;
    if (!this.columns.includes(colName)) {
      this.columns = [...this.columns, colName];
      this.data = this.data.map(row => ({ ...row, [colName]: row[colName] ?? '' }));
    }
  }

  download() {
    // Ensure every row has all columns (avoids missing keys)
    const normalized = this.data.map(r => {
      const obj: any = {};
      this.columns.forEach(c => obj[c] = r[c] ?? '');
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(normalized, { header: this.columns });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const base = this.fileName.replace(/\.(xlsx|xls)$/i, '');
    XLSX.writeFile(workbook, `${base}_updated.xlsx`);
  }

  clear() {
    this.data = [];
    this.columns = [];
    this.hasFile = false;
    this.fileName = 'data.xlsx';
  }
}



excel-page.component.html

<div style="max-width: 1100px; margin: 24px auto; padding: 12px;">
  <h2>Excel Editor (No Backend)</h2>

  <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin: 12px 0;">
    <input type="file" accept=".xlsx,.xls" (change)="onFileChange($event)" />
    <button (click)="addRow()" [disabled]="!columns.length">Add Row</button>
    <button (click)="addColumn()" [disabled]="!hasFile">Add Column</button>
    <button (click)="download()" [disabled]="!hasFile">Download Updated Excel</button>
    <button (click)="clear()" [disabled]="!hasFile">Clear</button>
  </div>

  <div *ngIf="!hasFile" style="opacity: 0.8; margin-top: 8px;">
    <em>Upload an Excel file to start editing.</em>
  </div>

  <div *ngIf="columns.length" style="overflow: auto; border: 1px solid #ddd; border-radius: 8px;">
    <table style="width: 100%; border-collapse: collapse; min-width: 600px;">
      <thead>
        <tr>
          <th *ngFor="let col of columns" style="text-align: left; padding: 8px; border-bottom: 1px solid #eee;">
            {{ col }}
          </th>
          <th style="padding: 8px; border-bottom: 1px solid #eee;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let row of data; let i = index" style="border-top: 1px solid #f3f3f3;">
          <td *ngFor="let col of columns" style="padding: 6px;">
            <input [(ngModel)]="row[col]" style="width: 100%; box-sizing: border-box;" />
          </td>
          <td style="padding: 6px; white-space: nowrap;">
            <button (click)="deleteRow(i)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <p *ngIf="hasFile" style="margin-top: 10px; opacity: 0.8;">
    File: <strong>{{ fileName }}</strong>
  </p>
</div>



excel-page.component.css

button {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  cursor: pointer;
  background: #fff;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
input[type="file"] {
  border: 1px dashed #ccc;
  padding: 6px;
  border-radius: 8px;
}
table input {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
}



