"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatus = void 0;
const path_1 = require("path");
const axios_1 = __importDefault(require("axios"));
const media_helper_1 = require("../helpers/media-helper");
const api_url_helper_1 = require("../helpers/api-url-helper");
const svg_helper_1 = require("../helpers/svg-helper");
const NotFoundError = require('../errors/not-found');
// Steam API resources
// https://steamapi.xpaw.me/
// https://developer.valvesoftware.com/wiki/Steam_Web_API
// https://wiki.teamfortress.com/wiki/User:RJackson/StorefrontAPI#appdetails
const getStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { query: { steamid, show_recent_game_bg, show_in_game_bg, animated_avatar } } = req;
    // conditions for displaying recent or in game background
    const showRecentGameBg = show_recent_game_bg != undefined ? show_recent_game_bg === 'true' : true;
    const showInGameBg = show_in_game_bg != undefined ? show_in_game_bg === 'true' : true;
    // steam api user data url
    const userUrl = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamid}`;
    // steam api user game data url
    const ownedGamesUrl = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}&include_appinfo=true&include_played_free_games=true`;
    // steam api user equipped profile items url
    const equippedProfileItemsUrl = `https://api.steampowered.com/IPlayerService/GetProfileItemsEquipped/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}`;
    try {
        const getUserData = yield axios_1.default.get(userUrl);
        const userData = getUserData.data.response.players[0];
        if (userData) {
            const getOwnedGamesData = yield axios_1.default.get(ownedGamesUrl);
            const ownedGamesData = getOwnedGamesData.data.response.games;
            const equippedProfileItems = yield axios_1.default.get(equippedProfileItemsUrl);
            const profileBgData = equippedProfileItems.data.response.profile_background;
            const avatarFrameData = equippedProfileItems.data.response.avatar_frame;
            let user_status = null;
            // check user status to initialize user status data
            if (userData.personastate === 1) {
                user_status = { status: 'Online', statusColor: '#57cbde' };
            }
            else if (userData.personastate === 2) {
                user_status = { status: 'Busy', statusColor: '#57cbde' };
            }
            else if (userData.personastate === 3) {
                user_status = { status: 'Away', statusColor: '#57cbde' };
            }
            else {
                user_status = { status: 'Offline', statusColor: '#898989' };
            }
            const recentGame = ownedGamesData ? getRecentlyPlayedGameData(ownedGamesData) : null;
            const avatarBase64 = yield getAvatar(userData, equippedProfileItems, animated_avatar);
            const svgData = {
                userData,
                user_status,
                recentGame,
                profileBgData,
                avatarFrameData,
                avatarBase64,
            };
            const svg = yield initSvg(svgData, showRecentGameBg, showInGameBg, animated_avatar);
            // serve a stale cache response while revalidating cache content for subsequent requests
            res.set('Cache-Control', 's-maxage=1, stale-while-revalidate');
            res.set('Content-Type', 'image/svg+xml');
            res.status(200).send(svg);
        }
        else {
            throw new NotFoundError('steam user not found');
        }
    }
    catch (error) {
        next(error);
    }
});
exports.getStatus = getStatus;
// check if user wants to use animated avatar if exists else fallback to non-animated avatar
function getAvatar(userData, equippedProfileItems, animated_avatar) {
    return __awaiter(this, void 0, void 0, function* () {
        if (animated_avatar == "true" && 'image_small' in equippedProfileItems.data.response.animated_avatar) {
            return yield (0, media_helper_1.getEncodedWebMedia)((0, api_url_helper_1.getPublicImageApiUrl)(equippedProfileItems.data.response.animated_avatar.image_small), 'base64');
        }
        return yield (0, media_helper_1.getEncodedWebMedia)(userData.avatarfull, 'base64');
    });
}
function getRecentlyPlayedGameData(gamesArr) {
    var _a, _b;
    // validate if user owned game playtime data can be accessed
    if (!((_a = gamesArr[0]) === null || _a === void 0 ? void 0 : _a.rtime_last_played) && !((_b = gamesArr[1]) === null || _b === void 0 ? void 0 : _b.rtime_last_played)) {
        return null;
    }
    let recentGameDataObj = null;
    // get user recent game played by comparing time last played
    for (const gameDataObj of gamesArr) {
        if (!recentGameDataObj) { // initialize recent game data arr with first owned game data object
            recentGameDataObj = gameDataObj;
        }
        else if (gameDataObj.rtime_last_played > recentGameDataObj.rtime_last_played) {
            recentGameDataObj = gameDataObj;
        }
    }
    return recentGameDataObj;
}
function initSvg(svgData, showRecentGameBg, showInGameBg, animated_avatar) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        // user status (name and font color)
        const status = svgData.user_status.status;
        const statusColor = svgData.user_status.statusColor;
        const username = svgData.userData.personaname.length > 20 ?
            svgData.userData.personaname.slice(0, 16) + '...' : svgData.userData.personaname;
        const inGameName = ((_a = svgData.userData) === null || _a === void 0 ? void 0 : _a.gameextrainfo) ?
            ((_b = svgData.userData) === null || _b === void 0 ? void 0 : _b.gameextrainfo.length) > 32 ?
                ((_c = svgData.userData) === null || _c === void 0 ? void 0 : _c.gameextrainfo.slice(0, 25)) + '...'
                :
                    (_d = svgData.userData) === null || _d === void 0 ? void 0 : _d.gameextrainfo
            : null;
        const recentGameName = (svgData === null || svgData === void 0 ? void 0 : svgData.recentGame) ?
            svgData.recentGame.name.length > 32 ?
                svgData.recentGame.name.slice(0, 26) + '...'
                :
                    svgData.recentGame.name
            : null;
        // in-game or recent game background, it fallbacks to steam logo
        // seems to be that other games are cached on fastly that requires the hashed resource endpoint which we can't access through available steam game api
        // eg. `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3478050/3b653f6352ba1e603205721e20ab370ed4caf1de/header.jpg?t=1762397148`
        // if the game bg cannot be fetched from steam cloudflare cdn using game id then it will display a malformed image  
        // but I just found an alternative way after doing some exploration where game header image can be accessed easily
        // eg. https://store.steampowered.com/api/appdetails?appids=3478050&filters=basic
        let svgGameBgMetadata;
        if (inGameName && showInGameBg) {
            // if in game data is present and showIngameBg param is true then display game background       
            svgGameBgMetadata = (0, svg_helper_1.mapSvgGameBgMetadata)(yield (0, media_helper_1.getEncodedWebMedia)(yield (0, api_url_helper_1.getGameBackgroundApiUrlV2)(svgData.userData.gameid), 'base64'), '350', '68', '128px', '128px');
        }
        else if (!inGameName && recentGameName && showRecentGameBg) {
            // if not in game, recent game data is present and showRecentgameBg param is true then display game background
            svgGameBgMetadata = (0, svg_helper_1.mapSvgGameBgMetadata)(yield (0, media_helper_1.getEncodedWebMedia)(yield (0, api_url_helper_1.getGameBackgroundApiUrlV2)(svgData.recentGame.appid), 'base64'), '350', '68', '128px', '128px');
        }
        else {
            // fallback to steam logo
            svgGameBgMetadata = (0, svg_helper_1.mapSvgGameBgMetadata)(yield (0, media_helper_1.getEncodedLocalMedia)((0, path_1.join)('dist', 'public', 'Steam-Logo-Transparent.png')), '414', '100', '64px', '64px');
        }
        // profile equipped background
        let profileBgBase64;
        if ('image_large' in svgData.profileBgData) {
            profileBgBase64 = yield (0, media_helper_1.getEncodedWebMedia)((0, api_url_helper_1.getPublicImageApiUrl)(svgData.profileBgData.image_large), 'base64');
        }
        // avatar frame (static or animated)
        // optimizing Animated PNG (APNG) not yet supported: https://github.com/lovell/sharp/issues/2375
        let avatarFrameBase64;
        if ('image_small' in svgData.avatarFrameData) {
            const url = animated_avatar == "true" ? svgData.avatarFrameData.image_large : svgData.avatarFrameData.image_small;
            avatarFrameBase64 = yield (0, media_helper_1.getEncodedWebMedia)((0, api_url_helper_1.getPublicImageApiUrl)(url), 'base64');
        }
        return (0, svg_helper_1.buildSvg)(svgData, svgGameBgMetadata, profileBgBase64, avatarFrameBase64, inGameName, recentGameName, username, status, statusColor);
    });
}
