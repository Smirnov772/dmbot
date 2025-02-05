const {adminUser, userCommands} = require('./constants.js');
const fs = require('fs');
const {GoogleSpreadsheet} = require('google-spreadsheet');
const CallCenter = require('./models/callСenter.js');
const axios = require('axios');
const {OpenWeatherAPI} = require('openweather-api-node');
const menuConfig = require('./menuConfig');
let weather = new OpenWeatherAPI({
	key: 'd0e8ff4cbaf8ddb831a6b5ca69c4f362', locationName: 'Bekasovo', units: 'metric', language: 'ru'
});
const textMap = require('./textMap');

const {
	main,
	getGooglePhoneauth,
	setGoogleUserId,
	setGoogleUserNumberId,
	searchUserID,
	searchOnboadging,
	setReviewsGoogleSheets,
	setOprosGoogleSheets
} = require('./conrollers/googleAuth.js');
require('dotenv').config();
// const { main, list } = require("./sheets.js");
// const list1 = []
const schedule = require('node-schedule');
// let timerOnbording;
// let job;
// let weatherTimer;

const Phone = require('./models/authPhone.js');
const mongoose = require('mongoose');
const {
	getUsers, createUsers, adminMiddleware, loggerMiddleware, getUsersLength, sendUserMessageLength, getUsersMessageLength
} = require('./conrollers/users.js');
const {sendPhone, deletePhoneAndUsers} = require('./conrollers/phones.js');
const {Telegraf, Markup, Composer, Scenes, session} = require('telegraf');
const {message} = require('telegraf/filters');
const {
	TELEGRAM_API_TOKEN, dev_TELEGRAM_API_TOKEN, MONGOBASE, GPT_TOKEN
} = process.env;
const {Configuration, OpenAIApi} = require('openai');
const callСenter = require('./models/callСenter.js');
const e = require('express');
const configuration = new Configuration({
	apiKey: GPT_TOKEN
});
const openai = new OpenAIApi(configuration);

const bot = new Telegraf(TELEGRAM_API_TOKEN, {
	polling: {
		interval: 300, autoStart: true
	}
});
const userLiveMiddleware = async (ctx, next) => {
	try {

		if (ctx.chat.type === 'private') {
			return next();
		}

		// Проверяем права бота в группе перед отправкой
		const botMember = await ctx.getChatMember(ctx.botInfo.id).catch(() => null);

		// Если бот не админ или был удален - не пытаемся отвечать
		if (!botMember || ['left', 'kicked'].includes(botMember.status)) {
			console.log(`Бот удален из группы ${ctx.chat?.title || 'unknown'}`);
			return;
		}

		// Пытаемся отправить сообщение с ограничением по времени
		await Promise.race([
			ctx.reply(`Удали бота ${ctx.chat.title} 🤬`),
			new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))]);

	} catch (error) {
		// Обработка разных типов ошибок
		switch (true) {
			case error instanceof Error && error.message === 'Timeout':
				console.error('Таймаут при отправке сообщения');
				break;

			case error.response?.error_code === 403:
				console.log('Бот не имеет доступа к чату или был заблокирован');
				break;

			case error.response?.parameters?.migrate_to_chat_id:
				this.handleGroupMigration(error);
				break;

			case error.response?.error_code === 400:
				console.log('Некорректный запрос или чат не существует');
				break;

			default:
				console.error('Необработанная ошибка:', error);
				Sentry.captureException(error); // Если используется Sentry
		}
	}

	// Останавливаем обработку для групповых чатов
	return;
};
bot.use(userLiveMiddleware);

const listQuestions = [];
const inlineBtn = (btn) => Markup.inlineKeyboard(btn);
mongoose.connect(MONGOBASE);
main().then(async (e) => {
	// await listQuestions.splice(0);
	e.filter(async (e) => {
		await listQuestions.push(e);
	});
});

const uniqueResult = [];
const searchButton = (ctx, next) => {
	uniqueResult.splice(0);
	const filteredQuestions = listQuestions.filter((question) => {
		return (question.category3 === ctx.message.text || question.category2 === ctx.message.text || question.category1 ===
				ctx.message.text || question.questions === ctx.message.text);
	});
	const uniqueCategories = Array.from(new Set(filteredQuestions.map((question) => {
		if (question.category3 === ctx.message.text) {
			uniqueResult.push(question.category2);
			return question.questions;
		} else if (question.category2 === ctx.message.text) {
			if (question.category3) {
				uniqueResult.push(question.category2);
				return question.category3;
			} else if (question.questions) {
				return question.questions;
			} else if (question.answer) {
				return question.answer;
			} else {
				return next();
			}
		} else if (question.category1 === ctx.message.text) {
			if (question.category2) {
				uniqueResult.push(question.category1);
				return question.category2;
			} else if (question.category3) {
				return question.category3;
			} else if (question.questions) {
				return question.questions;
			} else if (question.answer) {
				return next();
			} else {
				return next();
			}
		} else if (question.questions === ctx.message.text) {
		} else {
			return next();
		}
	})));
	if (uniqueCategories[0] !== undefined) {
		const keyboard = [...uniqueCategories, 'Вернуться'];
		ctx.replyWithHTML('...', Markup.keyboard(keyboard).resize());
	} else {
		return next();
	}
};

