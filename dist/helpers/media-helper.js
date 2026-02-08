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
exports.fetchAvatar = exports.fetchAvatarFrame = exports.fetchProfileBackground = exports.resolveGameBackground = exports.fetchGameBackground = exports.fetchEncodedLocalMedia = exports.fetchEncodedWebMedia = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const axios_1 = __importDefault(require("axios"));
const api_url_helper_1 = require("./api-url-helper");
const svg_helper_1 = require("./svg-helper");
const contants_1 = require("../types/contants");
function fetchEncodedWebMedia(url, encoding) {
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
exports.fetchEncodedWebMedia = fetchEncodedWebMedia;
function fetchEncodedLocalMedia(path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield (0, promises_1.readFile)(path, { encoding: 'base64' });
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.fetchEncodedLocalMedia = fetchEncodedLocalMedia;
function fetchGameBackground(gameId) {
    return __awaiter(this, void 0, void 0, function* () {
        const backgroundUrl = yield (0, api_url_helper_1.getGameBackgroundApiUrlV2)(gameId);
        return fetchEncodedWebMedia(backgroundUrl, 'base64');
    });
}
exports.fetchGameBackground = fetchGameBackground;
function resolveGameBackground(svgData, showRecentGameBg, showInGameBg, hasInGameName) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userData, recentGame } = svgData;
        // Priority 1: In-game background
        if (hasInGameName && showInGameBg && (userData === null || userData === void 0 ? void 0 : userData.gameid)) {
            const encodedBg = yield fetchGameBackground(userData.gameid);
            return (0, svg_helper_1.mapSvgGameBgMetadata)(encodedBg, contants_1.GAME_BG_DIMENSIONS);
        }
        // Priority 2: Recent game background
        if (!hasInGameName && showRecentGameBg && (recentGame === null || recentGame === void 0 ? void 0 : recentGame.appid)) {
            const encodedBg = yield fetchGameBackground(recentGame.appid);
            return (0, svg_helper_1.mapSvgGameBgMetadata)(encodedBg, contants_1.GAME_BG_DIMENSIONS);
        }
        // Fallback: Steam logo
        const fallbackBg = yield fetchEncodedLocalMedia((0, path_1.join)('dist', 'public', 'Steam-Logo-Transparent.png'));
        return (0, svg_helper_1.mapSvgGameBgMetadata)(fallbackBg, contants_1.FALLBACK_BG_DIMENSIONS);
    });
}
exports.resolveGameBackground = resolveGameBackground;
function fetchProfileBackground(profileBgData) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!('image_large' in profileBgData)) {
            return undefined;
        }
        return fetchEncodedWebMedia((0, api_url_helper_1.getPublicImageApiUrl)(profileBgData.image_large), 'base64');
    });
}
exports.fetchProfileBackground = fetchProfileBackground;
function fetchAvatarFrame(avatarFrameData, useAnimated) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!('image_small' in avatarFrameData)) {
            return undefined;
        }
        const imageUrl = useAnimated
            ? avatarFrameData.image_large
            : avatarFrameData.image_small;
        return fetchEncodedWebMedia((0, api_url_helper_1.getPublicImageApiUrl)(imageUrl), 'base64');
    });
}
exports.fetchAvatarFrame = fetchAvatarFrame;
// check if user wants to use animated avatar if exists else fallback to non-animated avatar
function fetchAvatar(userData, equippedProfileItems, animated_avatar) {
    return __awaiter(this, void 0, void 0, function* () {
        if (animated_avatar == "true" && 'image_small' in equippedProfileItems.data.response.animated_avatar) {
            return yield fetchEncodedWebMedia((0, api_url_helper_1.getPublicImageApiUrl)(equippedProfileItems.data.response.animated_avatar.image_small), 'base64');
        }
        return yield fetchEncodedWebMedia(userData.avatarfull, 'base64');
    });
}
exports.fetchAvatar = fetchAvatar;
