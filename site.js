// The installer's https address: always the newest release, so a new version needs
// no change here. With none, Download says it is not up yet, rather than going nowhere.
const DOWNLOAD_URL = 'https://github.com/JDanquah/trail-download/releases/latest/download/Trail-Setup.exe';

// The invitation email's button comes here with ?invited=1. Nothing personal is
// in the address; the steps are the same for everybody.
if (new URLSearchParams(location.search).has('invited')) {
  document.getElementById('invited').hidden = false;
}

for (const link of document.querySelectorAll('[data-download]')) {
  if (DOWNLOAD_URL) {
    link.href = DOWNLOAD_URL;
    continue;
  }
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const note = document.querySelector('[data-not-ready]');
    note.hidden = false;
    note.scrollIntoView({ block: 'center' });
  });
}
