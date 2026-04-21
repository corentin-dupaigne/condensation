#!/usr/bin/env python3
"""Convertit un fichier .trx (Visual Studio Test Results) en rapport HTML.

Usage : trx-to-html.py <input.trx> <output.html>
"""
from __future__ import annotations

import html
import sys
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path

NS = "{http://microsoft.com/schemas/VisualStudio/TeamTest/2010}"


def parse_trx(path: Path):
    tree = ET.parse(path)
    root = tree.getroot()

    definitions = {}
    for td in root.iter(f"{NS}UnitTest"):
        tid = td.get("id")
        method = td.find(f"{NS}TestMethod")
        class_name = method.get("className", "") if method is not None else ""
        definitions[tid] = {
            "name": td.get("name", ""),
            "class": class_name.split(",")[0],
        }

    results = []
    for utr in root.iter(f"{NS}UnitTestResult"):
        tid = utr.get("testId")
        defn = definitions.get(tid, {"name": utr.get("testName", ""), "class": ""})
        outcome = utr.get("outcome", "Unknown")
        duration = utr.get("duration", "00:00:00")
        error_info = utr.find(f"{NS}Output/{NS}ErrorInfo")
        message = stacktrace = ""
        if error_info is not None:
            msg = error_info.find(f"{NS}Message")
            st = error_info.find(f"{NS}StackTrace")
            if msg is not None and msg.text:
                message = msg.text
            if st is not None and st.text:
                stacktrace = st.text
        stdout_el = utr.find(f"{NS}Output/{NS}StdOut")
        stdout = stdout_el.text if stdout_el is not None and stdout_el.text else ""
        results.append({
            "name": defn["name"],
            "class": defn["class"],
            "outcome": outcome,
            "duration": duration,
            "message": message,
            "stacktrace": stacktrace,
            "stdout": stdout,
        })

    times = root.find(f"{NS}Times")
    summary = root.find(f"{NS}ResultSummary")
    counters = summary.find(f"{NS}Counters") if summary is not None else None
    meta = {
        "start": times.get("start") if times is not None else "",
        "finish": times.get("finish") if times is not None else "",
        "total": int(counters.get("total", 0)) if counters is not None else len(results),
        "passed": int(counters.get("passed", 0)) if counters is not None else 0,
        "failed": int(counters.get("failed", 0)) if counters is not None else 0,
        "not_executed": int(counters.get("notExecuted", 0)) if counters is not None else 0,
        "outcome": summary.get("outcome") if summary is not None else "",
    }
    return meta, results


def duration_to_seconds(d: str) -> float:
    # Format "HH:MM:SS.fffffff"
    try:
        h, m, s = d.split(":")
        return int(h) * 3600 + int(m) * 60 + float(s)
    except Exception:
        return 0.0


BADGE = {
    "Passed": ("#10b981", "PASS"),
    "Failed": ("#ef4444", "FAIL"),
    "NotExecuted": ("#9ca3af", "SKIP"),
    "Inconclusive": ("#f59e0b", "INCO"),
}


def render(meta, results) -> str:
    by_class: dict[str, list[dict]] = defaultdict(list)
    for r in results:
        by_class[r["class"] or "(no class)"].append(r)

    total = meta["total"] or len(results)
    passed = meta["passed"] or sum(1 for r in results if r["outcome"] == "Passed")
    failed = meta["failed"] or sum(1 for r in results if r["outcome"] == "Failed")
    skipped = meta["not_executed"] or sum(1 for r in results if r["outcome"] == "NotExecuted")
    total_dur = sum(duration_to_seconds(r["duration"]) for r in results)
    pct = (passed / total * 100.0) if total else 0.0

    rows = []
    for cls, items in sorted(by_class.items()):
        cls_counter = Counter(r["outcome"] for r in items)
        cls_dur = sum(duration_to_seconds(r["duration"]) for r in items)
        rows.append(f"""
        <section class="suite">
          <header class="suite-header">
            <h2>{html.escape(cls)}</h2>
            <div class="suite-stats">
              <span class="pill pill-pass">{cls_counter.get('Passed', 0)} passed</span>
              <span class="pill pill-fail">{cls_counter.get('Failed', 0)} failed</span>
              <span class="pill pill-skip">{cls_counter.get('NotExecuted', 0)} skipped</span>
              <span class="pill">{cls_dur:.2f}s</span>
            </div>
          </header>
          <table class="tests">
            <thead><tr><th>Statut</th><th>Test</th><th>Durée</th></tr></thead>
            <tbody>
        """)
        for r in sorted(items, key=lambda x: (x["outcome"] != "Failed", x["name"])):
            color, label = BADGE.get(r["outcome"], ("#6b7280", r["outcome"][:4].upper()))
            dur = duration_to_seconds(r["duration"])
            detail = ""
            if r["outcome"] == "Failed" and (r["message"] or r["stacktrace"]):
                detail = f"""
                <tr class="detail"><td colspan="3">
                  <details open>
                    <summary>Erreur</summary>
                    <pre class="err">{html.escape(r['message'])}</pre>
                    {f'<pre class="trace">{html.escape(r["stacktrace"])}</pre>' if r['stacktrace'] else ''}
                  </details>
                </td></tr>
                """
            rows.append(f"""
              <tr class="row row-{r['outcome'].lower()}">
                <td><span class="badge" style="background:{color}">{label}</span></td>
                <td class="name">{html.escape(r['name'])}</td>
                <td class="dur">{dur:.2f}s</td>
              </tr>
              {detail}
            """)
        rows.append("</tbody></table></section>")

    return f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Rapport E2E — Condensation</title>
