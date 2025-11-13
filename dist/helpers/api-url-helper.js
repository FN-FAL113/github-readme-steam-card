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
exports.getGameBackgroundApiUrlV2 = exports.getGameBackgroundApiUrl = exports.getPublicImageApiUrl = void 0;
const axios_1 = __importDefault(require("axios"));
function getPublicImageApiUrl(path) {
    return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/${path}`;
}
exports.getPublicImageApiUrl = getPublicImageApiUrl;
function getGameBackgroundApiUrl(gameId) {
    // not all header images are cached on cloudflare, use another function below instead
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${gameId}/header.jpg`;
}
exports.getGameBackgroundApiUrl = getGameBackgroundApiUrl;
function getGameBackgroundApiUrlV2(gameId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const appDetails = yield axios_1.default.get(`https://store.steampowered.com/api/appdetails?appids=${gameId}&filters=basic`);
            return appDetails.data[gameId].data.header_image;
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.getGameBackgroundApiUrlV2 = getGameBackgroundApiUrlV2;