const res4 = listQuestions.map((e) => {
	return [Markup.button.callback(e.category)];
});
const registerWizardScene = new Composer();
registerWizardScene.on('callback_query', async (ctx) => {
	ctx.wizard.state.data = {};
	await ctx.reply('Для авторизации введите 10 цифр номера телефона');
	return ctx.wizard.next();
});

const inputNumberWizardScene = new Composer();
inputNumberWizardScene.on('text', async (ctx) => {
	try {
		ctx.wizard.state.data.number = ctx.message.text;
		const result = ctx.message.text.replace(/[^0-9\s]/g, '').replace(/^[78]\s?|(?<=\s)[78]/g, '');
// console.log(ctx)
		// Проверяем существование телефона
		// if (Phone.findOne({phone: result})) {
		await createUsers(ctx, {
			name: ctx.from.id, phone: result, message: 0
		});

		// Устанавливаем команды для пользователя
		await bot.telegram.setMyCommands(userCommands, {
			scope: {type: 'chat', chat_id: ctx.from.id}
		});

	} catch (error) {
		console.error('Ошибка:', error);
		ctx.reply('Произошла ошибка, попробуй снова позже.');
	}
});

const inputMessageAnswerHandler = new Composer();

inputMessageAnswerHandler.on('text', async (ctx) => {

	await callСenter.find({userMessageId: contextID.userMessageId}).
			find().
			then((question) => {
				question[0].admin.forEach(
						(admin) => bot.telegram.editMessageText(`${admin.AdminID}`, `${admin.adminMessageId}`, {
							inline_message_id: false
						}, `На вопрос: «${contextID.text}»\nПользователю ${contextID.ID} отправлен ответ:\n${ctx.message.text}`));
			});
	await bot.telegram.sendMessage(contextID.ID, `На ваш вопрос «${contextID.text}»\nответили:\n${ctx.message.text}`);
	await callСenter.findOneAndDelete({userMessageId: contextID.userMessageId});
	startMenu(ctx);
	await ctx.scene.leave();
});

const menuScene = new Scenes.WizardScene('sceneWizard', registerWizardScene, inputNumberWizardScene);
const setPhone = new Scenes.WizardScene('sceneSetphone', (ctx) => {
	ctx.wizard.state.data = {};
	ctx.reply('Для добавления разрешений на регистрацию введите список телефонов');
	return ctx.wizard.next();
}, (ctx) => {
	const regex = /[^0-9\s]/g; // выбираются все символы кроме цифр и пробелов
	const result = ctx.message.text.replace(regex, ''); // удаляем ненужные символы из сообщения пользователя

	const regex2 = /^[78]\s?|(?<=\s)[78]/g; // выбираются цифры "7" и "8" в начале текста или после пробела
	const result2 = result.replace(regex2, ''); // удаляем найденные цифры из сообщения пользователя

	const re = /\s/; // выбираем пробелы
	const mas = result2.split(re); // разбиваем сообщение на массив из отдельных слов

	sendPhone(ctx, mas);

});
const delPhone = new Scenes.WizardScene('sceneDelphone', async (ctx) => {
	ctx.wizard.state.data = {};
	await ctx.reply('Для удаление пользователей введите список телефонов через пробел ');
	return ctx.wizard.next();
}, async (ctx) => {
	const result = ctx.message.text.replace(/[^0-9\s]/g, '').
			replace(/^[78]\s?|(?<=\s)[78]/g, '');
	const mas = result.split(/\s/);
	await deletePhoneAndUsers(ctx, mas);
});
const sendMessageAll = new Scenes.WizardScene('sceneSendMessageAll',

		async (ctx) => {
			try {
				const users = await getUsers();
				for (const user of users) {
					try {
						await bot.telegram.sendMessage(user.name, ctx.message.text);
					} catch (error) {
						console.error(`Ошибка отправки сообщения пользователю ${user.name}: ${error.message}`);
					}
				}
			} catch (error) {
				console.error(error);
			} finally {
				ctx.scene.leave();
			}
		});
const sendMessageUserAnswer = new Scenes.WizardScene('sceneSendMessageUserAnswer',

		inputMessageAnswerHandler);
sendMessageAll.enter((ctx) => ctx.reply('Введите сообщения'));

