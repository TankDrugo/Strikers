// Every text the player reads, in Italian and English. t('key', { n: 3 }) fills {n}.
// The language is chosen on the first start and saved with the profiles (save.js).

const STRINGS = {
  it: {
    'lang.title': 'Scegli la lingua',
    'lang.hint': 'Potrai cambiarla dalle Impostazioni.',
    'loading.title': 'Caricamento',
    'loading.detail': 'Personaggi e animazioni: {done} di {total}',
    'loading.error': 'Il gioco non è riuscito a caricare',
    'loading.errorHint': 'Ricarica la pagina. Se succede ancora, manda a Claude questo messaggio:',
    'profiles.title': 'Chi gioca?',
    'profiles.new': 'Nuovo profilo',
    'profiles.newHint': 'Crea il tuo account: coppe, bacheca e club restano tuoi.',
    'profiles.played': '{n} partite',
    'profiles.create': 'Crea profilo',
    'profiles.name': 'Nome',
    'profiles.color': 'Colore',
    'profiles.ok': 'Fatto',
    'profiles.del': 'Cancella',
    'profiles.space': 'Spazio',
    'profiles.typeHint': 'Scrivi con la tastiera o scegli le lettere col controller.',
    'profiles.nameMissing': 'Scrivi almeno una lettera.',
    'profiles.delete': 'Elimina questo profilo',
    'profiles.deleteAsk': 'Eliminare {name}? Progressi, trofei e club andranno persi.',
    'profiles.deleteYes': 'Elimina',
    'profiles.deleteNo': 'Annulla',
    'tab.home': 'Home', 'tab.quick': 'Gioco rapido', 'tab.cups': 'Coppe', 'tab.ut': 'Ultimate Team', 'tab.opts': 'Impostazioni',
    'sub.cups': 'Coppe', 'sub.private': 'Torneo privato', 'sub.trophies': 'Bacheca',
    'sub.club': 'Club', 'sub.squad': 'Rosa', 'sub.market': 'Mercato', 'sub.divisions': 'Divisioni', 'sub.album': 'Album',
    'foot.select': 'Seleziona', 'foot.enter': 'Entra', 'foot.back': 'Indietro', 'foot.exit': 'Esci da {mode}',
    'foot.tabs': 'Cambia scheda', 'foot.sections': 'Sezioni di {mode}', 'foot.change': 'Cambia valore',
    'credits': 'CR',
    'news.label': 'Notizie',
    'news.1.title': 'Arrivano le carte Holo!',
    'news.1.text': 'Arcobaleno, Glitter, Lava, Prisma e Galassia: presto nei pacchetti di Ultimate Team.',
    'news.2.title': 'Quattro coppe in arrivo',
    'news.2.text': 'Scimmie in Fuga, Gran Premio Pazzo Pazzo, Lost Heaven e Bullone Galattico. Tre stelle per partita e voto fino a Z.',
    'news.3.title': 'Sfida un amico',
    'news.3.text': 'Gioco rapido ora va anche in due: uno contro uno, o insieme contro il computer.',
    'home.playNow': 'Gioca subito', 'home.playNowText': '{a} contro {b}, {min} minuti contro il computer',
    'home.friend': 'Sfida un amico', 'home.friendText': 'Uno contro uno sullo stesso schermo',
    'home.watch': 'Guarda', 'home.watchText': 'Computer contro computer',
    'home.record': 'La tua carriera', 'home.recordText': '{w} vinte · {d} pari · {l} perse',
    'quick.vsCpu': 'Contro il computer', 'quick.vsCpuText': 'Un giocatore',
    'quick.vsFriend': 'Contro un amico', 'quick.vsFriendText': 'Un giocatore per squadra',
    'quick.coop': 'In due contro il computer', 'quick.coopText': 'Nella stessa squadra',
    'quick.watch': 'Computer contro computer', 'quick.watchText': 'Per guardare',
    'quick.big1': '1 vs CPU', 'quick.big2': '1 vs 1', 'quick.big3': '2 vs CPU', 'quick.big4': 'CPU',
    'setup.title': 'Prima della partita',
    'setup.team': 'Squadra', 'setup.teamP1': 'Squadra del giocatore 1',
    'setup.formation': 'Formazione', 'setup.formationClassic': 'Classica: 2 dietro, 2 avanti',
    'setup.stadium': 'Stadio', 'setup.stadiumMain': 'Arena Elettrica',
    'setup.time': 'Durata', 'setup.minutes': '{n} minuti',
    'setup.cpu': 'Difficoltà computer', 'setup.easy': 'Facile', 'setup.normal': 'Normale', 'setup.hard': 'Difficile',
    'setup.rules': 'Regole speciali', 'setup.rulesNone': 'Nessuna',
    'setup.more': 'Altre opzioni arriveranno con i nuovi personaggi e stadi.',
    'setup.go': 'Avanti',
    'join.title': 'Chi gioca?',
    'join.hint': 'Premi A sul controller o Invio sulla tastiera per entrare. B o Esc per uscire.',
    'join.slot': 'Giocatore {n}', 'join.empty': 'Premi A o Invio', 'join.keyboard': 'Tastiera', 'join.pad': 'Controller {n}',
    'join.start': 'Si gioca!', 'join.waiting': 'Aspetto il giocatore {n}…',
    'join.useKb': 'Entra con la tastiera',
    'cups.intro': 'Quattro coppe a eliminazione diretta, da soli o in torneo fino a 4 giocatori. Tre stelle per partita, livello Difficile e voto da D a Z.',
    'cups.matches': '{n} partite',
    'cups.soon': 'In costruzione',
    'cups.c1': 'Coppa Scimmie in Fuga', 'cups.c1t': 'Giungla',
    'cups.c2': 'Gran Premio Pazzo Pazzo', 'cups.c2t': 'Circuito',
    'cups.c3': 'Coppa Lost Heaven', 'cups.c3t': 'Anni Trenta',
    'cups.c4': 'Coppa Bullone Galattico', 'cups.c4t': 'Spazio',
    'cups.private': 'Crea un tabellone con le tue regole, fino a 4 giocatori umani.',
    'cups.trophies': 'Qui finiscono i trofei delle coppe vinte, col loro voto.',
    'cups.noTrophy': 'Ancora nessun trofeo',
    'ut.intro': 'Colleziona carte, costruisci la tua rosa e scala le Divisioni.',
    'ut.club': 'Crediti, carte e negozio dei pacchetti con le probabilità dichiarate.',
    'ut.squad': 'La tua formazione di 5: quattro giocatori di movimento e il portiere.',
    'ut.market': 'Compra e vendi carte con i venditori del mercato.',
    'ut.divisions': 'Stagioni da 10 partite contro squadre sempre più forti, da Divisione 10 a Divisione 1.',
    'ut.album': 'Tutte le versioni di ogni personaggio, holo e numerate comprese.',
    'ut.soon': 'Arriva nella tappa 4',
    'opts.lang': 'Lingua', 'opts.controls': 'Comandi', 'opts.controlsText': 'Controller e tastiera',
    'opts.profile': 'Cambia profilo', 'opts.viewer': 'Visualizzatore animazioni', 'opts.viewerText': '183 animazioni, anche specchiate',
    'opts.deleteProfile': 'Elimina profilo',
    'controls.title': 'Comandi',
    'pause.title': 'Pausa', 'pause.resume': 'Riprendi', 'pause.restart': 'Ricomincia', 'pause.quit': 'Esci al menu',
    'end.win': 'Vittoria!', 'end.loss': 'Sconfitta', 'end.draw': 'Pareggio', 'end.over': 'Fine partita',
    'end.shots': 'Tiri', 'end.saves': 'Parate', 'end.passes': 'Passaggi', 'end.tackles': 'Scivolate',
    'end.again': 'Rigioca', 'end.menu': 'Menu',
    'flash.perfect': 'TIRO PERFETTO!', 'flash.save': 'PARATA!', 'flash.parry': 'RESPINTA!', 'flash.goal': 'GOL!',
    'hud.p': 'G{n}',
    'keys.pad': `<kbd>Levetta sx</kbd><span>muovi (anche croce direzionale)</span>
<kbd>RT</kbd><span>turbo</span>
<kbd>A</kbd><span>passaggio</span>
<kbd>B</kbd><span>tieni premuto per caricare il tiro, rilascia per tirare · senza palla: scivolata</span>
<kbd>Y</kbd><span>pallonetto</span>
<kbd>X</kbd><span>finta · senza palla: spallata</span>
<kbd>LB</kbd><span>cambia giocatore</span>
<kbd>Menu ☰</kbd><span>pausa</span>`,
    'keys.kb': `<kbd>WASD</kbd><span>muovi (anche frecce)</span>
<kbd>Shift</kbd><span>turbo</span>
<kbd>J</kbd><span>passaggio · senza palla: cambia giocatore</span>
<kbd>K</kbd><span>tieni premuto per caricare il tiro, rilascia per tirare · senza palla: scivolata</span>
<kbd>L</kbd><span>pallonetto · senza palla: spallata</span>
<kbd>Spazio</kbd><span>finta</span>
<span><kbd>+</kbd> <kbd>-</kbd></span><span>zoom della telecamera (anche rotella)</span>
<span><kbd>P</kbd> <kbd>Esc</kbd></span><span>pausa</span>`,
    'keys.perfect': 'Rilascia il tiro con la barra piena (verde) per un <b>tiro perfetto</b> a effetto.',
    'keys.menu': 'Nei menu: <kbd>LB</kbd> <kbd>RB</kbd> (tastiera <kbd>Q</kbd> <kbd>E</kbd>) cambiano scheda, croce o frecce si muovono, <kbd>A</kbd> o <kbd>Invio</kbd> conferma, <kbd>B</kbd> o <kbd>Esc</kbd> torna indietro.',
    'help.kb': '<kbd>WASD</kbd> muovi · <kbd>Shift</kbd> turbo · <kbd>J</kbd> passa / cambia · <kbd>K</kbd> tiro (tieni) / scivolata · <kbd>L</kbd> pallonetto / spallata · <kbd>Spazio</kbd> finta · <kbd>P</kbd> pausa',
    'help.pad': '<kbd>A</kbd> passa · <kbd>B</kbd> tiro (tieni) / scivolata · <kbd>Y</kbd> pallonetto · <kbd>X</kbd> finta / spallata · <kbd>RT</kbd> turbo · <kbd>LB</kbd> cambia · <kbd>☰</kbd> pausa',
  },
  en: {
    'lang.title': 'Choose your language',
    'lang.hint': 'You can change it later in Settings.',
    'loading.title': 'Loading',
    'loading.detail': 'Characters and animations: {done} of {total}',
    'loading.error': 'The game could not load',
    'loading.errorHint': 'Reload the page. If it happens again, send Claude this message:',
    'profiles.title': "Who's playing?",
    'profiles.new': 'New profile',
    'profiles.newHint': 'Create your account: cups, trophies and club stay yours.',
    'profiles.played': '{n} matches',
    'profiles.create': 'Create profile',
    'profiles.name': 'Name',
    'profiles.color': 'Colour',
    'profiles.ok': 'Done',
    'profiles.del': 'Delete',
    'profiles.space': 'Space',
    'profiles.typeHint': 'Type on the keyboard or pick letters with the controller.',
    'profiles.nameMissing': 'Write at least one letter.',
    'profiles.delete': 'Delete this profile',
    'profiles.deleteAsk': 'Delete {name}? Progress, trophies and club will be lost.',
    'profiles.deleteYes': 'Delete',
    'profiles.deleteNo': 'Cancel',
    'tab.home': 'Home', 'tab.quick': 'Quick play', 'tab.cups': 'Cups', 'tab.ut': 'Ultimate Team', 'tab.opts': 'Settings',
    'sub.cups': 'Cups', 'sub.private': 'Private tournament', 'sub.trophies': 'Trophy room',
    'sub.club': 'Club', 'sub.squad': 'Squad', 'sub.market': 'Market', 'sub.divisions': 'Divisions', 'sub.album': 'Album',
    'foot.select': 'Select', 'foot.enter': 'Enter', 'foot.back': 'Back', 'foot.exit': 'Leave {mode}',
    'foot.tabs': 'Change tab', 'foot.sections': '{mode} sections', 'foot.change': 'Change value',
    'credits': 'CR',
    'news.label': 'News',
    'news.1.title': 'Holo cards are coming!',
    'news.1.text': 'Rainbow, Glitter, Lava, Prism and Galaxy: soon in Ultimate Team packs.',
    'news.2.title': 'Four cups on the way',
    'news.2.text': 'Monkeys on the Run, Crazy Crazy Grand Prix, Lost Heaven and Galactic Bolt. Three stars per match and grades up to Z.',
    'news.3.title': 'Challenge a friend',
    'news.3.text': 'Quick play now works for two: one against one, or together against the computer.',
    'home.playNow': 'Play now', 'home.playNowText': '{a} vs {b}, {min} minutes against the computer',
    'home.friend': 'Challenge a friend', 'home.friendText': 'One against one on the same screen',
    'home.watch': 'Watch', 'home.watchText': 'Computer against computer',
    'home.record': 'Your career', 'home.recordText': '{w} won · {d} drawn · {l} lost',
    'quick.vsCpu': 'Against the computer', 'quick.vsCpuText': 'One player',
    'quick.vsFriend': 'Against a friend', 'quick.vsFriendText': 'One player per team',
    'quick.coop': 'Two against the computer', 'quick.coopText': 'On the same team',
    'quick.watch': 'Computer against computer', 'quick.watchText': 'Just watch',
    'quick.big1': '1 vs CPU', 'quick.big2': '1 vs 1', 'quick.big3': '2 vs CPU', 'quick.big4': 'CPU',
    'setup.title': 'Before kick-off',
    'setup.team': 'Team', 'setup.teamP1': "Player 1's team",
    'setup.formation': 'Formation', 'setup.formationClassic': 'Classic: 2 back, 2 up',
    'setup.stadium': 'Stadium', 'setup.stadiumMain': 'Electric Arena',
    'setup.time': 'Length', 'setup.minutes': '{n} minutes',
    'setup.cpu': 'Computer difficulty', 'setup.easy': 'Easy', 'setup.normal': 'Normal', 'setup.hard': 'Hard',
    'setup.rules': 'Special rules', 'setup.rulesNone': 'None',
    'setup.more': 'More options will come with new characters and stadiums.',
    'setup.go': 'Next',
    'join.title': "Who's playing?",
    'join.hint': 'Press A on a controller or Enter on the keyboard to join. B or Esc to leave.',
    'join.slot': 'Player {n}', 'join.empty': 'Press A or Enter', 'join.keyboard': 'Keyboard', 'join.pad': 'Controller {n}',
    'join.start': "Let's play!", 'join.waiting': 'Waiting for player {n}…',
    'join.useKb': 'Join with the keyboard',
    'cups.intro': 'Four knockout cups, alone or in a tournament with up to 4 players. Three stars per match, a Hard level and grades from D to Z.',
    'cups.matches': '{n} matches',
    'cups.soon': 'Under construction',
    'cups.c1': 'Monkeys on the Run Cup', 'cups.c1t': 'Jungle',
    'cups.c2': 'Crazy Crazy Grand Prix', 'cups.c2t': 'Racetrack',
    'cups.c3': 'Lost Heaven Cup', 'cups.c3t': 'The Thirties',
    'cups.c4': 'Galactic Bolt Cup', 'cups.c4t': 'Space',
    'cups.private': 'Build a bracket with your own rules, up to 4 human players.',
    'cups.trophies': 'Trophies from the cups you win end up here, with their grade.',
    'cups.noTrophy': 'No trophies yet',
    'ut.intro': 'Collect cards, build your squad and climb the Divisions.',
    'ut.club': 'Credits, cards and the pack store with published odds.',
    'ut.squad': 'Your team of 5: four outfield players and the goalkeeper.',
    'ut.market': 'Buy and sell cards with the market traders.',
    'ut.divisions': '10-match seasons against stronger and stronger teams, from Division 10 to Division 1.',
    'ut.album': 'Every version of every character, holo and numbered ones included.',
    'ut.soon': 'Coming in stage 4',
    'opts.lang': 'Language', 'opts.controls': 'Controls', 'opts.controlsText': 'Controller and keyboard',
    'opts.profile': 'Switch profile', 'opts.viewer': 'Animation viewer', 'opts.viewerText': '183 animations, mirrored too',
    'opts.deleteProfile': 'Delete profile',
    'controls.title': 'Controls',
    'pause.title': 'Paused', 'pause.resume': 'Resume', 'pause.restart': 'Restart', 'pause.quit': 'Quit to menu',
    'end.win': 'You win!', 'end.loss': 'You lose', 'end.draw': 'Draw', 'end.over': 'Full time',
    'end.shots': 'Shots', 'end.saves': 'Saves', 'end.passes': 'Passes', 'end.tackles': 'Slide tackles',
    'end.again': 'Play again', 'end.menu': 'Menu',
    'flash.perfect': 'PERFECT SHOT!', 'flash.save': 'SAVE!', 'flash.parry': 'PARRIED!', 'flash.goal': 'GOAL!',
    'hud.p': 'P{n}',
    'keys.pad': `<kbd>Left stick</kbd><span>move (d-pad too)</span>
<kbd>RT</kbd><span>sprint</span>
<kbd>A</kbd><span>pass</span>
<kbd>B</kbd><span>hold to charge the shot, release to shoot · without the ball: slide tackle</span>
<kbd>Y</kbd><span>lob</span>
<kbd>X</kbd><span>feint · without the ball: shoulder charge</span>
<kbd>LB</kbd><span>switch player</span>
<kbd>Menu ☰</kbd><span>pause</span>`,
    'keys.kb': `<kbd>WASD</kbd><span>move (arrows too)</span>
<kbd>Shift</kbd><span>sprint</span>
<kbd>J</kbd><span>pass · without the ball: switch player</span>
<kbd>K</kbd><span>hold to charge the shot, release to shoot · without the ball: slide tackle</span>
<kbd>L</kbd><span>lob · without the ball: shoulder charge</span>
<kbd>Space</kbd><span>feint</span>
<span><kbd>+</kbd> <kbd>-</kbd></span><span>camera zoom (mouse wheel too)</span>
<span><kbd>P</kbd> <kbd>Esc</kbd></span><span>pause</span>`,
    'keys.perfect': 'Release the shot with a full (green) bar for a curling <b>perfect shot</b>.',
    'keys.menu': 'In menus: <kbd>LB</kbd> <kbd>RB</kbd> (keyboard <kbd>Q</kbd> <kbd>E</kbd>) change tab, d-pad or arrows move, <kbd>A</kbd> or <kbd>Enter</kbd> confirms, <kbd>B</kbd> or <kbd>Esc</kbd> goes back.',
    'help.kb': '<kbd>WASD</kbd> move · <kbd>Shift</kbd> sprint · <kbd>J</kbd> pass / switch · <kbd>K</kbd> shoot (hold) / slide · <kbd>L</kbd> lob / charge · <kbd>Space</kbd> feint · <kbd>P</kbd> pause',
    'help.pad': '<kbd>A</kbd> pass · <kbd>B</kbd> shoot (hold) / slide · <kbd>Y</kbd> lob · <kbd>X</kbd> feint / charge · <kbd>RT</kbd> sprint · <kbd>LB</kbd> switch · <kbd>☰</kbd> pause',
  },
};

let lang = 'it';

export function setLang(l) { lang = STRINGS[l] ? l : 'it'; document.documentElement.lang = lang; }
export function getLang() { return lang; }

export function t(key, vars) {
  let s = STRINGS[lang][key] ?? STRINGS.it[key] ?? key;
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
  return s;
}
