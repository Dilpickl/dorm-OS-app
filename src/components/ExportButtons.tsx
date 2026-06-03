"use client";

import { Button } from "@/components/ui/Button";
import { budgetTierLabel, formatBudget } from "@/lib/budget";
import { climateLabel, dormLabel } from "@/lib/options";
import type { Budget, OnboardingAnswers } from "@/lib/types";

export interface ExportItem {
  name: string;
  tierLabel: string;
  price: number;
  owned: boolean;
  /** Catalog affiliate URL; omitted for custom items and placeholders. */
  link?: string | null;
}

export interface ExportCategory {
  name: string;
  items: ExportItem[];
}

interface ExportButtonsProps {
  answers: OnboardingAnswers;
  categories: ExportCategory[];
  estimatedTotal: number;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/"/g, "&quot;");
}

function exportLinkHtml(link: string | null | undefined): string {
  if (!link || link === "#") {
    return '<span class="no-link">—</span>';
  }
  return `<a class="item-link" href="${escapeAttr(link)}">${escapeHtml(link)}</a>`;
}

function safeSchool(school: string): string {
  return (
    school
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "list"
  );
}

function budgetLine(budget: Budget, estimatedTotal: number): string {
  if (budget === "unknown") {
    return `Estimated budget: $${estimatedTotal.toLocaleString()} (${budgetTierLabel(
      estimatedTotal
    )})`;
  }
  return `Target budget: ${formatBudget(budget)} (${budgetTierLabel(budget)})`;
}

