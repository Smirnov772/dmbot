const { Scenes, Composer } = require('telegraf');

const registerWizardScene = new Composer();
registerWizardScene.on('callback_query', async (ctx) => {
  ctx.wizard.state.data = {};
  await ctx.reply('Для авторизации введите 10 цифр номера телефона');
  return ctx.wizard.next();
});

const inputNumberWizardScene = new Composer();
inputNumberWizardScene.on('text', async (ctx) => {
  const result = ctx.message.text.replace(/[^0-9]/g, '').replace(/^[78]/, '');

  if (result.length !== 10) {
    return ctx.reply('Введите корректный номер телефона (10 цифр).');
  }

  if (await Phone.findOne({ phone: result })) {
    await createUsers(ctx, {
      name: ctx.from.id,
      phone: result,
      message: 0,
    });
    await ctx.reply('Вы успешно зарегистрированы!');
  } else {
    await ctx.reply('Тебя нет в списке✋');
  }

  return ctx.scene.leave();
});

const sceneWizard = new Scenes.WizardScene(
    'sceneWizard',
    registerWizardScene,
    inputNumberWizardScene
);

module.exports = sceneWizard;