const sendPhotoAll = new Scenes.WizardScene('sceneSendPhotoAll',

		async (ctx) => {
			try {
				if (ctx.message.photo) {
					const users = await getUsers();
					console.log('photo');
					for (const user of users) {
						try {
							await bot.telegram.sendPhoto(user.name, ctx.message.photo[0].file_id);
							if (ctx.message.caption) {
								await bot.telegram.sendMessage(user.name, ctx.message.caption);
							}
						} catch (error) {
							console.error(`Пользователь ${user.name} заблокировал бота`);
						}
					}
					await ctx.scene.leave();
				} else if (ctx.message.animation) {
					console.log('animation');
					const users = await getUsers();
					for (const user of users) {
						try {
							await bot.telegram.sendAnimation(user.name, ctx.message.animation.file_id);
							if (ctx.message.caption) {
								await bot.telegram.sendMessage(user.name, ctx.message.caption);
							}
						} catch (error) {
							console.error(`Пользователь ${user.name} заблокировал бота`);
						}
					}
					await ctx.scene.leave();
				} else if (ctx.message.video) {
					console.log('video');
					const users = await getUsers();
					for (const user of users) {
						try {
							await bot.telegram.sendVideoNote(user.name, ctx.message.video.file_id);
							if (ctx.message.caption) {
								await bot.telegram.sendMessage(user.name, ctx.message.caption);
							}
						} catch (error) {
							console.error(`Пользователь ${user.name} заблокировал бота`);
						}
					}
					await ctx.scene.leave();
				}
			} catch (error) {
				console.error(error);
				ctx.scene.leave();
			}
		});

sendPhotoAll.enter((ctx) => ctx.reply('Пришлите фото'));

const sendReview = new Scenes.WizardScene('sceneSendReview', (ctx) => {
			ctx.deleteMessage();
			ctx.reply(
					'👍Отлично!, я задам тебе 4 вопроса. Если затрудняешься с ответом, отправь любой символ.\n\nПоехали!🚀\n\nРасскажи, как прошел твой рабочий день?',
					Markup.removeKeyboard());
			return ctx.wizard.next();
		}, (ctx) => {
			if (ctx.message && ctx.message.text) {
				const messageText = ctx.message.text;
				ctx.reply('Как прошло обучение, все ли было понятно?');
				ctx.wizard.state.data = {text1: messageText};
				console.log(ctx.wizard.state.data);
				return ctx.wizard.next();
			} else {
				ctx.reply('Вы вышли из опроса');
				ctx.scene.leave();
			}
		}, (ctx) => {
			if (ctx.message && ctx.message.text) {
				const messageText = ctx.message.text;
				ctx.reply('Достаточно ли информации, которую вы получаете от инструкторов и коллег для выполнения работы?');
				ctx.wizard.state.data.text2 = messageText;
				console.log(ctx.wizard.state.data);
				return ctx.wizard.next();
			} else {
				ctx.reply('Вы вышли из опроса');
				ctx.scene.leave();
			}
		}, (ctx) => {
			if (ctx.message && ctx.message.text) {
				const messageText = ctx.message.text;
				const date = getFormattedDate(ctx.message.date);
				ctx.reply('Что бы вы хотели улучшить или изменить в вашей работе на складе?');
				ctx.wizard.state.data.text3 = messageText;
				ctx.wizard.state.data.date = date;
				console.log(ctx.wizard.state.data);
				return ctx.wizard.next();
			} else {
				ctx.reply('Вы вышли из опроса');
				ctx.scene.leave();
			}
		}, (ctx) => {
			if (ctx.message && ctx.message.text) {
				const messageText = ctx.message.text;

				ctx.wizard.state.data.text4 = messageText;

				ctx.reply('Укажи инструктора который проводил твое обучение', Markup.inlineKeyboard([
					[
						Markup.button.callback('Созонов Максим', (ctx.wizard.state.data.text5 = 'Созонов Максим'))], [
						Markup.button.callback('Николаева Анастасия', (ctx.wizard.state.data.text5 = 'Николаева Анастасия'))],

					[
						Markup.button.callback('Бубликов Андрей', (ctx.wizard.state.data.text5 = 'Бубликов Андрей'))], [
						Markup.button.callback('Не отвечать', (ctx.wizard.state.data.text5 = 'Нет ответа'))]]));
				return ctx.wizard.next();
			} else {
				ctx.reply('Вы вышли из опроса');
				ctx.scene.leave();
			}

			return ctx.wizard.next();
		}, (ctx) => {
			ctx.deleteMessage();
			ctx.reply('Поставь оценку работе инструктора от 1 до 5', Markup.inlineKeyboard([
				[Markup.button.callback('1', (ctx.wizard.state.data.text6 = '1'))],
				[Markup.button.callback('2', (ctx.wizard.state.data.text6 = '2'))],
				[Markup.button.callback('3', (ctx.wizard.state.data.text6 = '3'))],
				[Markup.button.callback('4', (ctx.wizard.state.data.text6 = '4'))],
				[Markup.button.callback('5', (ctx.wizard.state.data.text6 = '5'))],
				[
					Markup.button.callback('Не отвечать', (ctx.wizard.state.data.text5 = 'Нет ответа'))]]));
			// (ctx.wizard.state.data.text5 = ctx.message.text);
			return ctx.wizard.next();
		},

		async (ctx) => {
			ctx.deleteMessage();
			ctx.reply('Спасибо что нашли время, желаю хорошего дня.');
			// ctx.wizard.state.data.text6 = ctx.message.text;
			console.log(ctx.wizard.state.data);

			setReviewsGoogleSheets(ctx.from.id, ctx.wizard.state.data.date, ctx.wizard.state.data.text1,
					ctx.wizard.state.data.text2, ctx.wizard.state.data.text3, ctx.wizard.state.data.text4,
					ctx.wizard.state.data.text5, ctx.wizard.state.data.text6);
			startMenu(ctx);
			ctx.scene.leave();
		});
