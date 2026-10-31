// Where the Ultimate Team save lives.
// Online (the private game link on claude.ai): the page's database, in the player's own private
// space data/users/<id>/ut, so the collection follows the account on every device. Elsewhere (the
// gioco.html file, the dev page) or if the database does not answer: the browser (localStorage).
// A copy always goes to localStorage too, so a save is never lost if the connection drops.
import { normalize } from './core.js';

const LOCAL_KEY = 'calcio-ut-save-v1';

function readLocal() {
  try { const t = localStorage.getItem(LOCAL_KEY); return t ? JSON.parse(t) : null; } catch { return null; }
}
function writeLocal(s) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(s)); } catch { /* private window */ }
}

const withTimeout = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r(null), ms))]);

export async function openStorage() {
  let ref = null;
  const claude = window.claude;
  if (claude && typeof claude.use === 'function') {
    try {
      const [db, user] = await Promise.all([withTimeout(claude.use('db'), 10000), withTimeout(claude.use('user'), 10000)]);
      const id = db && user ? await withTimeout(user.id(), 5000) : null;
      if (db && id) ref = db.doc('data/users/' + id + '/ut');
    } catch { ref = null; }
  }
  let data = null, mode = 'browser', error = null;
  if (ref) {
    try {
      const snap = await withTimeout(ref.get(), 10000);
      if (snap) { mode = 'online'; data = snap.exists ? snap.data() : null; } else error = 'Il salvataggio online non risponde: uso il browser.';
    } catch (e) { error = 'Salvataggio online non disponibile: uso il browser.'; }
  }
  const local = readLocal();
  // first online visit after playing offline: carry the browser save over
  if (!data && local) data = local;
  const save = normalize(data && JSON.parse(JSON.stringify(data)));

  let chain = Promise.resolve();
  const store = {
    mode, error, save,
    // one write at a time, always the latest state
    write() {
      const snapshot = JSON.parse(JSON.stringify(store.save));
      writeLocal(snapshot);
      if (store.mode !== 'online') return Promise.resolve(true);
      chain = chain.then(() => ref.set(snapshot)).then(() => { store.error = null; return true; }, (e) => {
        store.error = e && e.code === 'quota_exceeded' ? 'Spazio online esaurito: progressi salvati solo nel browser.' : 'Salvataggio online non riuscito: progressi salvati nel browser.';
        return false;
      });
      return chain;
    },
  };
  return store;
}
