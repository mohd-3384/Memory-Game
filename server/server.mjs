import { createServer } from 'node:http'
import { Server } from 'socket.io'

const PORT = Number(process.env.PORT ?? 3001)
const RECONNECT_GRACE_MS = 60_000

/** @type {Map<string, RoomState>} */
const rooms = new Map()

const httpServer = createServer((request, response) => {
    if (request.url === '/health' || request.url === '/') {
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ ok: true, service: 'memory-socket' }))
        return
    }

    response.writeHead(404, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ ok: false, message: 'Not found' }))
})
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
})

io.on('connection', (socket) => {
    socket.on('create_room', (payload, ack) => {
        const roomId = createRoomId()
        const room = createRoom(roomId, payload)

        room.players.blue.key = createPlayerKey()
        bindPlayerSocket(room, 'blue', socket.id)
        rooms.set(roomId, room)

        socket.join(roomId)
        socket.emit('joined_room', { roomId, playerId: 'blue', playerKey: room.players.blue.key })
        emitRoomState(roomId)

        ack?.({ ok: true, roomId, playerId: 'blue', playerKey: room.players.blue.key })
    })

    socket.on('join_room', (payload, ack) => {
        const roomId = String(payload?.roomId ?? '').trim().toUpperCase()
        const playerKey = String(payload?.playerKey ?? '').trim()
        const room = rooms.get(roomId)

        if (!room) {
            ack?.({ ok: false, message: 'Room not found.' })
            return
        }

        const reconnectPlayer = playerKey ? getPlayerByKey(room, playerKey) : null
        if (reconnectPlayer) {
            bindPlayerSocket(room, reconnectPlayer, socket.id)
            socket.join(roomId)
            socket.emit('joined_room', { roomId, playerId: reconnectPlayer, playerKey: room.players[reconnectPlayer].key })
            emitRoomState(roomId)
            ack?.({ ok: true, roomId, playerId: reconnectPlayer, playerKey: room.players[reconnectPlayer].key })
            return
        }

        if (room.players.orange.key) {
            ack?.({ ok: false, message: 'Room is full.' })
            return
        }

        room.players.orange.key = createPlayerKey()
        bindPlayerSocket(room, 'orange', socket.id)
        socket.join(roomId)

        socket.emit('joined_room', { roomId, playerId: 'orange', playerKey: room.players.orange.key })
        emitRoomState(roomId)

        ack?.({ ok: true, roomId, playerId: 'orange', playerKey: room.players.orange.key })
    })

    socket.on('start_game', (payload, ack) => {
        const roomId = String(payload?.roomId ?? '').trim().toUpperCase()
        const room = rooms.get(roomId)

        if (!room) {
            ack?.({ ok: false, message: 'Room not found.' })
            return
        }

        if (room.players.blue.socketId !== socket.id) {
            ack?.({ ok: false, message: 'Only host can start the game.' })
            return
        }

        if (!room.players.blue.socketId || !room.players.orange.socketId) {
            ack?.({ ok: false, message: 'Waiting for second player.' })
            return
        }

        resetRound(room)
        room.status = 'playing'
        room.rematchVotes = { blue: false, orange: false }

        emitRoomState(roomId)
        ack?.({ ok: true })
    })

    socket.on('sync_room', (payload) => {
        const roomId = String(payload?.roomId ?? '').trim().toUpperCase()
        const playerKey = String(payload?.playerKey ?? '').trim()
        const room = rooms.get(roomId)

        if (!room) {
            return
        }

        if (playerKey) {
            const playerId = getPlayerByKey(room, playerKey)
            if (playerId) {
                bindPlayerSocket(room, playerId, socket.id)
                socket.join(roomId)
                socket.emit('joined_room', { roomId, playerId, playerKey: room.players[playerId].key })
            }
        }

        emitRoomState(roomId)
    })

    socket.on('flip_card', (payload, ack) => {
        const roomId = String(payload?.roomId ?? '').trim().toUpperCase()
        const cardUid = String(payload?.cardUid ?? '')
        const room = rooms.get(roomId)

        if (!room) {
            ack?.({ ok: false, message: 'Room not found.' })
            return
        }

        if (room.status !== 'playing') {
            ack?.({ ok: false, message: 'Game has not started.' })
            return
        }

        const actor = getPlayerBySocket(room, socket.id)
        if (!actor) {
            ack?.({ ok: false, message: 'Player not in room.' })
            return
        }

        if (actor !== room.currentPlayer) {
            ack?.({ ok: false, message: 'Not your turn.' })
            return
        }

        if (room.isResolvingTurn || room.flippedCards.length === 2) {
            ack?.({ ok: false, message: 'Resolving current turn.' })
            return
        }

        const card = room.deck.find((entry) => entry.uid === cardUid)
        if (!card || card.matched || room.flippedCards.includes(cardUid)) {
            ack?.({ ok: false, message: 'Card is not available.' })
            return
        }

        room.flippedCards.push(cardUid)

        if (room.flippedCards.length === 1) {
            emitRoomState(roomId)
            ack?.({ ok: true })
            return
        }

        room.moves += 1
        room.isResolvingTurn = true

        const [firstUid, secondUid] = room.flippedCards
        const firstCard = room.deck.find((entry) => entry.uid === firstUid)
        const secondCard = room.deck.find((entry) => entry.uid === secondUid)

        if (!firstCard || !secondCard) {
            room.flippedCards = []
            room.isResolvingTurn = false
            emitRoomState(roomId)
            ack?.({ ok: false, message: 'Could not resolve cards.' })
            return
        }

        if (firstCard.pairId === secondCard.pairId) {
            for (const entry of room.deck) {
                if (entry.pairId === firstCard.pairId) {
                    entry.matched = true
                }
            }

            room.scores[room.currentPlayer] += 1
            room.flippedCards = []
            room.isResolvingTurn = false
            room.hasWon = room.deck.every((entry) => entry.matched)
            if (room.hasWon) {
                room.status = 'finished'
                room.rematchVotes = { blue: false, orange: false }
            }

            emitRoomState(roomId)
            ack?.({ ok: true })
            return
        }

        emitRoomState(roomId)

        setTimeout(() => {
            const latestRoom = rooms.get(roomId)
            if (!latestRoom) {
                return
            }

            latestRoom.flippedCards = []
            latestRoom.currentPlayer = latestRoom.currentPlayer === 'blue' ? 'orange' : 'blue'
            latestRoom.isResolvingTurn = false
            emitRoomState(roomId)
        }, 900)

        ack?.({ ok: true })
    })

    socket.on('rematch_request', (payload, ack) => {
        const roomId = String(payload?.roomId ?? '').trim().toUpperCase()
        const room = rooms.get(roomId)

        if (!room) {
            ack?.({ ok: false, message: 'Room not found.' })
            return
        }

        if (room.status !== 'finished') {
            ack?.({ ok: false, message: 'Game is not finished yet.' })
            return
        }

        const actor = getPlayerBySocket(room, socket.id)
        if (!actor) {
            ack?.({ ok: false, message: 'Player not in room.' })
            return
        }

        room.rematchVotes[actor] = true

        if (room.rematchVotes.blue && room.rematchVotes.orange) {
            resetRound(room)
            room.status = 'playing'
            room.rematchVotes = { blue: false, orange: false }
        }

        emitRoomState(roomId)
        ack?.({ ok: true })
    })

    socket.on('leave_room', (payload) => {
        const roomId = String(payload?.roomId ?? '').trim().toUpperCase()
        const playerKey = String(payload?.playerKey ?? '').trim()
        handleLeave(roomId, socket.id, playerKey, true)
    })

    socket.on('disconnect', () => {
        for (const [roomId, room] of rooms.entries()) {
            if (room.players.blue.socketId === socket.id || room.players.orange.socketId === socket.id) {
                handleLeave(roomId, socket.id, '', false)
            }
        }
    })
})

