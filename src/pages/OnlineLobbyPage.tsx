import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getThemeById } from '../data/themes'
import type { GameSettings, PlayerId } from '../interfaces/game.interface'
import type { JoinedRoomPayload, OnlineRoomState } from '../interfaces/online.interface'
import { buildDeck } from '../utils/game'
import { socket } from '../utils/socket'

const ONLINE_PLAYER_KEY_PREFIX = 'memory-online-player:'

type OnlineLobbyPageProps = {
    settings: GameSettings
}

export function OnlineLobbyPage({ settings }: OnlineLobbyPageProps) {
    const navigate = useNavigate()
    const activeTheme = useMemo(() => getThemeById(settings.themeId), [settings.themeId])

    const [roomId, setRoomId] = useState('')
    const [joinCode, setJoinCode] = useState('')
    const [playerId, setPlayerId] = useState<PlayerId | null>(null)
    const [playerKey, setPlayerKey] = useState('')
    const [roomState, setRoomState] = useState<OnlineRoomState | null>(null)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)
    const [isSocketConnected, setIsSocketConnected] = useState(socket.connected)

    useEffect(() => {
        if (!socket.connected) {
            socket.connect()
        }

        function handleJoinedRoom(payload: JoinedRoomPayload) {
            setRoomId(payload.roomId)
            setPlayerId(payload.playerId)
            setPlayerKey(payload.playerKey)
            localStorage.setItem(
                `${ONLINE_PLAYER_KEY_PREFIX}${payload.roomId}`,
                JSON.stringify({ playerId: payload.playerId, playerKey: payload.playerKey }),
            )
            setError('')
        }

        function handleRoomState(nextState: OnlineRoomState) {
            setRoomState(nextState)
        }

        function handleConnect() {
            setIsSocketConnected(true)
        }

        function handleDisconnect() {
            setIsSocketConnected(false)
        }

        socket.on('joined_room', handleJoinedRoom)
        socket.on('room_state', handleRoomState)
        socket.on('connect', handleConnect)
        socket.on('disconnect', handleDisconnect)

        return () => {
            socket.off('joined_room', handleJoinedRoom)
            socket.off('room_state', handleRoomState)
            socket.off('connect', handleConnect)
            socket.off('disconnect', handleDisconnect)
        }
    }, [])

    useEffect(() => {
        if (!roomState || !roomId || !playerId) {
            return
        }

        if (roomState.status === 'playing') {
            navigate(`/online-game/${roomId}`, { state: { playerId, playerKey } })
        }
    }, [roomState, roomId, playerId, playerKey, navigate])

    function createRoom() {
        const deck = buildDeck(activeTheme, settings.boardSize)

        socket.emit(
            'create_room',
            {
                settings: {
                    themeId: settings.themeId,
                    boardSize: settings.boardSize,
                },
                deck,
                themeFront: activeTheme.front,
            },
            (response: { ok: boolean; message?: string }) => {
                if (!response.ok) {
                    setError(response.message ?? 'Could not create room.')
                }
            },
        )
    }

    function joinRoom() {
        const normalized = joinCode.trim().toUpperCase()
        if (!normalized) {
            setError('Please enter a room code.')
            return
        }

        let reconnectKey = ''
        const stored = localStorage.getItem(`${ONLINE_PLAYER_KEY_PREFIX}${normalized}`)
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as { playerKey?: string }
                reconnectKey = parsed.playerKey ?? ''
            } catch {
                reconnectKey = ''
            }
        }

        socket.emit(
            'join_room',
            { roomId: normalized, playerKey: reconnectKey },
            (response: { ok: boolean; message?: string }) => {
                if (!response.ok) {
                    setError(response.message ?? 'Could not join room.')
                }
            },
        )
    }

    function startOnlineGame() {
        if (!roomId) {
            return
        }

        socket.emit('start_game', { roomId }, (response: { ok: boolean; message?: string }) => {
            if (!response.ok) {
                setError(response.message ?? 'Could not start game.')
            }
        })
    }

    async function copyRoomCode() {
        if (!roomId) {
            return
        }

        try {
            await navigator.clipboard.writeText(roomId)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1200)
        } catch {
            setError('Could not copy room code.')
        }
    }

    const bothConnected = Boolean(roomState?.playersConnected.blue && roomState?.playersConnected.orange)

    return (
        <main className="online-page">
            <section className="online-page__panel">
                <p className="online-page__kicker">Online Multiplayer</p>
                <h1>Play on 2 devices</h1>
                <p className="online-page__subtitle">Create a room or join with a code.</p>
                <p className={`online-connection ${isSocketConnected ? 'is-online' : 'is-offline'}`}>
                    {isSocketConnected ? 'Connected to server' : 'Connection lost'}
                </p>

                <div className="online-page__actions">
                    <button type="button" className="button button--primary" onClick={createRoom}>
                        Create Room
                    </button>
                    <button type="button" className="button button--ghost" onClick={() => navigate('/settings')}>
                        Back to Settings
                    </button>
                </div>

                <div className="online-join">
                    <label htmlFor="room-code">Join room</label>
                    <div className="online-join__row">
                        <input
                            id="room-code"
                            value={joinCode}
                            onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                            placeholder="Enter code"
                            maxLength={6}
                        />
                        <button type="button" className="button button--ghost" onClick={joinRoom}>
                            Join
                        </button>
                    </div>
                </div>

                {roomId ? (
                    <div className="online-room">
                        <p>
                            Room code: <strong>{roomId}</strong>
                            <button type="button" className="button button--ghost online-room__copy" onClick={copyRoomCode}>
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </p>
                        <p>
                            You are: <strong>{playerId === 'blue' ? 'Blue (Host)' : 'Orange'}</strong>
                        </p>
                        <p>
                            Connected: {roomState?.playersConnected.blue ? 'Blue ✓' : 'Blue · waiting'} /{' '}
                            {roomState?.playersConnected.orange ? 'Orange ✓' : 'Orange · waiting'}
                        </p>
                        {playerId === 'blue' ? (
                            <button
                                type="button"
                                className="button button--primary"
                                onClick={startOnlineGame}
                                disabled={!bothConnected}
                            >
                                Start Online Game
                            </button>
                        ) : (
                            <p>Waiting for host to start...</p>
                        )}
                    </div>
                ) : null}

                {error ? <p className="online-error">{error}</p> : null}
            </section>
        </main>
    )
}
