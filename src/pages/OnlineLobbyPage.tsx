import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getThemeById } from '../data/themes'
import { getTranslations } from '../data/translations'
import type { GameSettings, PlayerId } from '../interfaces/game.interface'
import type { JoinedRoomPayload, OnlineRoomState } from '../interfaces/online.interface'
import { buildDeck } from '../utils/game'
import { socket } from '../utils/socket'

const ONLINE_PLAYER_KEY_PREFIX = 'memory-online-player:'

type OnlineLobbyPageProps = {
    settings: GameSettings
}

/**
 * Manages online room creation and joining before the multiplayer match starts.
 */
export function OnlineLobbyPage({ settings }: OnlineLobbyPageProps) {
    const navigate = useNavigate()
    const activeTheme = useMemo(() => getThemeById(settings.themeId), [settings.themeId])
    const text = getTranslations(settings.language)

    const [roomId, setRoomId] = useState('')
    const [joinCode, setJoinCode] = useState('')
    const [playerId, setPlayerId] = useState<PlayerId | null>(null)
    const [playerKey, setPlayerKey] = useState('')
    const [roomState, setRoomState] = useState<OnlineRoomState | null>(null)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)
    const [isSocketConnected, setIsSocketConnected] = useState(socket.connected)
    const [isCreatingRoom, setIsCreatingRoom] = useState(false)
    const [isJoiningRoom, setIsJoiningRoom] = useState(false)

    function storePlayerSession(nextRoomId: string, nextPlayerId: PlayerId, nextPlayerKey: string) {
        try {
            localStorage.setItem(
                `${ONLINE_PLAYER_KEY_PREFIX}${nextRoomId}`,
                JSON.stringify({ playerId: nextPlayerId, playerKey: nextPlayerKey }),
            )
        } catch {
            // Ignore storage failures and keep the session alive in memory.
        }
    }

    function applyJoinedRoom(payload: JoinedRoomPayload) {
        setRoomId(payload.roomId)
        setPlayerId(payload.playerId)
        setPlayerKey(payload.playerKey)
        storePlayerSession(payload.roomId, payload.playerId, payload.playerKey)
        setError('')
    }

    /**
     * Ensures a connected socket before emitting room-related events.
     */
    async function ensureSocketConnected() {
        if (socket.connected) {
            return
        }

        await new Promise<void>((resolve, reject) => {
            const timeoutId = window.setTimeout(() => {
                socket.off('connect', handleConnect)
                socket.off('connect_error', handleConnectError)
                reject(new Error(text.onlineErrorReachServer))
            }, 8000)

            function handleConnect() {
                window.clearTimeout(timeoutId)
                socket.off('connect_error', handleConnectError)
                resolve()
            }

            function handleConnectError() {
                window.clearTimeout(timeoutId)
                socket.off('connect', handleConnect)
                reject(new Error(text.onlineErrorReachServer))
            }

            socket.once('connect', handleConnect)
            socket.once('connect_error', handleConnectError)
            socket.connect()
        })
    }

    useEffect(() => {
        if (!socket.connected) {
            socket.connect()
        }

        function handleJoinedRoom(payload: JoinedRoomPayload) {
            applyJoinedRoom(payload)
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

    /**
     * Creates a new room and initializes the host session.
     */
    function createRoom() {
        void (async () => {
            setError('')
            setIsCreatingRoom(true)

            try {
                await ensureSocketConnected()

                const deck = buildDeck(activeTheme, settings.boardSize)
                const timeoutId = window.setTimeout(() => {
                    setIsCreatingRoom(false)
                    setError(text.onlineErrorTimeout)
                }, 8000)

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
                    (response: {
                        ok: boolean
                        message?: string
                        roomId?: string
                        playerId?: PlayerId
                        playerKey?: string
                    }) => {
                        window.clearTimeout(timeoutId)
                        setIsCreatingRoom(false)

                        if (!response.ok) {
                            setError(response.message ?? text.onlineErrorCreateRoom)
                            return
                        }

                        if (response.roomId && response.playerId && response.playerKey) {
                            applyJoinedRoom({
                                roomId: response.roomId,
                                playerId: response.playerId,
                                playerKey: response.playerKey,
                            })
                            socket.emit('sync_room', { roomId: response.roomId, playerKey: response.playerKey })
                        }
                    },
                )
            } catch (connectionError) {
                setIsCreatingRoom(false)
                setError(
                    connectionError instanceof Error ? connectionError.message : text.onlineErrorConnectServer,
                )
            }
        })()
    }

    /**
     * Joins an existing room by code and reuses reconnect credentials when available.
     */
    function joinRoom() {
        void (async () => {
            const normalized = joinCode.trim().toUpperCase()
            if (!normalized) {
                setError(text.onlineErrorEnterCode)
                return
            }

            setError('')
            setIsJoiningRoom(true)

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

            try {
                await ensureSocketConnected()

                const timeoutId = window.setTimeout(() => {
                    setIsJoiningRoom(false)
                    setError(text.onlineErrorTimeout)
                }, 8000)

                socket.emit(
                    'join_room',
                    { roomId: normalized, playerKey: reconnectKey },
                    (response: {
                        ok: boolean
                        message?: string
                        roomId?: string
                        playerId?: PlayerId
                        playerKey?: string
                    }) => {
                        window.clearTimeout(timeoutId)
                        setIsJoiningRoom(false)

                        if (!response.ok) {
                            setError(response.message ?? text.onlineErrorJoinRoom)
                            return
                        }

                        if (response.roomId && response.playerId && response.playerKey) {
                            applyJoinedRoom({
                                roomId: response.roomId,
                                playerId: response.playerId,
                                playerKey: response.playerKey,
                            })
                            socket.emit('sync_room', { roomId: response.roomId, playerKey: response.playerKey })
                        }
                    },
                )
            } catch (connectionError) {
                setIsJoiningRoom(false)
                setError(
                    connectionError instanceof Error ? connectionError.message : text.onlineErrorConnectServer,
                )
            }
        })()
    }

    /**
     * Requests match start from the host side once both players are connected.
     */
    function startOnlineGame() {
        void (async () => {
            if (!roomId) {
                return
            }

            setError('')

            try {
                await ensureSocketConnected()

                socket.emit('start_game', { roomId }, (response: { ok: boolean; message?: string }) => {
                    if (!response.ok) {
                        setError(response.message ?? text.onlineErrorStartGame)
                    }
                })
            } catch (connectionError) {
                setError(
                    connectionError instanceof Error ? connectionError.message : text.onlineErrorConnectServer,
                )
            }
        })()
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
            setError(text.onlineErrorCopyCode)
        }
    }

    const bothConnected = Boolean(roomState?.playersConnected.blue && roomState?.playersConnected.orange)

    return (
        <main className="online-page">
            <section className="online-page__panel">
                <p className="online-page__kicker">{text.onlineKicker}</p>
                <h1>{text.onlinePlayOnTwoDevices}</h1>
                <p className="online-page__subtitle">{text.onlineCreateOrJoin}</p>
                <p className={`online-connection ${isSocketConnected ? 'is-online' : 'is-offline'}`}>
                    {isSocketConnected ? text.onlineConnected : text.onlineDisconnected}
                </p>

                <div className="online-page__actions">
                    <button type="button" className="button button--primary" onClick={createRoom}>
                        {isCreatingRoom ? text.onlineCreating : text.onlineCreateRoom}
                    </button>
                    <button type="button" className="button button--ghost" onClick={() => navigate('/settings')}>
                        {text.onlineBackToSettings}
                    </button>
                </div>

                <div className="online-join">
                    <label htmlFor="room-code">{text.onlineJoinRoom}</label>
                    <div className="online-join__row">
                        <input
                            id="room-code"
                            value={joinCode}
                            onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                            placeholder={text.onlineEnterCode}
                            maxLength={6}
                        />
                        <button type="button" className="button button--ghost" onClick={joinRoom}>
                            {isJoiningRoom ? text.onlineJoining : text.onlineJoin}
                        </button>
                    </div>
                </div>

                {roomId ? (
                    <div className="online-room">
                        <p>
                            {text.onlineRoomCode}: <strong>{roomId}</strong>
                            <button type="button" className="button button--ghost online-room__copy" onClick={copyRoomCode}>
                                {copied ? text.onlineCopied : text.onlineCopy}
                            </button>
                        </p>
                        <p>
                            {text.onlineYouAre}: <strong>{playerId === 'blue' ? text.onlineBlueHost : text.gameOrange}</strong>
                        </p>
                        <p>
                            {text.onlineConnectedRow}: {roomState?.playersConnected.blue ? `${text.gameBlue} ✓` : text.onlineBlueWaiting} /{' '}
                            {roomState?.playersConnected.orange ? `${text.gameOrange} ✓` : text.onlineOrangeWaiting}
                        </p>
                        {playerId === 'blue' ? (
                            <button
                                type="button"
                                className="button button--primary"
                                onClick={startOnlineGame}
                                disabled={!bothConnected}
                            >
                                {text.onlineStartGame}
                            </button>
                        ) : (
                            <p>{text.onlineWaitingForHost}</p>
                        )}
                    </div>
                ) : null}

                {error ? <p className="online-error">{error}</p> : null}
            </section>
        </main>
    )
}
