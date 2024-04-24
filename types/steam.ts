import { AxiosResponse } from 'axios';

// Player Summaries Data
export interface SteamPlayerSummariesData extends AxiosResponse {
    data: { // axios prop
        response: { // steam api root prop
            players: PlayerSummaryData[]
        }
    }
}

export interface PlayerSummaryData {
    steamid: number
    communityvisibilitystate: number
    profilestate: number
    personaname: string
    profileurl: string
    avatar: string
    avatarmedium: string
    avatarfull: string
    avatarhash: string
    lastlogoff: number
    personastate: 1 | 2 | 3 // literals
    realname: string
    primaryclanid: number
    timecreated: string
    personastateflags: number
    gameextrainfo?: string,
    gameid?: string
}
//

// Player Owned Games Data
export interface SteamPlayerOwnedGamesData extends AxiosResponse {
    data: { // axios prop
        response: { // steam api root prop
            game_count: number
            games: PlayerOwnedGameData[]
        }
    }
}

export interface PlayerOwnedGameData {
    // optional fields can be accessed by using own steam api key
    appid: number
    name: string
    playtime_forever: number
    img_icon_url: string
    has_community_visible_stats?: boolean
    playtime_windows_forever?: number
    playtime_mac_forever?: number
    playtime_linux_forever?: number
    rtime_last_played?: number
    content_descriptorids?: number[]
    playtime_disconnected?: number
}
//

// Player Equipped Profile Items
export interface SteamPlayerEquippedProfileItemsData extends AxiosResponse {
    data: { // axios prop
        response: { // steam api root prop
            profile_background: ProfileBackgroundData | {}
            mini_profile_background: object // mini-profile is not utilized
            avatar_frame: AvatarFrameData | {}
            // will add support for this soon, only use animated avatar or frame (cannot enable both due to payload/timout limitations with serverless)
            animated_avatar: AnimatedAvatarData | {} 
            profile_modifier: {}
            steam_deck_keyboard_skin: {}
        }
    }
}

export interface EquippedProfileItemBaseData {
    communityitemid: number
    image_large: string
    name: string
    item_title: string
    item_description: string
    appid: number
    item_type: number
    item_class: number
}

export interface ProfileBackgroundData extends EquippedProfileItemBaseData {
    movie_webm: string
    movie_mp4: string
    movie_webm_small: string
    movie_mp4_small: string
}

export interface AvatarFrameData extends EquippedProfileItemBaseData {
    image_small: string
}

export interface AnimatedAvatarData extends EquippedProfileItemBaseData {
    image_small: string
}