sendReview.action('btnExit', (ctx) => {
	ctx.reply('Вы вышли из сцены. Что-то еще могу помочь?');
	return ctx.scene.leave();
});

var contextID;
sendMessageUserAnswer.enter((ctx) => {
	contextID = ctx.state;
	console.log(ctx.state);

	ctx.reply('Введите сообщение');
});
let question = '';
let answer1 = '';
let answer2 = '';

const setOprosScene = new Scenes.WizardScene('setOpros', (ctx) => {
	ctx.reply('Введите вопрос:');
	return ctx.wizard.next();
}, (ctx) => {
	question = ctx.message.text;
	ctx.reply('Введите первый вариант ответа:');
	return ctx.wizard.next();
}, (ctx) => {
	answer1 = ctx.message.text;
	ctx.reply('Введите второй вариант ответа:');
	return ctx.wizard.next();
}, (ctx) => {
	answer2 = ctx.message.text;
	ctx.reply('Вопрос и варианты ответа установлены.');
	return ctx.scene.leave();
});

const setDocument = new Scenes.WizardScene('setDocument', (ctx) => {
	ctx.reply('Пришлите файл для загрузки на сервер');
	return ctx.wizard.next();
}, async (ctx) => {
	try {
		const fileId = ctx.message.document.file_id ? ctx.message.document.file_id : ctx.message.video.file_id;
		const file = await ctx.telegram.getFile(fileId);
		const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
		const response = await axios({
			url: fileUrl, method: 'GET', responseType: 'stream'
		});
		const writer = fs.createWriteStream(
				`./document/${ctx.message.document.file_name ? ctx.message.document.file_name : ctx.message.video.file_name}`);
		response.data.pipe(writer);
		writer.on('finish', async () => {
			ctx.reply(`Файл: ${ctx.message.document.file_name ?
					ctx.message.document.file_name :
					ctx.message.video.file_name}\nУспешно загружен`);

			botFile(ctx.message.document.file_name ? ctx.message.document.file_name : ctx.message.video.file_name);
// оповещение о загрузке файла
			const users = await getUsers();
			console.log(users);
			for (const user of users) {
				try {
					bot.telegram.sendMessage(user.name, `Загружен новый файл:\n${ctx.message.document.file_name ?
							ctx.message.document.file_name :
							ctx.message.video.file_name}`, Markup.inlineKeyboard([
						Markup.button.callback('Загрузить', ctx.message.document.file_name)]));
				} catch (error) {
					console.error(`Ошибка отправки сообщения пользователю ${user.name}: ${error.message}`);
				}
			}

		});
		writer.on('error', (err) => {
			ctx.reply(err);
		});
		return ctx.scene.leave();
	} catch (err) {
		ctx.reply(err);
	}
});

const stage = new Scenes.Stage([
	setDocument,
	setOprosScene,
	menuScene,
	setPhone,
	delPhone,
	sendMessageAll,
	sendPhotoAll,
	sendReview,
	sendMessageUserAnswer]);

bot.use(session());
bot.use(stage.middleware());

// Handle button clicks
bot.action('btnAnswer1', (ctx) => {
	setOprosGoogleSheets(ctx.from.id, `${answer1}`);
	// ctx.reply("Спасибо за ответ");
	ctx.deleteMessage();
	ctx.answerCbQuery('Спасибо за ответ');
});

bot.action('btnAnswer2', (ctx) => {
	setOprosGoogleSheets(ctx.from.id, ` ${answer2}`);
	// ctx.reply("Спасибо за ответ");
	ctx.deleteMessage();
	ctx.answerCbQuery('Спасибо за ответ');
});
const startMenu = (ctx) => {
	const uniqueCategories = [];
	const categoriesKeyboard = listQuestions.filter(
			(element) => !uniqueCategories.includes(element.category1) && uniqueCategories.push(element.category1)).
			map((e) => Markup.button.callback(e.category1));

	ctx.reply('.', Markup.keyboard(categoriesKeyboard).resize());
};

