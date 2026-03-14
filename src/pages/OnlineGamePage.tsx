import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { LuVolume2, LuVolumeX } from 'react-icons/lu'
import { MemoryBoard } from '../components/MemoryBoard'
import { getThemeById } from '../data/themes'
import type { GameSettings, PlayerId } from '../interfaces/game.interface'
import type { OnlineRoomState } from '../interfaces/online.interface'
import { getBoardColumns } from '../utils/game'
import { socket } from '../utils/socket'

const ONLINE_PLAYER_KEY_PREFIX = 'memory-online-player:'

type OnlineGamePageProps = {
    settings: GameSettings
    onSoundChange: (soundEnabled: boolean) => void
}

type LocationState = {
    playerId?: PlayerId
    playerKey?: string
}

export function OnlineGamePage({ settings, onSoundChange }: OnlineGamePageProps) {
    const navigate = useNavigate()
    const { roomId = '' } = useParams()
    const location = useLocation()

    const locationState = (location.state ?? {}) as LocationState
    const [playerId, setPlayerId] = useState<PlayerId | null>(locationState.playerId ?? null)
    const [playerKey, setPlayerKey] = useState(locationState.playerKey ?? '')
    const [roomState, setRoomState] = useState<OnlineRoomState | null>(null)
    const [error, setError] = useState('')
    const [isSocketConnected, setIsSocketConnected] = useState(socket.connected)

    const audioContextRef = useRef<AudioContext | null>(null)
    const hasPlayedWinSoundRef = useRef(false)
    const previousStateRef = useRef<OnlineRoomState | null>(null)

    const activeTheme = useMemo(() => {
        if (roomState) {
            return getThemeById(roomState.settings.themeId)
        }

        return getThemeById(settings.themeId)
    }, [roomState, settings.themeId])

    const winnerText = useMemo(() => {
        if (!roomState) {
            return ''
        }

        if (roomState.scores.blue === roomState.scores.orange) {
            return 'It is a draw! Both players have the same number of pairs.'
        }

        const winner = roomState.scores.blue > roomState.scores.orange ? 'Blue' : 'Orange'
        const score = Math.max(roomState.scores.blue, roomState.scores.orange)
        return `${winner} wins with ${score} pairs.`
    }, [roomState])

    const isMyTurn = Boolean(playerId && roomState?.currentPlayer === playerId)

    function getAudioContext(): AudioContext | null {
        if (!settings.soundEnabled) {
            return null
        }

        const AudioContextCtor = window.AudioContext
        if (!AudioContextCtor) {
            return null
        }

        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContextCtor()
        }

        if (audioContextRef.current.state === 'suspended') {
            void audioContextRef.current.resume()
        }

        return audioContextRef.current
    }

    function playTone(
        audioContext: AudioContext,
        frequency: number,
        duration: number,
        delay = 0,
        waveType: OscillatorType = 'sine',
    ) {
        const oscillator = audioContext.createOscillator()
        const gain = audioContext.createGain()
        const now = audioContext.currentTime + delay

        oscillator.type = waveType
        oscillator.frequency.setValueAtTime(frequency, now)
        gain.gain.setValueAtTime(0.0001, now)
        gain.gain.exponentialRampToValueAtTime(0.05, now + 0.015)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

        oscillator.connect(gain)
        gain.connect(audioContext.destination)
        oscillator.start(now)
        oscillator.stop(now + duration)
    }

    function playFlipSound() {
        const audioContext = getAudioContext()
        if (!audioContext) {
            return
        }

        playTone(audioContext, 520, 0.07, 0, 'triangle')
    }

    function playMatchSound() {
        const audioContext = getAudioContext()
        if (!audioContext) {
            return
        }

        playTone(audioContext, 560, 0.1, 0, 'sine')
        playTone(audioContext, 760, 0.12, 0.09, 'sine')
    }

    function playMissSound() {
        const audioContext = getAudioContext()
        if (!audioContext) {
            return
        }

        playTone(audioContext, 410, 0.11, 0, 'sawtooth')
        playTone(audioContext, 290, 0.11, 0.1, 'sawtooth')
    }

    function playWinSound() {
        const audioContext = getAudioContext()
        if (!audioContext) {
            return
        }

        playTone(audioContext, 523, 0.12, 0, 'triangle')
        playTone(audioContext, 659, 0.12, 0.11, 'triangle')
        playTone(audioContext, 784, 0.16, 0.22, 'triangle')
    }

    useEffect(() => {
        if (!roomId) {
            navigate('/online')
            return
        }

        if (!playerKey) {
            const stored = localStorage.getItem(`${ONLINE_PLAYER_KEY_PREFIX}${roomId}`)
            if (stored) {
                try {
                    const parsed = JSON.parse(stored) as { playerId?: PlayerId; playerKey?: string }
                    if (parsed.playerId) {
                        setPlayerId(parsed.playerId)
                    }
                    if (parsed.playerKey) {
                        setPlayerKey(parsed.playerKey)
                    }
                } catch {
                    // ignore invalid storage value
                }
            }
        }

        if (!socket.connected) {
            socket.connect()
        }

        function handleJoinedRoom(payload: { roomId: string; playerId: PlayerId; playerKey: string }) {
            if (payload.roomId === roomId) {
                setPlayerId(payload.playerId)
                setPlayerKey(payload.playerKey)
                localStorage.setItem(
                    `${ONLINE_PLAYER_KEY_PREFIX}${payload.roomId}`,
                    JSON.stringify({ playerId: payload.playerId, playerKey: payload.playerKey }),
                )
            }
        }

        function handleRoomState(nextState: OnlineRoomState) {
            if (nextState.roomId === roomId) {
                setRoomState(nextState)
            }
        }

        function handleConnect() {
            setIsSocketConnected(true)
            socket.emit('sync_room', { roomId, playerKey })
        }

        function handleDisconnect() {
            setIsSocketConnected(false)
        }

        socket.on('joined_room', handleJoinedRoom)
        socket.on('room_state', handleRoomState)
        socket.on('connect', handleConnect)
        socket.on('disconnect', handleDisconnect)
        socket.emit('sync_room', { roomId, playerKey })

        return () => {
            socket.off('joined_room', handleJoinedRoom)
            socket.off('room_state', handleRoomState)
            socket.off('connect', handleConnect)
            socket.off('disconnect', handleDisconnect)
        }
    }, [roomId, navigate, playerKey])

    useEffect(() => {
        if (!roomState) {
            return
        }

        const previous = previousStateRef.current

        if (previous) {
            const previousMatched = previous.deck.filter((card) => card.matched).length
            const currentMatched = roomState.deck.filter((card) => card.matched).length

            if (roomState.flippedCards.length > previous.flippedCards.length) {
                playFlipSound()
            }

            if (currentMatched > previousMatched) {
                playMatchSound()
            } else if (
                previous.flippedCards.length === 2 &&
                roomState.flippedCards.length === 0 &&
                previous.currentPlayer !== roomState.currentPlayer
            ) {
                playMissSound()
            }
        }

        if (roomState.status === 'finished' && !hasPlayedWinSoundRef.current) {
            playWinSound()
            hasPlayedWinSoundRef.current = true
        }

        if (roomState.status !== 'finished') {
            hasPlayedWinSoundRef.current = false
        }

        previousStateRef.current = roomState
    }, [roomState])

    function flipCard(cardUid: string) {
        if (!roomState || !roomId || !isMyTurn) {
            return
        }

        if (roomState.status !== 'playing' || roomState.flippedCards.length === 2) {
            return
        }

        socket.emit('flip_card', { roomId, cardUid })
    }

    function leaveRoom() {
        if (roomId) {
            socket.emit('leave_room', { roomId, playerKey })
            localStorage.removeItem(`${ONLINE_PLAYER_KEY_PREFIX}${roomId}`)
        }

        navigate('/online')
    }

    function requestRematch() {
        if (!roomId) {
            return
        }

        socket.emit('rematch_request', { roomId }, (response: { ok: boolean; message?: string }) => {
            if (!response.ok) {
                setError(response.message ?? 'Could not request rematch.')
            } else {
                setError('')
            }
        })
    }

    if (!roomState) {
        return (
            <main className="app" style={{ '--theme-accent': activeTheme.accent } as CSSProperties}>
                <section className="app__panel">
                    <p className="app__kicker">Online Multiplayer</p>
                    <h1>Connecting...</h1>
                    <p className="app__subtitle">Synchronizing room state.</p>
                    {error ? <p className="online-error">{error}</p> : null}
                    <div className="app__actions">
                        <button type="button" className="button button--ghost" onClick={() => navigate('/online')}>
                            Back
                        </button>
                    </div>
                </section>
            </main>
        )
    }

    return (
        <main className="app" style={{ '--theme-accent': activeTheme.accent } as CSSProperties}>
            <section className="app__panel">
                <p className="app__kicker">Online Room · {roomState.roomId}</p>
                <h1>React + TypeScript + SCSS</h1>
                <p className="app__subtitle">Theme: {activeTheme.label} · Board: {roomState.settings.boardSize} cards</p>
                <p className={`online-connection ${isSocketConnected ? 'is-online' : 'is-offline'}`}>
                    {isSocketConnected ? 'Connected to server' : 'Connection lost'}
                </p>

                <div className="app__scoreboard" aria-label="Scoreboard">
                    <div className="app__turn-row">
                        <p className="app__turn">
                            Current player:
                            <span className={`app__turn-player app__turn-player--${roomState.currentPlayer}`}>
                                <span className="app__turn-arrow" aria-hidden="true">
                                    ►
                                </span>
                                {roomState.currentPlayer === 'blue' ? 'Blue' : 'Orange'}
                            </span>
                        </p>
                        <p className="app__round">Round: {roomState.hasWon ? roomState.moves : roomState.moves + 1}</p>
                    </div>
                    <div className="app__scores">
                        <span className={`score-chip ${roomState.currentPlayer === 'blue' ? 'is-active' : ''}`}>Blue: {roomState.scores.blue}</span>
                        <span className={`score-chip ${roomState.currentPlayer === 'orange' ? 'is-active' : ''}`}>Orange: {roomState.scores.orange}</span>
                    </div>
                    <p className="app__subtitle">
                        You are: {playerId ? (playerId === 'blue' ? 'Blue (Host)' : 'Orange') : 'spectator'} · {isMyTurn ? 'Your turn' : 'Waiting...'}
                    </p>
                </div>

                <div className="app__actions">
                    <button type="button" className="button button--ghost" onClick={leaveRoom}>
                        Leave room
                    </button>
                    {roomState.status === 'finished' ? (
                        <button type="button" className="button button--primary" onClick={requestRematch}>
                            Rematch
                        </button>
                    ) : null}
                    <button
                        type="button"
                        className="button button--ghost button--sound"
                        onClick={() => onSoundChange(!settings.soundEnabled)}
                        aria-label={settings.soundEnabled ? 'Turn sound off' : 'Turn sound on'}
                    >
                        {settings.soundEnabled ? <LuVolume2 /> : <LuVolumeX />}
                        {settings.soundEnabled ? 'Sound on' : 'Sound off'}
                    </button>
                    <p className="app__stats">Moves: {roomState.moves}</p>
                </div>

                {roomState.status === 'finished' ? (
                    <p className="app__subtitle">
                        Rematch votes: Blue {roomState.rematchVotes.blue ? '✓' : '…'} · Orange {roomState.rematchVotes.orange ? '✓' : '…'}
                    </p>
                ) : null}
                {error ? <p className="online-error">{error}</p> : null}
                {roomState.hasWon ? <p className="app__win">{winnerText}</p> : null}
            </section>

            <MemoryBoard
                cards={roomState.deck}
                themeFront={roomState.themeFront}
                flippedCards={roomState.flippedCards}
                boardColumns={getBoardColumns(roomState.settings.boardSize)}
                onFlip={(card) => flipCard(card.uid)}
            />
        </main>
    )
}
