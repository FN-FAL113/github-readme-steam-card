import { AvatarFrameData, PlayerOwnedGameData, PlayerSummaryData, ProfileBackgroundData, SteamPlayerSummariesData } from "./steam"

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
    profileBgData: ProfileBackgroundData | {}
    avatarFrameData: AvatarFrameData | {}
    avatarBase64: string | ArrayBuffer | undefined
}