job = schedule.scheduleJob('0 0 15 * * 2', function(fireDate) {
	const blockUser = [];

	searchOnboadging().then((users) => {
		const promises = users.map((ID, index) => {
			console.log(ID);
			return new Promise((resolve, reject) => {
				setTimeout(async () => {
					try {
						await bot.telegram.sendMessage(ID,
								'👋Привет, пройди короткий опрос и расскажи как прошел твой день в компании.\n\nВаше мнение очень важно для нас!',
								Markup.inlineKeyboard([
									[Markup.button.callback('✅Хочу рассказать', 'btnOkReview')], [
										Markup.button.callback('❌Не хочу рассказывать', 'btnNoneReview')]]));
						resolve();
					} catch (error) {
						blockUser.push(ID);
						reject(error);
					}
				}, index * 2000);
			});
		});

		Promise.allSettled(promises).
				then(() => bot.telegram.sendMessage('679238113', `Номера удалены:\n${blockUser.join('\n')}`)).
				catch((error) => console.error(error));
	});
});

bot.command('timer', (ctx) => {
	job = schedule.scheduleJob('*/5 * * * * *', function(fireDate) {
		console.log('Это задание должно было выполняться в ' + fireDate + ', но на самом деле запускалось в ' + new Date());
		bot.telegram.sendMessage(ctx.chat.id,
				'Это задание должно было выполняться в ' + fireDate + ', но на самом деле запускалось в ' + new Date());
	});
});

bot.command('test', (ctx) => {
	const blockUser = [];

	searchOnboadging().then((users) => {
		const promises = users.map((ID, index) => {
			console.log(ID);
			return new Promise((resolve, reject) => {
				setTimeout(async () => {
					try {
						await bot.telegram.sendMessage(ID,
								'👋Привет, пройди короткий опрос и расскажи как прошел твой день в компании.\n\nВаше мнение очень важно для нас!',
								Markup.inlineKeyboard([
									[Markup.button.callback('✅Хочу рассказать', 'btnOkReview')], [
										Markup.button.callback('❌Не хочу рассказывать', 'btnNoneReview')]]));
						resolve();
					} catch (error) {
						blockUser.push(ID);
						reject(error);
					}
				}, index * 2000);
			});
		});

		Promise.allSettled(promises).
				then(() => bot.telegram.sendMessage('679238113', `Номера удалены:\n${blockUser.join('\n')}`)).
				catch((error) => console.error(error));
	});
});

bot.action('openMenu', (ctx) => startMenu(ctx));
bot.action('btnOkReview', (ctx) => ctx.scene.enter('sceneSendReview'));
bot.action('btnNoneReview', async (ctx) => {
	ctx.deleteMessage();
	ctx.reply('Хорошо, не буду тебя задерживать');
});

bot.action('onb1', (ctx) => {
	const message = [
		'🤝 Добро пожаловать в нашу команду!',
		'🧸 Компания «Детский мир» - это крупная розничная сеть, занимающаяся продажей детских товаров в России, Казахстане и Беларуси.',
		'🧑‍💼 Ваша работа будет проходить на современном складе, который является одним из лучших в своей отрасли.',
		'🧑‍💼 Желаем вам успехов!',
		'🤝 Для открытия меню нажмите 👉/questions👈. В разделе «Новым сотрудникам» вы найдете информацию, которая поможет вам адаптироваться в нашей компании.'];
	message.forEach(async (question, index) => {
		setTimeout(() => {
			ctx.reply(question);
		}, index * 5000);
	});
});

const generateMenu = (menu) => {
	return Markup.inlineKeyboard(menu.map((item) => {
		if (item.link) {
			return [Markup.button.url(item.label, item.link)];
		}
		return [Markup.button.callback(item.label, item.action)];
	}));
};

// Функция для обработки загрузки и отправки медиа
async function handleMedia(ctx, type, filePath, caption = '', menuOptions = []) {
	console.log(ctx.match, caption, filePath, fs.existsSync(filePath));

	if (fs.existsSync(filePath)) {
		await ctx.editMessageReplyMarkup();
		const loadingMessage = await ctx.reply('Информация загружается, пожалуйста, подождите...');

		try {
			// Отправка медиа
			if (type === 'video') {
				await ctx.sendVideo({source: filePath, parse_mode: 'HTML'});
			} else if (type === 'photo') {

				await ctx.sendPhoto({
					source: filePath
				});
				if (caption) await ctx.sendMessage(caption, {parse_mode: 'Markdown'});
			}

			// Удаляем сообщение о загрузке
			await ctx.deleteMessage(loadingMessage.message_id);

			// Показываем меню после загрузки
			if (menuOptions.length > 0) {
				await ctx.reply('Меню', generateMenu(menuOptions));
			}
		} catch (error) {
			console.error(`Ошибка при отправке ${type}:`, error);

			// Удаляем сообщение о загрузке и сообщаем об ошибке
			await ctx.deleteMessage(loadingMessage.message_id);
			await ctx.reply(`Произошла ошибка при отправке ${type}.`);
		}
	} else {
		await ctx.reply(`Ошибка: ${type} не найдено.`);
	}
}

