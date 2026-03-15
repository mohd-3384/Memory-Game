import type { AppLanguage } from '../interfaces/game.interface'

type TranslationSet = {
    languageGerman: string
    languageEnglish: string
    landingKicker: string
    landingTitle: string
    landingPlay: string
    settingsTitle: string
    settingsLanguage: string
    settingsThemes: string
    settingsPlayerCount: string
    settingsOnePlayer: string
    settingsTwoPlayersOnline: string
    settingsStartingPlayer: string
    settingsBoardSize: string
    settingsCards: string
    settingsSoundEffects: string
    settingsOn: string
    settingsOff: string
    previewPlayerSingular: string
    previewPlayerPlural: string
    previewStart: string
    boardAriaLabel: string
    boardCardAriaLabel: string
    boardCardBackAlt: string
    boardCardFrontAlt: string
    gameKicker: string
    gameTheme: string
    gameBoard: string
    gameScoreboardAriaLabel: string
    gameCurrentPlayer: string
    gameModeSingle: string
    gameRound: string
    gameBlue: string
    gameOrange: string
    gamePairs: string
    gameSettings: string
    gameSoundOn: string
    gameSoundOff: string
    gameTurnSoundOff: string
    gameTurnSoundOn: string
    gameNewGame: string
    gameMoves: string
    endGameOver: string
    endYouWin: string
    endYouLost: string
    endDraw: string
    endResultIs: string
    endWinnerIs: string
    endADraw: string
    endMatchedInMoves: string
    endFinalScore: string
    endReplay: string
    endBackToStart: string
    endRematch: string
    onlineKicker: string
    onlinePlayOnTwoDevices: string
    onlineCreateOrJoin: string
    onlineConnected: string
    onlineDisconnected: string
    onlineCreateRoom: string
    onlineCreating: string
    onlineBackToSettings: string
    onlineJoinRoom: string
    onlineEnterCode: string
    onlineJoin: string
    onlineJoining: string
    onlineRoomCode: string
    onlineCopied: string
    onlineCopy: string
    onlineYouAre: string
    onlineBlueHost: string
    onlineConnectedRow: string
    onlineBlueWaiting: string
    onlineOrangeWaiting: string
    onlineStartGame: string
    onlineWaitingForHost: string
    onlineConnecting: string
    onlineSyncing: string
    onlineBack: string
    onlineLeaveRoom: string
    onlineSpectator: string
    onlineYourTurn: string
    onlineWaiting: string
    onlineRematchVotes: string
    onlineErrorReachServer: string
    onlineErrorTimeout: string
    onlineErrorCreateRoom: string
    onlineErrorEnterCode: string
    onlineErrorJoinRoom: string
    onlineErrorConnectServer: string
    onlineErrorStartGame: string
    onlineErrorCopyCode: string
    onlineErrorRematch: string
    onlineSameScore: string
}