<style>
  :root {{ color-scheme: light dark; }}
  * {{ box-sizing: border-box; }}
  body {{ margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
         background: #0f172a; color: #e2e8f0; }}
  header.page {{ padding: 2rem 3rem; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                border-bottom: 1px solid #334155; }}
  header.page h1 {{ margin: 0 0 .25rem; font-size: 1.75rem; }}
  header.page .sub {{ color: #94a3b8; font-size: .9rem; }}
  .summary {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem;
             padding: 2rem 3rem; }}
  .card {{ background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.25rem; }}
  .card .label {{ color: #94a3b8; font-size: .75rem; text-transform: uppercase; letter-spacing: .05em; }}
  .card .value {{ font-size: 2rem; font-weight: 700; margin-top: .25rem; }}
  .card.pass .value {{ color: #10b981; }}
  .card.fail .value {{ color: #ef4444; }}
  .card.skip .value {{ color: #9ca3af; }}
  .card.rate .value {{ color: #60a5fa; }}
  .progress {{ height: 8px; background: #334155; border-radius: 999px; margin: 0 3rem 2rem; overflow: hidden; }}
  .progress > div {{ height: 100%; background: linear-gradient(90deg, #10b981, #34d399); }}
  main {{ padding: 0 3rem 3rem; }}
  .suite {{ background: #1e293b; border: 1px solid #334155; border-radius: 12px; margin-bottom: 1.5rem;
           overflow: hidden; }}
  .suite-header {{ display: flex; align-items: center; justify-content: space-between; gap: 1rem;
                  padding: 1rem 1.25rem; background: #0f172a; border-bottom: 1px solid #334155; }}
  .suite-header h2 {{ margin: 0; font-size: 1.05rem; font-weight: 600; }}
  .suite-stats {{ display: flex; gap: .5rem; flex-wrap: wrap; }}
  .pill {{ padding: .15rem .6rem; border-radius: 999px; font-size: .75rem; background: #334155; color: #cbd5e1; }}
  .pill-pass {{ background: #064e3b; color: #6ee7b7; }}
  .pill-fail {{ background: #7f1d1d; color: #fca5a5; }}
  .pill-skip {{ background: #374151; color: #d1d5db; }}
  table.tests {{ width: 100%; border-collapse: collapse; font-size: .9rem; }}
  table.tests th, table.tests td {{ padding: .65rem 1.25rem; text-align: left; border-bottom: 1px solid #334155; }}
  table.tests th {{ font-weight: 500; color: #94a3b8; font-size: .75rem; text-transform: uppercase; }}
  table.tests tr:last-child td {{ border-bottom: 0; }}
  .badge {{ display: inline-block; padding: .15rem .55rem; border-radius: 4px; color: #fff;
           font-size: .7rem; font-weight: 700; letter-spacing: .03em; }}
  td.name {{ font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .82rem; }}
  td.dur {{ color: #94a3b8; width: 80px; text-align: right; }}
  tr.row-failed td.name {{ color: #fca5a5; }}
  tr.detail td {{ background: #0b1220; padding: .5rem 1.25rem 1rem; }}
  details summary {{ cursor: pointer; color: #fca5a5; font-size: .8rem; padding: .25rem 0; }}
  pre.err, pre.trace {{ margin: .5rem 0 0; padding: .75rem; border-radius: 6px; background: #020617;
                       color: #fca5a5; font-size: .75rem; overflow-x: auto; white-space: pre-wrap;
                       word-break: break-word; border: 1px solid #334155; }}
  pre.trace {{ color: #94a3b8; }}
  footer {{ text-align: center; color: #64748b; font-size: .75rem; padding: 2rem; }}
</style>
</head>
<body>
  <header class="page">
    <h1>Rapport E2E — Condensation</h1>
    <div class="sub">
      Démarré : {html.escape(meta['start'])} &middot;
      Terminé : {html.escape(meta['finish'])} &middot;
      Résultat global : <strong>{html.escape(meta['outcome'] or ('Failed' if failed else 'Passed'))}</strong>
    </div>
  </header>
  <section class="summary">
    <div class="card"><div class="label">Total</div><div class="value">{total}</div></div>
    <div class="card pass"><div class="label">Passés</div><div class="value">{passed}</div></div>
    <div class="card fail"><div class="label">Échoués</div><div class="value">{failed}</div></div>
    <div class="card skip"><div class="label">Ignorés</div><div class="value">{skipped}</div></div>
    <div class="card rate"><div class="label">Réussite</div><div class="value">{pct:.1f}%</div></div>
    <div class="card"><div class="label">Durée totale</div><div class="value">{total_dur:.1f}s</div></div>
  </section>
  <div class="progress"><div style="width:{pct:.2f}%"></div></div>
  <main>
    {''.join(rows)}
  </main>
  <footer>Généré depuis {html.escape(str(Path('results.trx').name))} — Condensation e2e suite</footer>
</body>
</html>
"""


def main():
    if len(sys.argv) != 3:
        print("Usage: trx-to-html.py <input.trx> <output.html>", file=sys.stderr)
        sys.exit(2)
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    meta, results = parse_trx(src)
    dst.write_text(render(meta, results), encoding="utf-8")
    print(f"HTML report written to {dst}")


if __name__ == "__main__":
    main()
