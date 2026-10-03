const form = document.querySelector('#set-form');
const rows = document.querySelector('#sets');
const status = document.querySelector('#demo-status');
const review = document.querySelector('#review-button');
const suggestion = document.querySelector('#suggestion');
const machine = document.querySelector('#machine-name');
const description = document.querySelector('#review-description');
let count = 1;
let accepted = false;
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity() || count >= 8) return;
  const data = new FormData(form);
  const row = document.createElement('tr');
  const number = document.createElement('th');
  number.scope = 'row';
  number.textContent = String(++count).padStart(2, '0');
  row.append(number);
  for (const key of ['weight', 'reps']) {
    const cell = document.createElement('td');
    cell.textContent = data.get(key);
    row.append(cell);
  }
  const saved = document.createElement('td');
  const label = document.createElement('span');
  label.className = 'saved';
  label.textContent = '✓ Saved';
  saved.append(label);
  row.append(saved);
  rows.append(row);
  status.textContent = `Set ${count} added to this demo. ${accepted ? 'Your machine name and earlier sets stay in place.' : 'You can review the machine suggestion whenever you’re ready.'}`;
  if (count === 8) {
    form.querySelector('button').disabled = true;
    status.textContent = 'Eight example sets logged. Reset the demo to start again.';
  }
});
review.addEventListener('click', () => {
  if (accepted) {
    accepted = false;
    machine.textContent = 'Unidentified machine';
    review.textContent = 'Review suggestion';
    description.textContent = 'A suggestion is waiting for your review.';
    status.textContent = `Name undone. All ${count} example sets are still here.`;
    return;
  }
  suggestion.hidden = !suggestion.hidden;
  review.setAttribute('aria-expanded', String(!suggestion.hidden));
});
review.setAttribute('aria-controls', 'suggestion');
review.setAttribute('aria-expanded', 'false');
document.querySelector('#accept-button').addEventListener('click', () => {
  accepted = true;
  machine.textContent = 'Leg press';
  suggestion.hidden = true;
  review.setAttribute('aria-expanded', 'false');
  review.textContent = 'Undo name';
  description.textContent = 'Suggestion accepted. You can always undo it.';
  status.textContent = `Machine named. All ${count} example sets are still here.`;
  review.focus();
});
document.querySelector('#dismiss-button').addEventListener('click', () => {
  suggestion.hidden = true;
  review.setAttribute('aria-expanded', 'false');
  status.textContent = 'No rush. Keep logging and review the suggestion later.';
  review.focus();
});
document.querySelector('#reset-button').addEventListener('click', () => {
  count = 1;
  accepted = false;
  while (rows.children.length > 1) rows.lastElementChild.remove();
  form.reset();
  form.querySelector('button').disabled = false;
  machine.textContent = 'Unidentified machine';
  suggestion.hidden = true;
  review.textContent = 'Review suggestion';
  review.setAttribute('aria-expanded', 'false');
  description.textContent = 'A suggestion is waiting for your review.';
  status.textContent = 'Demo reset. Try logging a set before reviewing the suggestion.';
});