function printHtml(title: string, bodyHtml: string, styles: string) {
  const win = window.open("", "_blank");
  if (!win) {
    alert("Please allow pop-ups to export your checklist.");
    return;
  }
  win.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(
      title
    )}</title><style>${styles}</style></head><body>${bodyHtml}` +
      `<script>window.onload=function(){window.print();}</script></body></html>`
  );
  win.document.close();
}

const PDF_STYLES = `
  *{box-sizing:border-box;}
  body{
    font-family:system-ui,-apple-system,"Segoe UI",sans-serif;
    color:#1e293b;
    margin:0;
    padding:40px 48px;
    background:#fffdf5;
  }
  .header{
    background:#fff;
    border:2px solid #1e293b;
    border-radius:16px;
    padding:24px 28px;
    margin-bottom:28px;
    box-shadow:6px 6px 0 0 #1e293b;
  }
  h1{
    font-size:26px;
    margin:0 0 8px;
    color:#1e293b;
    letter-spacing:-0.02em;
    font-weight:800;
  }
  .meta{
    color:#64748b;
    font-size:14px;
    margin:0;
    line-height:1.5;
  }
  .section{
    background:#fff;
    border:2px solid #1e293b;
    border-radius:12px;
    padding:16px 20px 8px;
    margin-bottom:20px;
    break-inside:avoid;
    box-shadow:4px 4px 0 0 #e2e8f0;
  }
  h2{
    font-size:15px;
    margin:0 0 12px;
    color:#8b5cf6;
    font-weight:800;
    text-transform:uppercase;
    letter-spacing:0.04em;
  }
  table{
    width:100%;
    border-collapse:collapse;
    table-layout:fixed;
    font-size:13px;
  }
  col.col-item{width:34%;}
  col.col-link{width:30%;}
  col.col-tier{width:22%;}
  col.col-price{width:14%;}
  thead th{
    text-align:left;
    padding:8px 10px;
    font-size:11px;
    text-transform:uppercase;
    letter-spacing:0.06em;
    color:#1e293b;
    background:#f1f5f9;
    border-bottom:2px solid #1e293b;
  }
  th.col-price,td.col-price{
    text-align:right;
    padding-right:12px;
  }
  th.col-tier,td.col-tier{
    text-align:left;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }
  th.col-link,td.col-link{
    text-align:left;
    word-break:break-all;
    font-size:11px;
  }
  .item-link{
    color:#7c3aed;
    text-decoration:underline;
    font-weight:600;
  }
  .no-link{color:#94a3b8;}
  tbody td{
    padding:10px;
    border-bottom:1px solid #e2e8f0;
    vertical-align:middle;
  }
  tbody tr:last-child td{border-bottom:none;}
  tr.owned td:not(.col-link){
    color:#94a3b8;
    text-decoration:line-through;
  }
  .total-wrap{
    margin-top:24px;
    text-align:right;
  }
  .total{
    display:inline-block;
    background:#8b5cf6;
    color:#fff;
    font-size:18px;
    font-weight:800;
    padding:12px 20px;
    border-radius:9999px;
    border:2px solid #1e293b;
    box-shadow:4px 4px 0 0 #1e293b;
  }
  @media print{
    body{background:#fff;padding:24px;}
    .header,.section{break-inside:avoid;}
  }
`;

const PRINTABLE_STYLES = `
  body{font-family:system-ui,-apple-system,sans-serif;color:#1e293b;margin:32px;background:#fffdf5;}
  h1{font-size:22px;margin-bottom:2px;color:#1e293b;font-weight:800;}
  h2{font-size:15px;margin-top:20px;color:#8b5cf6;font-weight:700;}
  .meta{color:#64748b;font-size:13px;margin-top:0;}
  ul{list-style:none;padding:0;margin:8px 0;column-count:2;column-gap:32px;}
  li{font-size:14px;margin:6px 0;display:flex;align-items:center;break-inside:avoid;}
  .box{display:inline-block;width:14px;height:14px;border:2px solid #1e293b;border-radius:4px;margin-right:10px;}
`;

export default function ExportButtons({
  answers,
  categories,
  estimatedTotal,
}: ExportButtonsProps) {
  function exportPdf() {
    const sections = categories
      .map((category) => {
        const rows = category.items
          .map(
            (item) => `
              <tr class="${item.owned ? "owned" : ""}">
                <td>${escapeHtml(item.name)}</td>
                <td class="col-link">${exportLinkHtml(item.link)}</td>
                <td class="col-tier">${item.owned ? "Already owned" : escapeHtml(item.tierLabel)}</td>
                <td class="col-price">${item.owned ? "—" : "$" + item.price.toLocaleString()}</td>
              </tr>`
          )
          .join("");
        return `
          <div class="section">
            <h2>${escapeHtml(category.name)}</h2>
            <table>
              <colgroup>
                <col class="col-item" />
                <col class="col-link" />
                <col class="col-tier" />
                <col class="col-price" />
              </colgroup>
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="col-link">Shop link</th>
                  <th class="col-tier">Tier</th>
                  <th class="col-price">Price</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>`;
      })
      .join("");

    const body = `
      <div class="header">
        <h1>Dorm Living OS — ${escapeHtml(answers.school)}</h1>
        <p class="meta">
          ${escapeHtml(climateLabel(answers.climate))} climate ·
          ${escapeHtml(dormLabel(answers.dormType))} ·
          ${escapeHtml(budgetLine(answers.budget, estimatedTotal))}
        </p>
      </div>
      ${sections}
      <div class="total-wrap">
        <p class="total">Estimated total: $${estimatedTotal.toLocaleString()}</p>
      </div>`;

    printHtml(`dorm-checklist-${safeSchool(answers.school)}`, body, PDF_STYLES);
  }

  function exportPrintable() {
    const sections = categories
      .map((category) => {
        const rows = category.items
          .map(
            (item) =>
              `<li><span class="box"></span>${escapeHtml(item.name)}</li>`
          )
          .join("");
        return `<h2>${escapeHtml(category.name)}</h2><ul>${rows}</ul>`;
      })
      .join("");

    const body = `
      <h1>Dorm Move-In Checklist</h1>
      <p class="meta">${escapeHtml(answers.school)}</p>
      ${sections}`;

    printHtml(`dorm-move-in-${safeSchool(answers.school)}`, body, PRINTABLE_STYLES);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button type="button" onClick={exportPdf}>
        Export PDF
      </Button>
      <Button type="button" variant="secondary" onClick={exportPrintable}>
        Printable checklist
      </Button>
    </div>
  );
}
