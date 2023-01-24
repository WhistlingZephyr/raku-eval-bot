import {
  createBot,
  Intents,
  startBot,
} from "https://deno.land/x/discordeno@13.0.0/mod.ts";
import "https://deno.land/x/dotenv@v3.2.0/load.ts";

const bot = createBot({
  token: Deno.env.get("DISCORD_TOKEN")!,
  intents: Intents.GuildMessages | Intents.MessageContent,
  events: {
    ready(_bot, payload) {
      console.log(
        `Successfully connected to gateway as ${payload.user.id} (${payload.user.username}#${payload.user.discriminator})`,
      );
    },
    async messageCreate(bot, message) {
      if (message.content.startsWith("m:")) {
        const code = message.content.match(
          /^m:\s*(?:```(?:\S*\n)?(.+?)```|`(.+?)`|(.+))$/s,
        )
          ?.slice(1, 4).find(Boolean);
        if (code) {
          const result: { stdout: string; stderr: string; error: string } =
            await (await fetch("https://glot.io/api/run/raku/latest", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: Deno.env.get("API_KEY")!,
              },
              body: JSON.stringify({
                files: [{ name: "main.raku", content: code }],
              }),
            })).json();
          bot.helpers.sendMessage(
            message.channelId,
            {
              content: `\`\`\`ansi\n${
                Object.values(result).filter(Boolean).join("\n") || " "
              }\n\`\`\``,
              messageReference: {
                messageId: message.id,
                failIfNotExists: false,
              },
            },
          );
        }
      }
    },
  },
});

await startBot(bot);
