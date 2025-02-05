const Phone = require("../models/authPhone");
const User = require("../models/user");
const {
  setGoogleUserNumberId,
  deleteGoogleUser,
} = require("../conrollers/googleAuth.js");
const sendPhone = async (ctx, props) => {
  try {
    let uniqueNumbers = [];
    let existingNumbers = [];
    for (const e of props) {
      if (Number(e)) {
        const basePhone = await Phone.findOne({ phone: e });
        if (!basePhone) {
          await setGoogleUserNumberId({ phone: e });
          await Phone.create({ phone: e });
          uniqueNumbers.push(e);
        } else {
          existingNumbers.push(e);
        }
      } else {
        console.log(e);
      }
    }
    if (uniqueNumbers.length > 0) {
      await ctx.reply(`Номера добавлены:\n${uniqueNumbers.join("\n")}`);
    }
    if (existingNumbers.length > 0) {
      await ctx.reply(
        `Номера уже существуют или повторяются:\n${existingNumbers.join("\n")}`
      );
    }
  } catch (error) {
    await ctx.reply(`Ошибка ${error.message}`);
  } finally {
    return ctx.scene.leave();
  }
};

const deletePhoneAndUsers = async (ctx, props) => {
  try {
    const uniqueNumbers = [];
    const existingNumbers = [];

    for (let i = 0; i < props.length; i++) {
      const e = props[i];
      const basePhone = await Phone.findOne({ phone: e });

      if (basePhone) {
        await Phone.findOneAndRemove({ phone: e });
        await User.findOneAndRemove({ phone: e });

        setTimeout(async () => {
          console.log(basePhone);

          await deleteGoogleUser({ phone: e });
        }, i * 4000);

        uniqueNumbers.push(e);
      } else {
        setTimeout(async () => {
          console.log(basePhone);

          await deleteGoogleUser({ phone: e });
        }, i * 4000);

        existingNumbers.push(e);
      }
    }

    if (uniqueNumbers.length > 0) {
      ctx.reply(`Номера удалены:\n${uniqueNumbers.join("\n")}`);
    }

    if (existingNumbers.length > 0) {
      ctx.reply(`Номера не найдены:\n${existingNumbers.join("\n")}`);
    }
  } catch (error) {
    ctx.reply(`Ошибка ${error.message}`);
  } finally {
    return ctx.scene.leave();
  }
};

module.exports = {
  sendPhone,
  deletePhoneAndUsers,
};