httpServer.listen(PORT, () => {
    console.log(`Socket server running on http://localhost:${PORT}`)
})

function emitRoomState(roomId) {
    const room = rooms.get(roomId)
    if (!room) {
        return
    }

    io.to(roomId).emit('room_state', {
        roomId: room.id,
        settings: room.settings,
        status: room.status,
        deck: room.deck,
        flippedCards: room.flippedCards,
        moves: room.moves,
        currentPlayer: room.currentPlayer,
        scores: room.scores,
        hasWon: room.hasWon,
        playersConnected: {
            blue: Boolean(room.players.blue.socketId),
            orange: Boolean(room.players.orange.socketId),
        },
        rematchVotes: room.rematchVotes,
        themeFront: room.themeFront,
    })
}

function handleLeave(roomId, socketId, playerKey, explicit) {
    const room = rooms.get(roomId)
    if (!room) {
        return
    }

    let playerId = null
    if (playerKey) {
        playerId = getPlayerByKey(room, playerKey)
    }

    if (!playerId) {
        playerId = getPlayerBySocket(room, socketId)
    }

    if (!playerId) {
        return
    }

    const slot = room.players[playerId]

    if (slot.socketId === socketId || explicit) {
        slot.socketId = null
    }

    if (explicit) {
        clearPlayerTimer(slot)
        slot.key = ''
        slot.disconnectedAt = null
    } else {
        slot.disconnectedAt = Date.now()
        clearPlayerTimer(slot)
        slot.disconnectTimer = setTimeout(() => {
            const latestRoom = rooms.get(roomId)
            if (!latestRoom) {
                return
            }

            const latestSlot = latestRoom.players[playerId]
            if (!latestSlot.socketId) {
                latestSlot.key = ''
                latestSlot.disconnectedAt = null
            }

            cleanupRoom(roomId)
            emitRoomState(roomId)
        }, RECONNECT_GRACE_MS)
    }

    room.rematchVotes[playerId] = false
    room.status = room.status === 'finished' ? 'finished' : 'waiting'
    room.flippedCards = []
    room.isResolvingTurn = false

    cleanupRoom(roomId)
    if (!rooms.has(roomId)) {
        return
    }

    emitRoomState(roomId)
}