// Обработка текстового действия
bot.action(/SHOW_TEXT_(.*)/, (ctx) => {
	const action = ctx.match[1]; // Получаем действие
	const text = textMap[action]; // Получаем текст из словаря
	console.log('текст', ctx.match);
	if (text) {
		ctx.editMessageText(text, {parse_mode: 'Markdown'}); // Изменяем сообщение
		ctx.reply('Меню', generateMenu([{label: 'Открыть', action: 'M_START_MENU'}])); // Добавляем меню
	} else {
		ctx.editMessageText('Ошибка: текст не найден.');
	}
});

// Обработка видео
bot.action(/SHOW_VIDEO_(.*)/, async (ctx) => {
	const action = ctx.match[1];

	const filePath = `./document/${textMap[action]}`; // Путь к видео
	await handleMedia(ctx, 'video', filePath, '', [{label: 'Открыть', action: 'M_START_MENU'}]);
});

// Обработка изображения
bot.action(/SHOW_IMAGE_(.*)/, async (ctx) => {
	const action = ctx.match[1];
	const filePath = `./images/${textMap[action]}`; // Путь к изображению
	await handleMedia(ctx, 'photo', filePath, textMap[action], [{label: 'Открыть', action: 'M_START_MENU'}]);
});

// Стартовое сообщение с кнопкой "Начать"
bot.start((ctx) => {
	try {
		ctx.reply(menuConfig.startMessage, generateMenu(menuConfig.startMenu));
		bot.telegram.getMyCommands(userCommands, ctx.from.id);
	} catch (error) {
		console.error(error);
		ctx.reply('Ошибка сервера, попробуйте позже');
	}
});

// Обработчик для кнопок меню
bot.action('REGISTRATION', userLiveMiddleware, (ctx) => {
	console.log('Кнопка "Регистрация" нажата');

	ctx.scene.enter('sceneWizard');
});
bot.action(/M_(.*)/, (ctx) => {
	const action = ctx.match[0]; // Извлекаем действие
	const menuItem = menuConfig.menus[action]; // Находим элемент меню в конфигурации
	console.log(menuItem);
	console.log(ctx.match[1]);
	if (menuItem) {
		if (menuItem.message) {
			// Если есть message, показываем его
			ctx.editMessageText(menuItem.message, generateMenu(menuItem.subMenu || []));
		} else if (menuItem.subMenu) {
			// Если есть подменю, обрабатываем элементы
			const buttonWithText = menuItem.subMenu.find((item) => item.text);

			if (buttonWithText) {
				// Если в подменю есть кнопка с text, отправляем текст
				ctx.editMessageText(buttonWithText.text, generateMenu(menuItem.subMenu));
			} else {
				// Иначе отображаем подменю
				ctx.editMessageText('Выберите пункт:', generateMenu(menuItem.subMenu));
			}
		}
	} else {
		// Если действие не найдено
		ctx.editMessageText('Меню не найдено!');
	}
});
bot.use(loggerMiddleware);
bot.command('admin', adminMiddleware, (ctx) => {
	console.log(ctx.from.id);
	if (adminUser.includes(`${ctx.from.id}`)) {
		ctx.reply(`Меню администратора👇`, Markup.inlineKeyboard([
			[
				Markup.button.callback('🟢Добавить номера пользователей', 'savePhone')],
			[
				Markup.button.callback('🔴Удалить номера пользователей', 'deleteusers')],
			[
				Markup.button.callback('🗣️Отправить всем текстовое сообщение', 'message')],
			[
				Markup.button.callback('🏞️Отправить всем фото или видео с текстом', 'photo')],
			[Markup.button.callback('💾Отправить файл на сервер', 'sendDocument')],
			[Markup.button.callback('Создать быстрый опрос', 'speedQuestion')],
			[
				Markup.button.callback('Показать количество пользователей', 'getuser')],
			[
				Markup.button.callback('Отправить статистику по вопросам в гугл', 'best')],
			[Markup.button.callback('Перезагрузить вопросы', 'BDrestart')]]).
				resize());
	} else {
		ctx.replyWithHTML(`you are not an admin!!!`);
	}
});
bot.action('speedQuestion', (ctx) => ctx.reply(`Сначала добавь вопросы, а затем отправь👇`, Markup.inlineKeyboard([
	[Markup.button.callback('1. Добавить вопросы', 'savePhone')],
	[Markup.button.callback('2. Отправить всем опрос', 'deleteusers')]]).
		resize()));
bot.action('savePhone', (ctx) => ctx.scene.enter('sceneSetphone'));
bot.action('sendDocument', (ctx) => ctx.scene.enter('setDocument'));
bot.action('deleteusers', (ctx) => ctx.scene.enter('sceneDelphone'));
bot.action('getuser', (ctx) => getUsersLength(ctx));
bot.action('BDrestart', (ctx) => {
	listQuestions.splice(0);
	main().then((e) => {
		e.filter((e) => {
			listQuestions.push(e);
		});
		ctx.reply('Перезагруженно');
	});
});
bot.action('best', (ctx) => getUsersMessageLength(ctx));
bot.action('message', (ctx) => {
	ctx.scene.enter('sceneSendMessageAll');
});
bot.action('photo', (ctx) => {
	ctx.scene.enter('sceneSendPhotoAll');
});

