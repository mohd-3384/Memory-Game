import type { Theme } from '../interfaces/game.interface'

const imageModules = import.meta.glob('../assets/images/**/*.svg', {
    eager: true,
    import: 'default',
}) as Record<string, string>

/**
 * Resolves an image asset path from the Vite glob map.
 */
function imageUrl(path: string): string {
    const modulePath = `../assets/images/${path}`
    const fileUrl = imageModules[modulePath]

    if (!fileUrl) {
        throw new Error(`Missing image asset: ${path}`)
    }

    return fileUrl
}

/**
 * Escapes special regex characters from a plain string.
 */
function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Collects and sorts all card assets for a theme folder by numeric suffix.
 */
function collectThemeCards(folder: string, baseName: string): string[] {
    const escapedBaseName = escapeRegex(baseName)
    const filePattern = new RegExp(
        `^../assets/images/${folder}/${escapedBaseName}(?: \\((\\d+)\\))?\\.svg$`,
    )

    const sortedModuleEntries = Object.entries(imageModules)
        .map(([modulePath, fileUrl]) => {
            const match = modulePath.match(filePattern)
            if (!match) {
                return null
            }

            const index = match[1] ? Number(match[1]) : 0
            return { index, fileUrl }
        })
        .filter((entry): entry is { index: number; fileUrl: string } => entry !== null)
        .sort((a, b) => a.index - b.index)

    const cards = sortedModuleEntries.map((entry) => entry.fileUrl)

    if (cards.length === 0) {
        throw new Error(`Missing theme card assets for folder: ${folder}`)
    }

    return cards
}

export const themes: Theme[] = [
    {
        id: 'code-vibes',
        label: 'Code vibes theme',
        front: imageUrl('code-vibes/Front.svg'),
        cards: collectThemeCards('code-vibes', 'Property 1=Component 22'),
        accent: '#27d6c4',
    },
    {
        id: 'games',
        label: 'Gaming theme',
        front: imageUrl('games/Property 1=Component 1.svg'),
        cards: collectThemeCards('games', 'Property 1=Component 2'),
        accent: '#f73aa7',
    },
    {
        id: 'DA',
        label: 'DA Projects theme',
        front: imageUrl('DA/Property 1=Component 1.svg'),
        cards: collectThemeCards('DA', 'Property 1=Component 2'),
        accent: '#0d84af',
    },
    {
        id: 'food',
        label: 'Foods theme',
        front: imageUrl('food/frond.svg'),
        cards: collectThemeCards('food', 'Property 1=Component 3'),
        accent: '#ff9b2f',
    },
]

/**
 * Returns the theme by id or falls back to the first available theme.
 */
export function getThemeById(themeId: Theme['id']): Theme {
    return themes.find((theme) => theme.id === themeId) ?? themes[0]
}