function getPlayerBySocket(room, socketId) {
    if (room.players.blue.socketId === socketId) {
        return 'blue'
    }

    if (room.players.orange.socketId === socketId) {
        return 'orange'
    }

    return null
}

function getPlayerByKey(room, playerKey) {
    if (room.players.blue.key && room.players.blue.key === playerKey) {
        return 'blue'
    }

    if (room.players.orange.key && room.players.orange.key === playerKey) {
        return 'orange'
    }

    return null
}

function bindPlayerSocket(room, playerId, socketId) {
    const slot = room.players[playerId]
    slot.socketId = socketId
    slot.disconnectedAt = null
    clearPlayerTimer(slot)
}

function clearPlayerTimer(slot) {
    if (slot.disconnectTimer) {
        clearTimeout(slot.disconnectTimer)
        slot.disconnectTimer = null
    }
}

function resetRound(room) {
    room.flippedCards = []
    room.moves = 0
    room.scores = { blue: 0, orange: 0 }
    room.currentPlayer = 'blue'
    room.isResolvingTurn = false
    room.hasWon = false
    room.deck = room.deck.map((card) => ({ ...card, matched: false }))
}

function cleanupRoom(roomId) {
    const room = rooms.get(roomId)
    if (!room) {
        return
    }

    const noBlue = !room.players.blue.key && !room.players.blue.socketId
    const noOrange = !room.players.orange.key && !room.players.orange.socketId
    if (noBlue && noOrange) {
        rooms.delete(roomId)
    }
}

function createRoom(roomId, payload) {
    const settings = {
        themeId: payload?.settings?.themeId ?? 'code-vibes',
        boardSize: payload?.settings?.boardSize ?? 16,
    }

    const deck = Array.isArray(payload?.deck) ? payload.deck : []
    const themeFront = typeof payload?.themeFront === 'string' ? payload.themeFront : ''

    return {
        id: roomId,
        settings,
        status: 'waiting',
        deck,
        flippedCards: [],
        moves: 0,
        currentPlayer: 'blue',
        scores: { blue: 0, orange: 0 },
        hasWon: false,
        isResolvingTurn: false,
        rematchVotes: { blue: false, orange: false },
        players: {
            blue: { socketId: null, key: '', disconnectedAt: null, disconnectTimer: null },
            orange: { socketId: null, key: '', disconnectedAt: null, disconnectTimer: null },
        },
        themeFront,
    }
}

function createRoomId() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

    for (let attempt = 0; attempt < 30; attempt += 1) {
        let id = ''
        for (let index = 0; index < 6; index += 1) {
            const randomIndex = Math.floor(Math.random() * alphabet.length)
            id += alphabet[randomIndex]
        }

        if (!rooms.has(id)) {
            return id
        }
    }

    return `${Date.now().toString(36).toUpperCase().slice(-6)}`
}

function createPlayerKey() {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`.toUpperCase()
}

/**
 * @typedef {{
 *   uid: string,
 *   pairId: string,
 *   image: string,
 *   matched: boolean
 * }} ServerCard
 */

/**
 * @typedef {{
 *   id: string,
 *   settings: { themeId: string, boardSize: number },
 *   status: 'waiting' | 'playing' | 'finished',
 *   deck: ServerCard[],
 *   flippedCards: string[],
 *   moves: number,
 *   currentPlayer: 'blue' | 'orange',
 *   scores: { blue: number, orange: number },
 *   hasWon: boolean,
 *   isResolvingTurn: boolean,
 *   rematchVotes: { blue: boolean, orange: boolean },
 *   players: {
 *     blue: { socketId: string | null, key: string, disconnectedAt: number | null, disconnectTimer: ReturnType<typeof setTimeout> | null },
 *     orange: { socketId: string | null, key: string, disconnectedAt: number | null, disconnectTimer: ReturnType<typeof setTimeout> | null }
 *   },
 *   themeFront: string
 * }} RoomState
 */