import input from "input";
import fs from "fs";
import { ID_HASH_SESSION } from "./config.js";

export const readJson = async (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, "utf8", (err, jsonString) => {
            if (err) {
                console.log("File read failed:", err);
                return reject(err);
            }

            try {
                resolve(JSON.parse(jsonString));
            } catch (error) {
                reject(error);
            }
            
        });
    });
}

export async function getKeywords(path) {
    if (path === undefined) {
        path = `${process.cwd()}/keywords.json`
    }
    const keywords = await readJson(path);
    return {
        monitoredChannels: keywords.chanels,
        populatedAreas: keywords.populatedAreas
    }
}

async function inputIdHashSession() {
    return {
        API_ID: parseInt(await input.text("API_ID: ")),
        API_HASH: await input.text("API_HASH: "),
        SESSION_STRING: await input.text("SESSION_STRING: ")
    }
}

export async function getIdHashSession(user) {
    try {
        if (!ID_HASH_SESSION[user]) throw new Error();
        return ID_HASH_SESSION[user];
    } catch (e) {
        console.log("error read IdHashSession.json\n");
        return await inputIdHashSession();
    }
}

export async function findGroupIdByName(client, groupName) {
    const dialogs = await client.getDialogs({});
    for (const dialog of dialogs) {
        if (
            dialog.isGroup &&
            dialog.name.toLowerCase() === groupName.toLowerCase()
        ) {
            console.log(`✅ Группа "${groupName}" найдена. ID: ${dialog.id}`);
            return dialog.id;
        }
    }
    console.log(`❌ Группа "${groupName}" не найдена.`);
    return null;
}

//getIdHashSession();