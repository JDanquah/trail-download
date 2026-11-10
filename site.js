// The installer's https address: always the newest release, so a new version needs
// no change here. With none, Download says it is not up yet, rather than going nowhere.
const DOWNLOAD_URL = 'https://github.com/JDanquah/trail-download/releases/latest/download/Trail-Setup.exe';

// The Mac trial's disk image. Windows owns "latest", so the Mac keeps a release of its
// own, tagged mac and never marked latest; a new Mac build replaces Trail-Mac.dmg there.
const MAC_URL = 'https://github.com/JDanquah/trail-download/releases/download/mac/Trail-Mac.dmg';

// Download gives the file for the computer this page is open on, and only that one
// (James, 2026-11-10). An iPad asking for the desktop site says Macintosh, so it is
// told apart by its touch screen. A browser cannot tell an Intel Mac from one with
// Apple silicon, so the note under Download says which Macs the trial runs on.
function deviceOf(ua, touchPoints) {
  if (/iPhone|iPad|iPod|Android/.test(ua)) return 'phone';
  if (/Macintosh/.test(ua)) return touchPoints > 1 ? 'phone' : 'mac';
  if (/Windows/.test(ua)) return 'windows';
  return 'other';
}

const device = deviceOf(navigator.userAgent, navigator.maxTouchPoints || 0);
const FILES = { windows: { url: DOWNLOAD_URL, name: 'Windows' }, mac: { url: MAC_URL, name: 'Mac' } };
const file = FILES[device];

// The invitation email's button comes here with ?invited=1. Nothing personal is
// in the address; the steps are the same for everybody.
if (new URLSearchParams(location.search).has('invited')) {
  document.getElementById('invited').hidden = false;
}

function say(which) {
  const note = document.querySelector(which);
  note.hidden = false;
  note.scrollIntoView({ block: 'center' });
}

for (const link of document.querySelectorAll('[data-download]')) {
  if (file && file.url) {
    link.href = file.url;
    // The card's button is named for what it gives; Download Now keeps its own words as its name.
    if (link.hasAttribute('aria-label')) link.setAttribute('aria-label', `Download Trail for ${file.name}`);
    continue;
  }
  link.addEventListener('click', (e) => {
    e.preventDefault();
    // A phone or another computer is told where Trail runs; a computer it runs on, with no file up, is told so.
    say(file ? '[data-not-ready]' : '[data-other-device]');
  });
}