export const translations: Record<AppLanguage, TranslationSet> = {
    en: {
        languageGerman: 'Deutsch',
        languageEnglish: 'English',
        landingKicker: "It's play time.",
        landingTitle: 'Ready to play?',
        landingPlay: 'Play',
        settingsTitle: 'Settings',
        settingsLanguage: 'Language',
        settingsThemes: 'Game themes',
        settingsPlayerCount: 'Number of players',
        settingsOnePlayer: '1 Player',
        settingsTwoPlayersOnline: '2 Players (online)',
        settingsStartingPlayer: 'Starting player',
        settingsBoardSize: 'Board size',
        settingsCards: 'cards',
        settingsSoundEffects: 'Sound effects',
        settingsOn: 'On',
        settingsOff: 'Off',
        previewPlayerSingular: 'player',
        previewPlayerPlural: 'players',
        previewStart: 'Start',
        boardAriaLabel: 'Memory board',
        boardCardAriaLabel: 'Memory card',
        boardCardBackAlt: 'Card back',
        boardCardFrontAlt: 'Memory icon',
        gameKicker: 'Memory Game',
        gameTheme: 'Theme',
        gameBoard: 'Board',
        gameScoreboardAriaLabel: 'Scoreboard',
        gameCurrentPlayer: 'Current player:',
        gameModeSingle: 'Mode: Single player',
        gameRound: 'Round',
        gameBlue: 'Blue',
        gameOrange: 'Orange',
        gamePairs: 'Pairs',
        gameSettings: 'Settings',
        gameSoundOn: 'Sound on',
        gameSoundOff: 'Sound off',
        gameTurnSoundOff: 'Turn sound off',
        gameTurnSoundOn: 'Turn sound on',
        gameNewGame: 'New Game',
        gameMoves: 'Moves',
        endGameOver: 'Game Over',
        endYouWin: 'You Win',
        endYouLost: 'You Lost',
        endDraw: 'Draw',
        endResultIs: 'The result is',
        endWinnerIs: 'The winner is',
        endADraw: 'A Draw',
        endMatchedInMoves: 'You matched all pairs in {moves} moves.',
        endFinalScore: 'Final score',
        endReplay: 'Play again',
        endBackToStart: 'Back to start',
        endRematch: 'Rematch',
        onlineKicker: 'Online Multiplayer',
        onlinePlayOnTwoDevices: 'Play on 2 devices',
        onlineCreateOrJoin: 'Create a room or join with a code.',
        onlineConnected: 'Connected to server',
        onlineDisconnected: 'Connection lost',
        onlineCreateRoom: 'Create Room',
        onlineCreating: 'Creating...',
        onlineBackToSettings: 'Back to Settings',
        onlineJoinRoom: 'Join room',
        onlineEnterCode: 'Enter code',
        onlineJoin: 'Join',
        onlineJoining: 'Joining...',
        onlineRoomCode: 'Room code',
        onlineCopied: 'Copied',
        onlineCopy: 'Copy',
        onlineYouAre: 'You are',
        onlineBlueHost: 'Blue (Host)',
        onlineConnectedRow: 'Connected',
        onlineBlueWaiting: 'Blue · waiting',
        onlineOrangeWaiting: 'Orange · waiting',
        onlineStartGame: 'Start Online Game',
        onlineWaitingForHost: 'Waiting for host to start...',
        onlineConnecting: 'Connecting...',
        onlineSyncing: 'Synchronizing room state.',
        onlineBack: 'Back',
        onlineLeaveRoom: 'Leave room',
        onlineSpectator: 'spectator',
        onlineYourTurn: 'Your turn',
        onlineWaiting: 'Waiting...',
        onlineRematchVotes: 'Rematch votes',
        onlineErrorReachServer: 'Could not reach the server.',
        onlineErrorTimeout: 'The server did not answer in time. Please try again.',
        onlineErrorCreateRoom: 'Could not create room.',
        onlineErrorEnterCode: 'Please enter a room code.',
        onlineErrorJoinRoom: 'Could not join room.',
        onlineErrorConnectServer: 'Could not connect to the server.',
        onlineErrorStartGame: 'Could not start game.',
        onlineErrorCopyCode: 'Could not copy room code.',
        onlineErrorRematch: 'Could not request rematch.',
        onlineSameScore: 'Both players finished with the same score.',
    },
    de: {
        languageGerman: 'Deutsch',
        languageEnglish: 'English',
        landingKicker: 'Zeit zum Spielen.',
        landingTitle: 'Bereit zum Spielen?',
        landingPlay: 'Spielen',
        settingsTitle: 'Einstellungen',
        settingsLanguage: 'Sprache',
        settingsThemes: 'Spielthemen',
        settingsPlayerCount: 'Anzahl Spieler',
        settingsOnePlayer: '1 Spieler',
        settingsTwoPlayersOnline: '2 Spieler (online)',
        settingsStartingPlayer: 'Startspieler',
        settingsBoardSize: 'Spielfeldgroesse',
        settingsCards: 'Karten',
        settingsSoundEffects: 'Soundeffekte',
        settingsOn: 'An',
        settingsOff: 'Aus',
        previewPlayerSingular: 'Spieler',
        previewPlayerPlural: 'Spieler',
        previewStart: 'Starten',
        boardAriaLabel: 'Memory Spielfeld',
        boardCardAriaLabel: 'Memory Karte',
        boardCardBackAlt: 'Kartenrückseite',
        boardCardFrontAlt: 'Memory Symbol',
        gameKicker: 'Memory Spiel',
        gameTheme: 'Thema',
        gameBoard: 'Spielfeld',
        gameScoreboardAriaLabel: 'Punktestand',
        gameCurrentPlayer: 'Aktiver Spieler:',
        gameModeSingle: 'Modus: Einzelspieler',
        gameRound: 'Runde',
        gameBlue: 'Blau',
        gameOrange: 'Orange',
        gamePairs: 'Paare',
        gameSettings: 'Einstellungen',
        gameSoundOn: 'Sound an',
        gameSoundOff: 'Sound aus',
        gameTurnSoundOff: 'Sound ausschalten',
        gameTurnSoundOn: 'Sound einschalten',
        gameNewGame: 'Neues Spiel',
        gameMoves: 'Züge',
        endGameOver: 'Spiel Vorbei',
        endYouWin: 'Du gewinnst',
        endYouLost: 'Du verlierst',
        endDraw: 'Unentschieden',
        endResultIs: 'Das Ergebnis ist',
        endWinnerIs: 'Der Gewinner ist',
        endADraw: 'Unentschieden',
        endMatchedInMoves: 'Du hast alle Paare in {moves} Zügen gefunden.',
        endFinalScore: 'Endstand',
        endReplay: 'Spiel wiederholen',
        endBackToStart: 'Zurück zum Start',
        endRematch: 'Revanche',
        onlineKicker: 'Online Mehrspieler',
        onlinePlayOnTwoDevices: 'Spiele auf 2 Geräten',
        onlineCreateOrJoin: 'Erstelle einen Raum oder trete mit Code bei.',
        onlineConnected: 'Mit Server verbunden',
        onlineDisconnected: 'Verbindung verloren',
        onlineCreateRoom: 'Raum erstellen',
        onlineCreating: 'Erstelle...',
        onlineBackToSettings: 'Zurück zu Einstellungen',
        onlineJoinRoom: 'Raum beitreten',
        onlineEnterCode: 'Code eingeben',
        onlineJoin: 'Beitreten',
        onlineJoining: 'Trete bei...',
        onlineRoomCode: 'Raumcode',
        onlineCopied: 'Kopiert',
        onlineCopy: 'Kopieren',
        onlineYouAre: 'Du bist',
        onlineBlueHost: 'Blau (Host)',
        onlineConnectedRow: 'Verbunden',
        onlineBlueWaiting: 'Blau · wartet',
        onlineOrangeWaiting: 'Orange · wartet',
        onlineStartGame: 'Online Spiel starten',
        onlineWaitingForHost: 'Warte auf den Host...',
        onlineConnecting: 'Verbinden...',
        onlineSyncing: 'Raumstatus wird synchronisiert.',
        onlineBack: 'Zurück',
        onlineLeaveRoom: 'Raum verlassen',
        onlineSpectator: 'Zuschauer',
        onlineYourTurn: 'Du bist dran',
        onlineWaiting: 'Warten...',
        onlineRematchVotes: 'Revanche Stimmen',
        onlineErrorReachServer: 'Server konnte nicht erreicht werden.',
        onlineErrorTimeout: 'Der Server hat nicht rechtzeitig geantwortet. Bitte erneut versuchen.',
        onlineErrorCreateRoom: 'Raum konnte nicht erstellt werden.',
        onlineErrorEnterCode: 'Bitte einen Raumcode eingeben.',
        onlineErrorJoinRoom: 'Raumbeitritt fehlgeschlagen.',
        onlineErrorConnectServer: 'Verbindung zum Server fehlgeschlagen.',
        onlineErrorStartGame: 'Spiel konnte nicht gestartet werden.',
        onlineErrorCopyCode: 'Raumcode konnte nicht kopiert werden.',
        onlineErrorRematch: 'Revanche konnte nicht angefragt werden.',
        onlineSameScore: 'Beide Spieler haben den gleichen Punktestand.',
    },
}

/**
 * Returns the language-specific text dictionary.
 */
export function getTranslations(language: AppLanguage) {
    return translations[language]
}
