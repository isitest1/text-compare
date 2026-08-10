(function () {
  "use strict";

  const leftInput = document.getElementById("leftInput");
  const rightInput = document.getElementById("rightInput");
  const compareBtn = document.getElementById("compareBtn");
  const swapBtn = document.getElementById("swapBtn");
  const clearBtn = document.getElementById("clearBtn");
  const ignoreWhitespace = document.getElementById("ignoreWhitespace");
  const wrapLines = document.getElementById("wrapLines");

  const summary = document.getElementById("summary");
  const addedCount = document.getElementById("addedCount");
  const removedCount = document.getElementById("removedCount");
  const changedCount = document.getElementById("changedCount");

  const diffArea = document.getElementById("diffArea");
  const diffGrid = document.getElementById("diffGrid");

  function splitLines(value) {
    const lines = value.split("\n");
    if (lines[lines.length - 1] === "") {
      lines.pop();
    }
    return lines;
  }

  function computeDiff(leftText, rightText, ignoreWs) {
    const parts = Diff.diffLines(leftText, rightText, { ignoreWhitespace: ignoreWs });

    const leftRows = [];
    const rightRows = [];
    let leftLineNum = 1;
    let rightLineNum = 1;
    let added = 0;
    let removed = 0;
    let changed = 0;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (!part.added && !part.removed) {
        for (const line of splitLines(part.value)) {
          leftRows.push({ type: "unchanged", num: leftLineNum++, text: line });
          rightRows.push({ type: "unchanged", num: rightLineNum++, text: line });
        }
        continue;
      }

      if (part.removed) {
        const next = parts[i + 1];
        const removedLines = splitLines(part.value);

        if (next && next.added) {
          const addedLines = splitLines(next.value);
          const max = Math.max(removedLines.length, addedLines.length);

          for (let j = 0; j < max; j++) {
            const l = removedLines[j];
            const r = addedLines[j];

            if (l !== undefined && r !== undefined) {
              // diffWords relies on \w word boundaries and cannot split
              // CJK text (no spaces), so it marks whole lines as one
              // token. diffChars gives meaningful inline highlights
              // regardless of the script being compared.
              const charDiff = Diff.diffChars(l, r, { ignoreCase: false });
              leftRows.push({
                type: "changed",
                num: leftLineNum++,
                wordParts: charDiff.filter((p) => !p.added),
              });
              rightRows.push({
                type: "changed",
                num: rightLineNum++,
                wordParts: charDiff.filter((p) => !p.removed),
              });
              changed++;
            } else if (l !== undefined) {
              leftRows.push({ type: "removed", num: leftLineNum++, text: l });
              rightRows.push({ type: "empty" });
              removed++;
            } else if (r !== undefined) {
              leftRows.push({ type: "empty" });
              rightRows.push({ type: "added", num: rightLineNum++, text: r });
              added++;
            }
          }
          i++; // next part consumed as part of the changed block
        } else {
          for (const line of removedLines) {
            leftRows.push({ type: "removed", num: leftLineNum++, text: line });
            rightRows.push({ type: "empty" });
            removed++;
          }
        }
        continue;
      }

      if (part.added) {
        for (const line of splitLines(part.value)) {
          leftRows.push({ type: "empty" });
          rightRows.push({ type: "added", num: rightLineNum++, text: line });
          added++;
        }
      }
    }

    return { leftRows, rightRows, stats: { added, removed, changed } };
  }

  function renderLineContent(container, row) {
    if (row.type === "changed" && row.wordParts) {
      for (const p of row.wordParts) {
        const span = document.createElement("span");
        span.textContent = p.value;
        if (p.added) span.className = "word-added";
        if (p.removed) span.className = "word-removed";
        container.appendChild(span);
      }
    } else if (row.text !== undefined) {
      container.textContent = row.text.length ? row.text : " ";
    }
  }

  // Both sides are rendered as one CSS grid (num/content columns per
  // side, one grid row per line index) instead of two independent
  // scrolling panes. A CSS grid row's height is shared by every cell
  // in that row, so wrapped content on either side automatically
  // keeps the two sides vertically in sync.
  function renderGrid(leftRows, rightRows) {
    const headers = diffGrid.querySelectorAll(".diff-grid-header");
    diffGrid.textContent = "";
    headers.forEach((h) => diffGrid.appendChild(h));

    const fragment = document.createDocumentFragment();
    const max = Math.max(leftRows.length, rightRows.length);

    for (let i = 0; i < max; i++) {
      const l = leftRows[i] || { type: "empty" };
      const r = rightRows[i] || { type: "empty" };

      fragment.appendChild(buildCell(l, "num", "cell-left-num"));
      fragment.appendChild(buildCell(l, "content", "cell-left-content"));
      fragment.appendChild(buildCell(r, "num", "cell-right-num"));
      fragment.appendChild(buildCell(r, "content", "cell-right-content"));
    }

    diffGrid.appendChild(fragment);
  }

  function buildCell(row, kind, extraClass) {
    const cell = document.createElement("div");
    cell.className = "diff-cell " + kind + " type-" + row.type + " " + extraClass;
    if (kind === "num") {
      cell.textContent = row.num !== undefined ? String(row.num) : "";
    } else {
      renderLineContent(cell, row);
    }
    return cell;
  }

  function clearGrid() {
    const headers = diffGrid.querySelectorAll(".diff-grid-header");
    diffGrid.textContent = "";
    headers.forEach((h) => diffGrid.appendChild(h));
  }

  function compare() {
    const leftText = leftInput.value;
    const rightText = rightInput.value;
    const ignoreWs = ignoreWhitespace.checked;

    const { leftRows, rightRows, stats } = computeDiff(leftText, rightText, ignoreWs);

    renderGrid(leftRows, rightRows);

    addedCount.textContent = String(stats.added);
    removedCount.textContent = String(stats.removed);
    changedCount.textContent = String(stats.changed);

    summary.hidden = false;
    diffArea.hidden = false;
  }

  function swap() {
    const tmp = leftInput.value;
    leftInput.value = rightInput.value;
    rightInput.value = tmp;

    if (!diffArea.hidden) {
      compare();
    }
  }

  function clearAll() {
    leftInput.value = "";
    rightInput.value = "";
    summary.hidden = true;
    diffArea.hidden = true;
    clearGrid();
    leftInput.focus();
  }

  compareBtn.addEventListener("click", compare);
  swapBtn.addEventListener("click", swap);
  clearBtn.addEventListener("click", clearAll);

  wrapLines.addEventListener("change", () => {
    diffGrid.classList.toggle("nowrap", !wrapLines.checked);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      compare();
    }
  });
})();
