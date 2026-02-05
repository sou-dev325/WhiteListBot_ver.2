require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const CONFIG = {
    TOKEN: process.env.DISCORD_TOKEN,
    REQUEST_CHANNEL_ID: process.env.REQUEST_CHANNEL_ID,
    CONSOLE_CHANNEL_ID: process.env.CONSOLE_CHANNEL_ID,
    NOTIFICATION_CHANNEL_ID: process.env.NOTIFICATION_CHANNEL_ID,
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// きゅー
const queue = [];
let processing = false;

client.once('ready', () => {
    console.log('--- whitelist bot ready ---');
});

// メイン
client.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;
    if (msg.channel.id !== CONFIG.REQUEST_CHANNEL_ID) return;

    const parsed = parseRequest(msg.content);
    if (!parsed.ok) {
        return sendError(msg, parsed.reason);
    }

    queue.push({ msg, ...parsed.data });
    processQueue();
});

// キュー
async function processQueue() {
    if (processing) return;
    const item = queue.shift();
    if (!item) return;

    processing = true;
    try {
        await handleWhitelist(item);
    } catch (e) {
        console.error(e);
        await sendError(item.msg, '内部エラー');
    } finally {
        processing = false;
        processQueue();
    }
}

// ほわりす処理
async function handleWhitelist({ msg, mcId, wantMention, isBedrock }) {
    const consoleCh = await client.channels.fetch(CONFIG.CONSOLE_CHANNEL_ID);

    const cmd = isBedrock
        ? `whitelist add .${mcId}`
        : `whitelist add ${mcId}`;

    console.log('[SEND]', cmd);
    await consoleCh.send(cmd);

    const ok = await waitWhitelistResult(consoleCh, mcId);

    if (!ok) {
        return sendError(msg, 'サーバー応答なし or 失敗');
    }

    await msg.react('✅').catch(() => {});
    if (wantMention) {
        const n = await client.channels.fetch(CONFIG.NOTIFICATION_CHANNEL_ID);
        await n.send(`<@${msg.author.id}> 登録完了\n\`${mcId}\``);
    }
}

// ログ待つ
function waitWhitelistResult(channel, mcId) {
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            channel.client.off('messageCreate', onMessage);
            resolve(false);
        }, 8000);

        function onMessage(m) {
            if (m.channel.id !== channel.id) return;
            const c = m.content.toLowerCase();

            if (
                c.includes(mcId.toLowerCase()) &&
                (c.includes('whitelist') || c.includes('ホワイトリスト'))
            ) {
                clearTimeout(timer);
                channel.client.off('messageCreate', onMessage);
                resolve(true);
            }
        }

        channel.client.on('messageCreate', onMessage);
    });
}

// パース
function parseRequest(txt) {
    const idMatch = txt.match(/(?:ユーザー名|ID)[:：]\s*([a-zA-Z0-9_.-]+)/i);
    const mentionMatch = txt.match(/メンション[:：]?(希望|要望|不要)/i);

    if (!idMatch || !mentionMatch) {
        const miss = [];
        if (!idMatch) miss.push('ID');
        if (!mentionMatch) miss.push('メンション');
        return { ok: false, reason: `足りない: ${miss.join(', ')}` };
    }

    return {
        ok: true,
        data: {
            mcId: idMatch[1],
            wantMention: /希望|要望/.test(mentionMatch[1]),
            isBedrock: /統合|bedrock/i.test(txt),
        }
    };
}

// エラー
async function sendError(msg, reason) {
    const n = await client.channels.fetch(CONFIG.NOTIFICATION_CHANNEL_ID);
    await n.send(
        `<@${msg.author.id}> 失敗\n理由: ${reason}\n${msg.url}`
    );
    await msg.react('❌').catch(() => {});
}

client.login(CONFIG.TOKEN);
