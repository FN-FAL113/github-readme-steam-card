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
const axios_1 = __importDefault(require("axios"));
const media_helper_1 = require("../helpers/media-helper");
const svg_helper_1 = require("../helpers/svg-helper");
const contants_1 = require("../types/contants");
const NotFoundError = require('../errors/not-found');
// Steam API resources
// https://steamapi.xpaw.me/
// https://developer.valvesoftware.com/wiki/Steam_Web_API
// https://wiki.teamfortress.com/wiki/User:RJackson/StorefrontAPI#appdetails
const getStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { query: { steamid, show_recent_game_bg, show_in_game_bg, animated_avatar } } = req;
    // condition for displaying recent or in-game image
    const showRecentGameBg = show_recent_game_bg != null ? Boolean(show_recent_game_bg) : true;
    const showInGameBg = show_in_game_bg != null ? Boolean(show_in_game_bg) : true;
    // steam api user data url
    const userUrl = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamid}`;
    // steam api user game data url
    const ownedGamesUrl = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}&include_appinfo=true&include_played_free_games=true`;
    // steam api user equipped profile items url
    const equippedProfileItemsUrl = `https://api.steampowered.com/IPlayerService/GetProfileItemsEquipped/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}`;
    try {
        const [getUserData, getOwnedGamesData, equippedProfileItems] = yield Promise.all([
            yield axios_1.default.get(userUrl),
            yield axios_1.default.get(ownedGamesUrl),
            yield axios_1.default.get(equippedProfileItemsUrl)
        ]);
        if (getUserData.data.response.players[0]) {
            const userData = getUserData.data.response.players[0];
            const ownedGamesData = getOwnedGamesData.data.response.games;
            const profileBgData = equippedProfileItems.data.response.profile_background;
            const avatarFrameData = equippedProfileItems.data.response.avatar_frame;
            let user_status = { status: 'Offline', statusColor: '#57cbde' };
            // initialize user status data
            if (userData.personastate === 1) {
                user_status['status'] = 'Online';
            }
            else if (userData.personastate === 2) {
                user_status['status'] = 'Busy';
            }
            else if (userData.personastate === 3) {
                user_status['status'] = 'Away';
            }
            else {
                // default to offline with gray font color
                user_status['statusColor'] = '#898989';
            }
            const recentGame = ownedGamesData ? getRecentlyPlayedGameData(ownedGamesData) : null;
            const avatarBase64 = yield (0, media_helper_1.fetchAvatar)(userData, equippedProfileItems, animated_avatar);
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
function getRecentlyPlayedGameData(gamesArr) {
    var _a, _b;
    // validate if playtime data can be accessed
    if (!((_a = gamesArr[0]) === null || _a === void 0 ? void 0 : _a.rtime_last_played) && !((_b = gamesArr[1]) === null || _b === void 0 ? void 0 : _b.rtime_last_played)) {
        return null;
    }
    let recentGameDataObj = null;
    // get recent game played by comparing time last played
    for (const gameDataObj of gamesArr) {
        if (!recentGameDataObj) {
            recentGameDataObj = gameDataObj;
        }
        else if (gameDataObj.rtime_last_played > recentGameDataObj.rtime_last_played) {
            recentGameDataObj = gameDataObj;
        }
    }
    return recentGameDataObj;
}
function initSvg(svgData, showRecentGameBg, showInGameBg, animated_avatar) {
    return __awaiter(this, void 0, void 0, function* () {
        const { user_status, userData, recentGame, profileBgData, avatarFrameData } = svgData;
        const status = user_status.status;
        const statusColor = user_status.statusColor;
        const username = (0, svg_helper_1.truncateText)(userData.personaname, {
            maxLength: contants_1.TEXT_LIMITS.USERNAME,
            truncateAt: contants_1.TEXT_LIMITS.USERNAME_TRUNCATE,
        });
        const inGameName = (0, svg_helper_1.truncateText)(userData.gameextrainfo, {
            maxLength: contants_1.TEXT_LIMITS.GAME_NAME,
            truncateAt: contants_1.TEXT_LIMITS.IN_GAME_TRUNCATE,
        });
        const recentGameName = (0, svg_helper_1.truncateText)(recentGame === null || recentGame === void 0 ? void 0 : recentGame.name, {
            maxLength: contants_1.TEXT_LIMITS.GAME_NAME,
            truncateAt: contants_1.TEXT_LIMITS.RECENT_GAME_TRUNCATE,
        });
        // fetch all assets in parallel for better performance
        const [svgGameBgMetadata, profileBgBase64, avatarFrameBase64] = yield Promise.all([
            (0, media_helper_1.resolveGameBackground)(svgData, showRecentGameBg, showInGameBg, !!inGameName),
            (0, media_helper_1.fetchProfileBackground)(profileBgData),
            (0, media_helper_1.fetchAvatarFrame)(avatarFrameData, animated_avatar === 'true'),
        ]);
        return (0, svg_helper_1.buildSvg)(svgData, svgGameBgMetadata, profileBgBase64, avatarFrameBase64, inGameName, recentGameName, username, status, statusColor);
    });
}