bot.action('setopros', (ctx) => {
	ctx.scene.enter('setOpros');
});
// Define your action handler
bot.action('opros', async (ctx) => {
	// Send the question to all users of the bot
	const userIds = await searchUserID();
	userIds.forEach(async (userId) => {
		try {
			await bot.telegram.sendMessage(userId, question, Markup.inlineKeyboard([
				[Markup.button.callback(answer1, 'btnAnswer1')], [Markup.button.callback(answer2, 'btnAnswer2')]]));
		} catch (error) {
			console.log(`Error sending message to user ${userId}: ${error}`);
		}
	});
});

bot.command('questions', (ctx) => startMenu(ctx));
bot.command('ques', (ctx) => ctx.reply('Пока', Markup.removeKeyboard()));

bot.hears('Инструкции webApp', (ctx) => {
	ctx.sendMessage('👇', Markup.inlineKeyboard([
		Markup.button.url('Открыть', 'https://clck.ru/35bVun')]));
});

bot.hears('Вернуться', (ctx) => {
	const uniqueResult = [];
	const filteredList = listQuestions.filter((element) => {
		if (!uniqueResult.includes(element.category1)) {
			uniqueResult.push(element.category1);
			return element;
		}
	});
	const buttons = filteredList.map((e) => Markup.button.callback(e.category1));
	ctx.reply('...', Markup.keyboard(buttons).resize());
});

function getFormattedDate(timestamp) {
	var date = new Date(timestamp * 1000);
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hour = date.getHours();
	var min = date.getMinutes();
	var sec = date.getSeconds();

	month = (month < 10 ? '0' : '') + month;
	day = (day < 10 ? '0' : '') + day;
	hour = (hour < 10 ? '0' : '') + hour;
	min = (min < 10 ? '0' : '') + min;
	sec = (sec < 10 ? '0' : '') + sec;

	var str = day + '.' + month + '.' + date.getFullYear();
	// +
	// "_" +
	// hour +
	// ":" +
	// min +
	// ":" +
	// sec;
	console.log(str);
	/*alert(str);*/
	return str;
}

bot.command('time', (ctx) => {
	console.log(ctx.message.date);
	getFormattedDate(ctx.message.date);
});
bot.command('stop', (ctx) => {
	ctx.reply('Пока', Markup.removeKeyboard());
});

bot.command('btnstart', (ctx) => {
	ctx.reply('Выбери категорию вопросов.', inlineBtn(btnsetstart));
});
bot.command('stoptimeronbording', (ctx) => {
	if (timerOnbording) {
		timerOnbording.cancel();
	}
});
bot.command('stopreview', (ctx) => {
	if (job) {
		job.cancel();
	}
});
bot.command('stoptimerweather', (ctx) => {
	if (weatherTimer) {
		weatherTimer.cancel();
	}
});

// ПОИСК ПО СООБЩЕНИЮ
const searchAnswerPressButton = (ctx, next) => {
	const foundQuestion = listQuestions.filter((list) => {
		if (list.questions.includes(ctx.message.text)) {
			return true;
		} else if (list.answer !== undefined && list.answer.includes(ctx.message.text)) {
			return true;
		} else {
			return false;
		}
	});

	if (foundQuestion.length > 0 && foundQuestion[0].answer.includes('_документ')) {
		try {
			foundQuestion[0].secondAnswer ? ctx.replyWithDocument({
				source: `./document/${foundQuestion[0].secondAnswer}`
			}) : ctx.reply(`Файл отсутствует на сервере`);
		} catch (error) {
			ctx.reply(`Файл отсутствует на сервере`);
		}
	} else {
		foundQuestion.length > 0 ? ctx.reply(foundQuestion[0].answer) : next();
	}
};

