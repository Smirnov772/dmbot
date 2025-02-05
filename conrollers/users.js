const { adminUser } = require("../constants");

const User = require("../models/user");
const Phone = require("../models/authPhone");
const BestQuestion = require("../models/bestQuestion");
const {
  getGooglePhoneauth,
  setGoogleUserId,
  setQuestionsGoogleSheets,
} = require("../conrollers/googleAuth.js");
const { Markup } = require("telegraf");
const createUsers = async (ctx, props) => {
  try {
    var listPhone = await [];
    await getGooglePhoneauth().then(async (e) => {
      // await listQuestions.splice(0);
      e.filter(async (e) => {
        await listPhone.push(e);
      });
    });
    const user = await User.findOne({ name: props.name });

    if (!user) {
      const foundUser = await User.findOne({ phone: props.phone });
      if (foundUser) {
        ctx.reply(`${ctx.from.username} твой номер уже используется`);

        return ctx.scene.leave();
      } else {
        const phone = await Phone.findOne({ phone: props.phone });

        if (phone) {
          await User.create(props);
          await setGoogleUserId(props);
          ctx.sendMessage(
            `✅ ${ctx.from.username} авторизация пройдена!\n🎉 Теперь ты можешь задавать вопросы.\n\nНапиши мне сообщение или найди свой вопрос в меню.`,

            Markup.inlineKeyboard([
              [
                Markup.button.callback("Я новый сотрудник", "onb1"),
                Markup.button.url(
                  "Оставить отзыв",
                  "https://forms.yandex.ru/cloud/6464a12202848f0b41297002/"
                ),
              ],
              [Markup.button.callback("Открыть меню", "openMenu")],
            ])
          );
          return ctx.scene.leave();
        } else {
          const phoneGoogle = await listPhone.find(
            (item) => item.phone == props.phone
          );
          if (phoneGoogle) {
            console.log(props.phone);
            await Phone.create(props);
            await setGoogleUserId(props);
            await User.create(props);
            ctx.sendMessage(
              `✅ ${ctx.from.username} авторизация пройдена!\n🎉 Теперь ты можешь задавать вопросы.\n\nНапиши мне сообщение или найди свой вопрос в меню.`,

              Markup.inlineKeyboard([
                [
                  Markup.button.callback("Я новый сотрудник", "onb1"),
                  Markup.button.url(
                    "Оставить отзыв",
                    "https://forms.yandex.ru/cloud/6464a12202848f0b41297002/"
                  ),
                ],
                [Markup.button.callback("Открыть меню", "openMenu")],
              ])
            );

            return ctx.scene.leave();
          } else {
            ctx.reply(`${ctx.from.username} авторизация не разрешена!`);
            return ctx.scene.leave();
          }
        }
      }
    } else {
      await ctx.reply(`${ctx.from.username} ты уже зарегистрирован`);
      return ctx.scene.leave();
    }
  } catch (err) {
    ctx.reply(`Ошибка при регистрации!`);
    return ctx.scene.leave();
  }
};

const adminMiddleware = async (ctx, next) => {
  try {
    if (adminUser.includes(`${ctx.from.id}`)) {
      await next();
    } else {
      ctx.reply(`Только администратор может выполнять эту команду!`);
    }
  } catch (error) {
    console.error("Error retrieving ctx.from.id:", error);
    ctx.reply(`Произошла ошибка. Попробуйте еще раз позже.`);
  }
};

const loggerMiddleware = async (ctx, next) => {
  try {
    const user = await User.findOne({ name: ctx.from.id });

    if (user) {
      await next();
    } else {
      ctx.reply(`Я вас не узнаю, для авторизации выполните команду /register`);
    }
  } catch (error) {
    console.error("Error retrieving user data:", error);

  }
};

const getUsers = async (ctx) => {
  const results = await User.find();
  return results;
};

// console.log(getUsers());

const getUsersLength = (ctx, next) => {
  User.find().then((user) => {
    ctx.reply(`Всего пользователей ${user.length}`);
  });
};
const getUsersMessageLength = async (ctx, next) => {
  try {
    const questions = await BestQuestion.find();

    setQuestionsGoogleSheets().then((props) => {
      questions.forEach(async (question, index) => {
        setTimeout(() => {
          const resultSearchRow = props.rows.find(
            (item) => item.questions == question.question
          );
          if (resultSearchRow) {
            console.log(`ЕСТЬ -> ${resultSearchRow.questions}`);
            props.rows[resultSearchRow._rowNumber - 2].questionsAsked =
              question.message;
            props.rows[resultSearchRow._rowNumber - 2].save();
          } else {
            props.sheet.addRow([question.question, question.message]);

            console.log(`НЕТУ -> ${question.question}`);
          }
        }, index * 4000);
      });
    }, ctx.reply("Обработка завершена"));
  } catch (error) {
    ctx.reply(error);
    console.log(error); // обработка ошибок
  }
};

const sendUserMessageLength = async (ctx) => {
  const userMessage = ctx.message.text;
  try {
    const bestQuestion = await BestQuestion.findOne({ question: userMessage });

    if (bestQuestion) {
      await BestQuestion.findOneAndUpdate(
        { question: userMessage },
        { $inc: { message: 1 } },
        { new: true }
      );
    } else {
      await BestQuestion.create({ question: userMessage, message: 1 });
    }
  } catch (error) {
    console.error(error);
  }
};
module.exports = {
  getUsers,
  createUsers,
  adminMiddleware,
  loggerMiddleware,
  getUsersLength,
  sendUserMessageLength,
  getUsersMessageLength,
};
