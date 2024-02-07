import { Request } from "express";
import { Query } from "express-serve-static-core";

export interface RequestQueryParams extends Request {
    query: Query & {
        steamid: string;
        show_recent_game_bg?: string;
        show_in_game_bg?: string;
    };
}