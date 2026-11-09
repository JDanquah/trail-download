// Where signing in comes back to (James's mockups of 2026-11-05, docs/mockups/desktop/86 to 91).
//
// Google's sign-in ends here after Trail has taken it (?done=1 or ?failed=1 from
// LoopbackListener). An email's link lands here first, because Trail may be closed or the
// person on a phone (?for=confirm or ?for=reset, then Supabase's code, tokens or error).
// The button hands it to Trail by trail://, which a browser opens only from a press. It does
// not call 127.0.0.1 from here, because Chrome asks permission for that in words that alarm.
//
// A code does nothing without the half Trail keeps, and it works once. It still leaves the
// address as soon as it is read, and this page loads nothing from anywhere else.

const SAVED = 'trail-signed-in';

/** The link that hands this to Trail, or null when there is nothing to hand over. */
function trailLink(query, fragment) {
  const code = query.get('code');
  if (code && /^[\w-]+$/.test(code)) return `trail://auth-callback?code=${code}`;
  if (fragment.get('access_token') && fragment.get('refresh_token')) {
    const kept = new URLSearchParams();
    for (const name of ['access_token', 'refresh_token', 'expires_at', 'type']) {
      if (fragment.has(name)) kept.set(name, fragment.get(name));
    }
    return `trail://auth-callback#${kept}`;
  }
  return null;
}

/** Which state the page is in, and the link its button takes. Only ever picks from fixed words: nothing from the address is shown. */
function signedInWhat(search, hash, onWindows) {
  const query = new URLSearchParams(search);
  const fragment = new URLSearchParams(hash.replace(/^#/, ''));
  if (query.has('done')) return { state: 'signed-in' };
  if (query.has('failed')) return { state: 'google-failed' };
  if (['error', 'error_code'].some(name => query.has(name) || fragment.has(name))) {
    return onWindows ? { state: 'expired', link: 'trail://open' } : { state: 'expired' };
  }
  const link = trailLink(query, fragment);
  if (!link && !query.has('for')) return { state: 'none' };
  const reset = query.get('for') === 'reset' || fragment.get('type') === 'recovery';
  if (!onWindows) return { state: reset ? 'elsewhere-reset' : 'elsewhere' };
  return { state: reset ? 'reset' : 'confirmed', link: link ?? 'trail://open' };
}

if (typeof document !== 'undefined') {
  let what = signedInWhat(location.search, location.hash, /Windows NT/.test(navigator.userAgent));
  // A reload must not lose a code the address no longer shows.
  try {
    if (what.state === 'none') what = JSON.parse(sessionStorage.getItem(SAVED)) ?? what;
    else sessionStorage.setItem(SAVED, JSON.stringify(what));
  } catch { /* no storage here: a reload goes to the home page */ }
  history.replaceState(null, '', location.pathname);

  if (what.state === 'none') {
    // Somebody came here with nothing to finish, and "You're signed in" would not be true.
    location.replace('../');
  } else {
    const shown = document.querySelector(`[data-state="${what.state}"]`);
    shown.hidden = false;
    for (const button of shown.querySelectorAll('[data-trail]')) {
      if (what.link) button.href = what.link;
      else button.hidden = true;
    }
  }
}
