"use client";

// Export controls for the checklist.
//
// Two exports are offered, both built without any external library by writing
// a small HTML document into a new browser window and triggering the print
// dialog (where the user can "Save as PDF"):
//
//   1. PDF export      - a full record: categories, selected tier, prices,
//                         and the estimated total.
//   2. Printable list  - a minimal, checkbox-only sheet for physical move-in
//                         use, with no pricing or budget data.

import { budgetTierLabel, formatBudget } from "@/lib/budget";
import { climateLabel, dormLabel } from "@/lib/options";
import type { Budget, OnboardingAnswers } from "@/lib/types";

// A flattened, display-ready view of one item for exporting.
export interface ExportItem {
  name: string;
  tierLabel: string;
  price: number;
  owned: boolean;
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

// Escape the few characters that could break our generated HTML.
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// A short, file-name-friendly version of the school name.
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

// Open a new window, write the HTML, and trigger printing once it loads.
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

export default function ExportButtons({
  answers,
  categories,
  estimatedTotal,
}: ExportButtonsProps) {
  // ----- Export 1: detailed PDF -----
  function exportPdf() {
    const sections = categories
      .map((category) => {
        const rows = category.items
          .map(
            (item) => `
              <tr class="${item.owned ? "owned" : ""}">
                <td>${escapeHtml(item.name)}</td>
                <td>${item.owned ? "Already owned" : escapeHtml(item.tierLabel)}</td>
                <td class="price">${item.owned ? "-" : "$" + item.price.toLocaleString()}</td>
              </tr>`
          )
          .join("");
        return `
          <h2>${escapeHtml(category.name)}</h2>
          <table>
            <thead><tr><th>Item</th><th>Tier</th><th class="price">Price</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>`;
      })
      .join("");

    const body = `
      <h1>Dorm Living OS - ${escapeHtml(answers.school)}</h1>
      <p class="meta">
        ${escapeHtml(climateLabel(answers.climate))} climate -
        ${escapeHtml(dormLabel(answers.dormType))} -
        ${escapeHtml(budgetLine(answers.budget, estimatedTotal))}
      </p>
      ${sections}
      <p class="total">Estimated total: $${estimatedTotal.toLocaleString()}</p>`;

    const styles = `
      body{font-family:system-ui,-apple-system,sans-serif;color:#0f172a;margin:32px;}
      h1{font-size:22px;margin-bottom:4px;}
      h2{font-size:16px;margin-top:24px;border-bottom:2px solid #6366f1;padding-bottom:4px;}
      .meta{color:#475569;font-size:13px;margin-top:0;}
      table{width:100%;border-collapse:collapse;margin-top:8px;font-size:13px;}
      th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #e2e8f0;}
      .price{text-align:right;}
      tr.owned td{color:#94a3b8;text-decoration:line-through;}
      .total{margin-top:24px;font-size:18px;font-weight:700;text-align:right;}`;

    printHtml(`dorm-checklist-${safeSchool(answers.school)}`, body, styles);
  }

  // ----- Export 2: minimal printable checklist (no prices) -----
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

    const styles = `
      body{font-family:system-ui,-apple-system,sans-serif;color:#000;margin:32px;}
      h1{font-size:22px;margin-bottom:2px;}
      h2{font-size:15px;margin-top:20px;}
      .meta{color:#555;font-size:13px;margin-top:0;}
      ul{list-style:none;padding:0;margin:8px 0;column-count:2;column-gap:32px;}
      li{font-size:14px;margin:6px 0;display:flex;align-items:center;break-inside:avoid;}
      .box{display:inline-block;width:14px;height:14px;border:1.5px solid #000;border-radius:3px;margin-right:10px;}`;

    printHtml(`dorm-move-in-${safeSchool(answers.school)}`, body, styles);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={exportPdf}
        className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
      >
        Export PDF
      </button>
      <button
        type="button"
        onClick={exportPrintable}
        className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
      >
        Printable checklist
      </button>
    </div>
  );
}
