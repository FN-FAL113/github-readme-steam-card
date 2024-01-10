import { AvatarFrameData, PlayerOwnedGameData, PlayerSummaryData, ProfileBackgroundData, SteamApiPlayerSummariesData } from "./steam"

export type SvgGameBackgroundMetadata = [
    base64: string | ArrayBuffer | undefined, 
    x: string, 
    y: string, 
    width: string, 
    height: string
] | null

export interface SvgData {
    userData: PlayerSummaryData
    user_status: { status: string, statusColor: string }
    recentGame: PlayerOwnedGameData | null
    profileBg: ProfileBackgroundData | {} | null
    avatarFrame: AvatarFrameData | {} | null
    avatarBase64: string | ArrayBuffer | undefined
}