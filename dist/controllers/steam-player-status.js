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
const promises_1 = require("fs/promises");
const path_1 = require("path");
const axios_1 = __importDefault(require("axios"));
const NotFoundError = require('../errors/not-found');
const getStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { query: { steamid, show_recent_game_bg, show_in_game_bg, animated_avatar } } = req;
    // conditionals for displaying recent or in game background
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
            throw new NotFoundError('user not found');
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
            return yield getUrlMediaEncoded(setAndGetPublicImageUrl(equippedProfileItems.data.response.animated_avatar.image_small), 'base64');
        }
        return yield getUrlMediaEncoded(userData.avatarfull, 'base64');
    });
}
function getRecentlyPlayedGameData(gamesArr) {
    var _a, _b;
    let recentGameDataObj = null;
    // validate if user owned game playtime data can be accessed
    if (!((_a = gamesArr[0]) === null || _a === void 0 ? void 0 : _a.rtime_last_played) && !((_b = gamesArr[1]) === null || _b === void 0 ? void 0 : _b.rtime_last_played)) {
        return null;
    }
    // get recent game played by comparing time last played
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
        const username = svgData.userData.personaname.length > 20 ? svgData.userData.personaname.slice(0, 16) + '...' : svgData.userData.personaname;
        const inGameName = ((_a = svgData.userData) === null || _a === void 0 ? void 0 : _a.gameextrainfo) ?
            ((_b = svgData.userData) === null || _b === void 0 ? void 0 : _b.gameextrainfo.length) > 32 ?
                ((_c = svgData.userData) === null || _c === void 0 ? void 0 : _c.gameextrainfo.slice(0, 26)) + '...'
                :
                    (_d = svgData.userData) === null || _d === void 0 ? void 0 : _d.gameextrainfo
            : null;
        const recentGameName = (svgData === null || svgData === void 0 ? void 0 : svgData.recentGame) ?
            svgData.recentGame.name.length > 32 ?
                svgData.recentGame.name.slice(0, 26) + '...'
                :
                    svgData.recentGame.name
            : null;
        let gameBgMetadata;
        if (inGameName && showInGameBg) {
            // if in game data and showIngameBg param is true then display game background else default to steam logo        
            gameBgMetadata = [yield getUrlMediaEncoded(setAndGetGameBgUrl(svgData.userData.gameid), 'base64'), '350', '68', '128px', '128px'];
        }
        else if (!inGameName && recentGameName && showRecentGameBg) {
            // if recent game data and showRecentgameBg param is true then display game background else default to steam logo
            gameBgMetadata = [yield getUrlMediaEncoded(setAndGetGameBgUrl(svgData.recentGame.appid), 'base64'), '350', '68', '128px', '128px'];
        }
        else {
            // fallback to steam logo
            gameBgMetadata = [yield getBase64LocalMedia((0, path_1.join)('public', 'Steam-Logo-Transparent.png')), '414', '100', '64px', '64px'];
        }
        // profile background
        let profileBgBase64;
        if ('image_large' in svgData.profileBgData) {
            profileBgBase64 = yield getUrlMediaEncoded(setAndGetPublicImageUrl(svgData.profileBgData.image_large), 'base64');
        }
        // avatar frame (animated/non-animated)
        // optimizing Animated PNG (APNG) not yet supported: https://github.com/lovell/sharp/issues/2375
        let avatarFrameBase64;
        if ('image_small' in svgData.avatarFrameData) {
            const url = animated_avatar == "true" ? svgData.avatarFrameData.image_large : svgData.avatarFrameData.image_small;
            avatarFrameBase64 = yield getUrlMediaEncoded(setAndGetPublicImageUrl(url), 'base64');
        }
        return `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="500" height="200">
            <g>
                <!-- main box container -->
                <rect width="500" height="200" fill="#1b2838" rx="8" ry="8" />    
                
                <!-- profile background -->
                ${profileBgBase64 ?
            `
                        <image 
                            href="data:image/jpeg;base64,${profileBgBase64}" 
                            x="0"  
                            y="0"  
                            width="500" 
                            height="200" 
                            preserveAspectRatio="none" 
                            opacity="0.4" 
                        />
                    `
            :
                ""}

                <!-- game name and background image, fallback to steam logo -->
                ${inGameName ?
            `
                        <image 
                            href="data:image/jpeg;base64,${gameBgMetadata[0]}" 
                            x="${gameBgMetadata[1]}"  
                            y="${gameBgMetadata[2]}"  
                            width="${gameBgMetadata[3]}" 
                            height="${gameBgMetadata[4]}"
                        />
                        <text x="160" y="130" font-size="12" fill="#a3cf06" class="game-header-status">In-Game</text>
                        <text x="160" y="150" font-size="16" fill="#a3cf06">${inGameName}</text>
                    ` :
            recentGameName ?
                `
                        <image 
                            href="data:image/jpeg;base64,${gameBgMetadata[0]}" 
                            x="${gameBgMetadata[1]}"  
                            y="${gameBgMetadata[2]}"  
                            width="${gameBgMetadata[3]}" 
                            height="${gameBgMetadata[4]}" 
                        />
                        <text x="160" y="120" font-size="12" fill="#898989" class="game-header-status">Last Played</text>
                        <text x="160" y="140" font-size="14" fill="#898989">${recentGameName}</text>
                        <text x="160" y="158" font-size="12" fill="#898989">${(svgData.recentGame.playtime_forever / 60).toFixed(1)} hours played</text>
                    ` :
                `
                        <image 
                            href="data:image/jpeg;base64,${gameBgMetadata[0]}" 
                            x="${gameBgMetadata[1]}"  
                            y="${gameBgMetadata[2]}"  
                            width="${gameBgMetadata[3]}" 
                            height="${gameBgMetadata[4]}"
                        />
                    `}
                  
                <!-- profile image -->
                <image 
                    x="20" 
                    y="36" 
                    width="125px" 
                    height="125px" 
                    href="data:image/jpeg;base64,${svgData.avatarBase64}"  
                />

                <!-- profile border frame -->
                ${avatarFrameBase64 ?
            `
                        <image 
                            href="data:image/png;base64,${avatarFrameBase64}" 
                            x="6"  
                            y="22"  
                            width="152px" 
                            height="152px" 
                            preserveAspectRatio="none" 
                        />
                    `
            :
                `
                        <rect 
                            x="20"
                            y="36" 
                            width="125px" 
                            height="125px" 
                            fill="none" 
                            stroke="${inGameName ? `#a3cf06` : statusColor}" 
                            stroke-width="3" 
                            ${status == 'Away' ? `stroke-dasharray="3,3"` : ""} 
                        />
                    `}
                
                <!-- username -->
                <text x="160" y="56" font-size="16" fill="${statusColor}">${username}</text>
                
                <!-- user status -->
                <text x="430" y="56" font-size="16" fill="${statusColor}">${status}</text>      
            </g>

            <style type="text/css">
                svg {
                    border-radius: 8px;
                }

                text { 
                    font-family: Arial, Helvetica, Verdana, sans-serif; 
                    text-shadow: 1px 2px 4px black;
                }
            </style>
        </svg> 
   `;
    });
}
function getUrlMediaEncoded(url, encoding) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const image = yield axios_1.default.get(url, {
                responseType: encoding === 'base64' ? 'text' : 'arraybuffer',
                responseEncoding: encoding === 'base64' ? 'base64' : 'binary'
            });
            return image.data;
        }
        catch (error) {
            console.error(error);
        }
    });
}
function getBase64LocalMedia(path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const imgBase64 = yield (0, promises_1.readFile)(path, { encoding: 'base64' });
            return imgBase64;
        }
        catch (error) {
            console.error(error);
        }
    });
}
/**
 * Retrieve public image asset url based from given url path segement/s
 * @param {string} path web url path segment/s
 * @returns {string} formed url
 */
function setAndGetPublicImageUrl(path) {
    return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/${path}`;
}
/**
 * Retrieve game background image asset url based from given game id
 * @param {string} path web url path segment
 * @returns {string} formed url
 */
function setAndGetGameBgUrl(gameId) {
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${gameId}/header.jpg`;
}
