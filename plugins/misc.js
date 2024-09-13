const { Module, mode } = require("../lib");
const simpleGit = require("simple-git");
const git = simpleGit();
const { exec } = require("child_process");

async function checkForUpdates() {
   try {
      await git.fetch();
      const status = await git.status();
      return status.behind > 0;
   } catch (error) {
      console.error("Error checking for updates:", error);
      return false;
   }
}

async function updateNow() {
   try {
      console.log("Stashing local changes...");
      await git.stash();

      console.log("Pulling latest changes...");
      await git.pull();

      return true;
   } catch (error) {
      console.error("Error during update:", error);
      return false;
   }
}

const restart = () => {
   exec("npm restart", (error, stdout, stderr) => {
      if (error) {
         console.error(`Error restarting process: ${error.message}`);
         return;
      }
      if (stderr) {
         console.error(`stderr: ${stderr}`);
         return;
      }
      console.log(`stdout: ${stdout}`);
   });
};

Module(
   {
      pattern: "update",
      fromMe: mode,
      info: "Check for updates",
      type: "misc",
   },
   async message => {
      const hasUpdates = await checkForUpdates();

      if (!hasUpdates) {
         await message.send("You are on the latest version.");
         return;
      }

      await message.send("Updating...");
      const updateSuccess = await updateNow();

      if (updateSuccess) {
         await message.send("```Updated, Restarting```");
         setTimeout(() => {
            restart();
         }, 3000);
      } else {
         await message.send("Update failed. Please try again later.");
      }
   }
);

Module(
   {
      pattern: "upgrade",
      fromMe: mode,
      desc: "Upgrade project dependencies",
      type: "misc",
   },
   async (message, match) => {
      await message.reply("Upgrading dependencies... Please wait.");

      exec("npm install && npm upgrade", (error, stdout, stderr) => {
         if (error) {
            message.reply(`Upgrade failed: ${error.message}`);
            return;
         }
         if (stderr) {
            message.reply(`Upgrade process encountered some issues: ${stderr}`);
            return;
         }
         message.reply(`Successfully upgraded dependencies:\n\n${stdout}`);
      });
   }
);

Module(
   {
      pattern: "repo",
      fromMe: mode,
      desc: "Repo",
      type: "misc",
   },
   async (message, match, client) => {
      let { data } = await axios.get("https://api.github.com/repos/FXastro/fxop-md");
      let mssg = `
\t\`\`\`SCRIPT\`\`\`\n
╭──────────────
│ *Owner:* _*FXastro*_
│ *Repo:* _https://github.com/FXastro/fxop-md_
│ *Stars:* _${data.stargazers_count}_
│ *Forks:* _${data.forks}_
│ *Code:* _${data.language}_
│ *Stars:* ${data.stargazers_count}
╰──────────────
   `;
      const thumbnailPath = "../media/images/thumb.jpg";
      const thumbnail = await buffpath(thumbnailPath);
      return await message.send(thumbnail, {
         caption: mssg,
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363327841612745@newsletter",
               newsletterName: "ғx-ʀᴇᴘᴏɪsᴛᴏʀʏ",
            },
         },
      });
   }
);
