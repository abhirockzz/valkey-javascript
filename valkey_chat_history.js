import { Redis } from "iovalkey";
import { BaseListChatMessageHistory } from "@langchain/core/chat_history";
import { mapChatMessagesToStoredMessages, mapStoredMessagesToChatMessages, } from "@langchain/core/messages";

export class ValkeyChatMessageHistory extends BaseListChatMessageHistory {
    get lc_secrets() {
        return {
            "config.host": "VALKEY_HOST",
            "config.port": "VALKEY_PORT",
            "config.username": "VALKEY_USERNAME",
            "config.password": "VALKEY_PASSWORD",
        };
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "stores", "message", "redis"]
        });
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sessionId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sessionTTL", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const { sessionId, sessionTTL, config, client } = fields;
        this.client = (client ?? new Redis(config ?? {}));
        this.sessionId = sessionId;
        this.sessionTTL = sessionTTL;
    }

    /**
     * Retrieves all chat messages from the Valkey for the current session.
     */
    async getMessages() {
        const rawStoredMessages = await this.client.lrange(this.sessionId, 0, -1);
        const orderedMessages = rawStoredMessages
            .reverse()
            .map((message) => JSON.parse(message));
        return mapStoredMessagesToChatMessages(orderedMessages);
    }
    /**
     * Adds a new chat message to Valkey for the current session
     */
    async addMessage(message) {
        const messageToAdd = mapChatMessagesToStoredMessages([message]);
        await this.client.lpush(this.sessionId, JSON.stringify(messageToAdd[0]));
        if (this.sessionTTL) {
            await this.client.expire(this.sessionId, this.sessionTTL);
        }
    }
    /**
     * Deletes all chat messages from Valkey for the current session.
     */
    async clear() {
        await this.client.del(this.sessionId);
    }
}