try {
	bot.on('text', searchButton, async (ctx) => {
		sendUserMessageLength(ctx);
		const keywords = await ctx.message.text.toLowerCase().split(' ');
		let result = [];

		// Поиск по первому условию
		result = await listQuestions.filter((list) => {
			if (list.questions.includes(ctx.message.text)) {
				console.log(list);
				return true;
			}
		});

		// Если ничего не найдено, выполнить поиск по второму условию
		if (result.length === 0) {
			result = listQuestions.filter((list) => {
				const keylist = keywords.some((keyword) => {
					if (keyword.length >= 3 && list.teg.toLowerCase().
							split(' ').
							includes(keyword.toLowerCase())) {
						return true;
					}
				});

				return keylist;
			});
		}

		if (result.length >= 2) {
			const res2 = result.map((e) => {
				botAnswer(e);
				return [Markup.button.callback(e.questions, e.button)];
			});
			ctx.reply(`Вот что я нашел. Выбери подходящий вопрос`, Markup.inlineKeyboard(res2).resize());
		} else if (result.length === 1 && result[0].answer.includes('http')) {
			ctx.replyWithHTML(`Для получения метериала открой ссылку\n👉 ${result[0].answer}`, {
				disable_web_page_preview: true
			});
		} else if (result.length === 1 && result[0].answer.includes('_документ')) {
			// Send file to the user
			const loadingMessage = await ctx.reply('Загрузка данных...');
			try {
				const filePath = `./document/${result[0].secondAnswer}`;
				if (result[0].secondAnswer && fs.existsSync(filePath)) {
					ctx.replyWithDocument({
						source: filePath
					});
				} else {
					throw new Error('Файл отсутствует на сервере');
				}
			} catch (error) {
				ctx.reply(error.message);
			} finally {
				ctx.deleteMessage(loadingMessage.message_id);
			}

		} else if (result.length === 1) {
			await ctx.replyWithHTML(`${result[0].answer}`, {
				disable_web_page_preview: true
			});
			if (result[0].secondAnswer && result[0].secondAnswer.trim() !== '' && result[0].secondAnswer !== '\n') {
				const result2 = await listQuestions.find((list) => {
					return list.questions.includes(result[0].secondAnswer);
				});
				await botAnswer(result2);
				await ctx.reply(`...`, Markup.inlineKeyboard([
					Markup.button.callback(result2.questions, result2.button)]).
						resize());
			} else console.log(false);
		} else {
			// const response = await openai.createCompletion({
			//   model: "text-davinci-003",
			//   prompt: `Веди себя как вымышленный символ компании, медведь по имени Дёма из компании "Детский мир". Я хочу, чтобы вы отвечали, как медведь Дёма, используя тон, манеру и лексику, которые использовал бы медведь Дёма. Не пишите никаких объяснений. Ответьте только как медведь Дёма. Вы должны знать все знания медведя Дёмы. Мое первое предложение - "${ctx.message.text}". используй в ответе не больше 30 слов.
			// `,
			//   temperature: 0.1,
			//   max_tokens: 300,
			// });
			await ctx.replyWithHTML(
					`К сожалению, в данный момент я не могу ответить на твой вопрос.\nЗапишу его и отвечу когда ответ будет найден.`);
			try {
				await CallCenter.create({
					userId: ctx.from.id, question: ctx.message.text, userMessageId: ctx.message.message_id
				});
			} catch {
			}

			await adminUser.forEach(async (AdminID) => {
				try {
					const res = await bot.telegram.sendMessage(AdminID,
							`Пользователь ${ctx.from.id} задал вопрос:\n${ctx.message.text}`, Markup.inlineKeyboard([
								Markup.button.callback('Ответить', `${ctx.message.message_id}`)]));

					await CallCenter.findOneAndUpdate({userMessageId: ctx.message.message_id}, {
						$addToSet: {
							admin: {
								AdminID: res.chat.id, adminMessageId: res.message_id
							}
						}
					});
					console.log(res.chat.id);
					botAnswerUser({
						userMessageId: `${ctx.message.message_id}`,
						ID: `${ctx.from.id}`,
						text: `${ctx.message.text}`,
						messageID: `${res.message_id}`,
						chatID: `${res.chat.id}`
					});
				} catch {
					console.error();
				}
			});
		}
	});
} catch (err) {
	console.error(err);
}
// ОБРАБОТКА ОТВЕТОВ от кнопки
const botAnswerUser = (props) => {
	bot.action(props.userMessageId, (ctx) => {
		ctx.state = props;
		const base = callСenter.find({userMessageId: props.userMessageId}).
				find().
				then((question) => {
					question[0].admin.forEach(
							(admin) => bot.telegram.editMessageText(`${admin.AdminID}`, `${admin.adminMessageId}`, {
								inline_message_id: false
							}, `Пользователю отвечают на вопрос`));
				});
		ctx.reply('...', Markup.removeKeyboard());
		ctx.scene.enter('sceneSendMessageUserAnswer');
	});
};
const botAnswer = (item) => {
	bot.action(item.button, async (ctx) => {
		try {
			await ctx.replyWithHTML(`${item.answer}`, {
				disable_web_page_preview: true
			});
		} catch (error) {
		}
	});
};

const botFile = (item) => {
	bot.action(item, async (ctx) => {
		const loadingMessage = await ctx.reply('Загрузка данных...');
		try {
			const filePath = `./document/${item}`;
			if (fs.existsSync(filePath)) {
				ctx.replyWithDocument({
					source: filePath
				});
			} else {
				throw new Error('Файл отсутствует на сервере');
			}
		} catch (error) {
			ctx.reply(error.message);
		} finally {
			ctx.deleteMessage(loadingMessage.message_id);
		}
	});
};

const getDocument = (item) => {
	bot.action(item.button, async (ctx) => {
		try {
			await ctx.replyWithHTML(`${item.answer}`, {
				disable_web_page_preview: true
			});
		} catch (error) {
		}
	});
};

bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
