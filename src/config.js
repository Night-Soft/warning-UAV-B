import dotenv from "dotenv";
dotenv.config();

let {
    USER_NUMBER: user_number,
    TARGET_CHANNEL: target_channel,
    ID_HASH_SESSION: id_hash_session
} = process.env;

export const USER_NUMBER = user_number,
    TARGET_CHANNEL = Number(target_channel),
    ID_HASH_SESSION = JSON.parse(id_hash_session);

export const { CHANELS, POPULATED_AREAS } = JSON.parse(process.env.KEYWORDS);
export const D_AREA = process.env.D_AREA;
export const D_AREA_EXCLUDES = JSON.parse(process.env.D_AREA_EXCLUDES).excludes;
export const SUMYGO_KEYS = JSON.parse(process.env.SUMYGO_KEYS).keys;
