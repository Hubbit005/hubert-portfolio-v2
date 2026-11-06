/* Work-area map (#matrix): a real table, rows are projects, columns are areas of work, a dot means
   the area was part of the project (only what the "Role" lines on the page say; no numbers).
   Motion: the dots pop in column by column when the table comes into view. Hovering (or focusing
   the project link in) a row lights the row and dims the rest; hovering a column does the same for
   the column. Reduced motion or no JS: the dots are simply there. */

export function initChart({ reduced, gsap, ScrollTrigger }) {
  const box = document.getElementById('matrix');
  if (!box) return;
  const table = box.querySelector('table');

  // Highlight: one data attribute on the table, CSS does the rest (opacity only).
  const set = (row, col) => {
    if (row) table.dataset.row = row; else delete table.dataset.row;
    if (col) table.dataset.col = col; else delete table.dataset.col;
  };
  [...table.tBodies[0].rows].forEach((tr, i) => { tr.dataset.r = String(i + 1); });
  table.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const cell = e.target.closest('th, td');
    if (!cell || !table.contains(cell)) return;
    const tr = cell.parentElement;
    if (cell.scope === 'col') set(null, cell.dataset.col);
    else if (tr.dataset.r) set(tr.dataset.r, null);
  });
  table.addEventListener('pointerleave', () => set(null, null));
  table.addEventListener('focusin', (e) => { const tr = e.target.closest('tr'); if (tr?.dataset.r) set(tr.dataset.r, null); });
  table.addEventListener('focusout', () => set(null, null));

  if (reduced || !gsap || !ScrollTrigger) return;
  if (box.getBoundingClientRect().top < window.innerHeight * 0.92) return; // already on screen: stays
  const dots = [...table.querySelectorAll('tbody .matrix__dot')];
  gsap.set(dots, { scale: 0 });
  ScrollTrigger.create({
    trigger: table, start: 'top 85%', once: true,
    onEnter: () => {
      const byCol = (d) => +d.parentElement.dataset.col;
      gsap.to(dots, {
        scale: 1, duration: 0.55, ease: 'back.out(2.4)',
        delay: (i) => (byCol(dots[i]) - 1) * 0.09 + (+dots[i].closest('tr').dataset.r - 1) * 0.025,
      });
    },
  });
}
