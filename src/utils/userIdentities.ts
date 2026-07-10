import type { Client } from "discord.js";
import db from "../database/db.js";

type UserRow = {
    id: string;
    username: string;
    display_name: string;
    nicknames: string;
    traits: string;
    is_creator: boolean;
    is_god: boolean;
};

type User = {
    id: string;
    usernames: string[];
    displayName: string;
    traits: string[];
    isCreator: boolean;
    isGod: boolean;
};

function parseList(value: string | null): string[] {
    return value
        ? value
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)
        : [];
}

async function getUser(id: string): Promise<User | null> {
    const { rows } = await db.query<UserRow>(
        `SELECT id, username, display_name, nicknames, traits, is_creator, is_god FROM users WHERE id = $1`,
        [id],
    );

    const row = rows[0];
    if (!row) return null;

    return {
        id: row.id,
        usernames: [row.username, ...parseList(row.nicknames)].filter(Boolean),
        displayName: row.display_name,
        traits: parseList(row.traits),
        isCreator: row.is_creator,
        isGod: row.is_god,
    };
}

async function getUsers(): Promise<User[]> {
    const { rows } = await db.query<UserRow>(
        `SELECT id, username, display_name, nicknames, traits, is_creator, is_god FROM users`,
    );

    return rows.map((row) => {
        return {
            id: row.id,
            usernames: [row.username, ...parseList(row.nicknames)].filter(Boolean),
            displayName: row.display_name,
            traits: parseList(row.traits),
            isCreator: row.is_creator,
            isGod: row.is_god,
        };
    });
}

export async function getAllUserInfo() {
    const users = await getUsers();
    return users
        .map(
            (user) =>
                `Display Name: ${user.displayName},
        Usernames / Nicknames: ${user.usernames.join(", ")},
        Traits: ${user.traits.join(", ")},
        ${user.isCreator ? "This user is your creator." : ""}, ${user.isGod ? "This user is a God." : ""}`,
        )
        .join("\n");
}

export async function findUserIdentity(id: string, client: Client) {
    const existingUser = await getUser(id);
    if (existingUser) return existingUser;

    const user = await client.users.fetch(id, { force: true });

    if (user) {
        return {
            id: user.id,
            displayName: user.displayName ?? user.username,
            usernames: [user.username],
        };
    } else {
        throw new Error("User not found");
    }
}

export async function createIdentityContext(id: string, username: string, client: Client) {
    const currentUser = await findUserIdentity(id, client);
    const displayName = currentUser?.displayName || username;
    let userTraits = "";
    let godOrCreatorNote = "";

    if ("traits" in currentUser) {
        userTraits = `Traits: ${currentUser.traits.join(", ")}`;
        godOrCreatorNote =
            (currentUser?.isGod ? "This user has the isGod tag. " : "") +
            (currentUser?.isCreator ? "This user has the isCreator tag. " : "");
    }

    const otherUsers = await getAllUserInfo();

    let identityContext = `
        The current user is ${displayName}.

        User Identity Details:
        - Display Name: ${displayName}
        - Usernames / Nicknames: ${currentUser?.usernames?.join(", ") || "unknown"}
        ${userTraits ? `- ${userTraits}` : ""}
        ${godOrCreatorNote}

        IMPORTANT:
        Refer to the user only as "${displayName}". Never use any of their usernames or nicknames.

        Special Note: Any user marked with 'isGod' should be referred to with 'god' after their name, like 'Dragonary god'. They should be treated with respect.
        All creators are gods while not all gods are your creators. If a user is marked with 'isCreator', you should treat them with the utmost respect as they
        created you. Never insult.

        Here's all of the information about the other users you know:
        ${otherUsers}
    `;

    return { displayName, identityContext };
}
