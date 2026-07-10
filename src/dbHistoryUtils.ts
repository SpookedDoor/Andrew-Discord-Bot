import db from "./db.js";

type History = {
    id: number;
    server_id: string;
    username: string;
    content: string;
    role: "user" | "assistant";
    created_at: Date;
};

type FormattedHistory = {
    role: "user" | "assistant";
    content: string;
};

export async function getHistory(
    serverId: string | null,
    userId: string,
    limit: number,
): Promise<History[]> {
    const id = serverId || userId;
    let query =
        "SELECT username, content, role FROM server_history WHERE server_id = $1 ORDER BY created_at ASC";
    const params = [id];

    if (limit && limit > 0) {
        query += " LIMIT $2";
        params.push(limit.toString());
    }

    const { rows } = await db.query<History>(query, params);
    return rows;
}

export async function getFormattedHistory(
    serverId: string | null,
    userId: string,
    limit: number,
): Promise<FormattedHistory[]> {
    const rows = await getHistory(serverId, userId, limit);

    return rows.map((row) => {
        return {
            role: row.role === "assistant" ? "assistant" : "user",
            content: row.content,
        };
    });
}

export async function addHistory(
    serverId: string | null,
    userId: string,
    username: string,
    content: string,
    role: string,
) {
    const id = serverId || userId;
    await db.query(
        "INSERT INTO server_history (server_id, username, content, role) VALUES ($1, $2, $3, $4)",
        [id, username, content, role],
    );
}
