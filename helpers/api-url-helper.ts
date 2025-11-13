import axios from "axios"

export function getPublicImageApiUrl(path: string): string
{
    return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/${path}`
}

export function getGameBackgroundApiUrl(gameId: string|number): string
{
    // not all header images are cached on cloudflare, use another function below instead
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${gameId}/header.jpg`
}

export async function getGameBackgroundApiUrlV2(gameId: string|number) {
    try {
        const appDetails = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${gameId}&filters=basic`)

        return appDetails.data[gameId].data.header_image
    } catch (error) {
        console.error(error)
    }
}