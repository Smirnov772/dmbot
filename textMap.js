const textMap = {
	RF: `🪪***Для граждан РФ*** \n\n1) паспорт или иной документ, удостоверяющий личность работника;
2) трудовую книжку, за исключением случаев, когда трудовой договор заключается впервые или работник поступает на работу на условиях совместительства;
3)СТД-ПФР (можно заказать через Госуслуги или в МФЦ)
4) СНИЛС;
5) документы воинского учета - для военнообязанных и лиц, подлежащих призыву на военную службу;
6) документ об образовании и (или) о квалификации или наличии специальных знаний;
7) ИНН.
8) свидетельство о браке (разводе), о рождении детей (до 14 лет)
9)  Реквизиты личного лицевого счета в банке."`, RB: `🪪***Для граждан РБ*** \n\n"1) Паспорт. Необходимы будут два разворота. Один на белорусском языке, другой – на русском;
2) ИНН;
3) СНИЛС;
4) Миграционная  карта (если есть);
5) Временная регистрация в Московской области
6) Страховой полис;
7) ВНЖ (если есть). `,
	KALUGA: `🚎***Калуга-> РЦ Бекасово -> Калуга*** \n\n"ООО ""Автотранс" 
О 008 ЕК 40
Представитель перевозчика: Денис 8-910-915-88-80

Остановки
Утро:
Калуга (Спутник ул.Московская) 06:30
Юбилейный 07:00
Детчино (центр) 07:15
Детчино (Шанхай) 07:20 
Михеево 07:25        
Воробьи 07:30        
Алешкино 07:35        
Ерденево 07:40        
РЦ Бекасово 08:50         
Убытие из РЦ Бекасово 09:20
                                        
Вечер:
Калуга 18:30 
(Спутник ул.Московская) 19:00        
Юбилейный 19:15        
Детчино (центр) 19:20        
Детчино (Шанхай)  19:25        
Михеево 19:30        
Воробьи 19:35        
Алешкино 19:40         
Ерденево 20:50        
РЦ Бекасово         
Убытие из РЦ Бекасово 21:20`, NARA: `🚎***ст.Нара->РЦ Бекасово -> ст.Нара*** \n\n"ООО "Автотранс"
О 006 ВР 40; С366 КР 750                                                               
Представитель перевозчика: Денис 8-910-915-88-80

Остановки
Утро: 
Ст Нара 08:20
Зосимова пустынь 08:25
РЦ Бекасово 08:35
Убытие из РЦ Бекасово 09:20 

Вечер:
Ст Нара 20:20
Зосимова пустынь 20:25
РЦ Бекасово 20:35
Убытие из РЦ Бекасово 21:20  "`, ODINZOVO: `🚎***Одинцово -> Крекшино -> РЦ Бекасово*** \n\n"ООО "Эталон" 
С 758 КО 750
Номер водителя: Сергей 8-903-170-49-84
Представитель перевозчика: Денис 8-925-202-98-30

Утро:
 
Одинцово, ул. Союзная 1  - 7:00
ст. Крекшино (со стороны парка Победы - 7:40
Апрелевка ул. Августовская 5  - 8:05
Селятино ,Дубрава - 8:10
Рассудово - 8:15
Киевский - 8:20
РЦ Бекасово - 8:30 
Убытие из РЦ Бекасово 9:20

Вечер:

Одинцово, ул. Союзная 1  - 19:00
ст. Крекшино (со стороны парка Победы - 19:40
Апрелевка ул. Августовская 5 - 20:05
Селятино ,Дубрава - 20:10
Рассудово  - 20 :15
Киевский - 20:20 
РЦ Бекасово  - 20 :30
Убытие из РЦ Бекасово - 21:20
"`, MALOYAROSLAVETS: `🚎***Малоярославец -> РЦ Бекасово -> Малоярославец*** \n\n"ИП ""Ахмазов""
Х 674 ХМ 750
Водитель: Андрей 8-950-286-24-78

Остановки
Утро:
Маклино  07:05       
Больница   07:10     
ЖД вокзал Малоярославец 07:20       
Продуваловка  07:24      
РЦ Бекасово   08:30      
Убытие РЦ Бекасово  09:20

Вечер:
Маклино   19:05     
Больница     19:10   
ЖД вокзал Малоярославец 19:20       
Продуваловка    19:24    
РЦ Бекасово        20:30  
Убытие РЦ Бекасово  21:20"`, OBNINSK: `🚎***Обнинск -> РЦ Бекасово -> Обнинск*** \n\n"ООО ""Автотранс""
О 005 ЕК 40                                                              
Представитель перевозчика: Денис 8-910-915-88-80

Остановки:
Утро
ЖД ст. Обнинск (со стороны автостанции)  - 7:40
РЦ Бекасово  - 8:30 
Убытие РЦ Бекасово - 9:20

Вечер:
ЖД ст. Обнинск (со стороны автостанции) - 19:40
РЦ Бекасово - 20:30
Убытие РЦ Бекасово - 21:20`, BALABANOVO: `🚎***Балабаново -> РЦ Бекасово -> Балабаново*** \n\n"ООО ""Автотранс""
О 004 РС 40                                                              
Представитель перевозчика: Денис 8-910-915-88-80

Остановки:
Утро

Балабаново станция - 7:45
Балабаново на трассе ост. Московская - 7:50
РЦ Бекасово - 8:30
Убытие из РЦ Бекасово - 9:20

Вечер:

Балабаново станция - 19:45
Балабаново на трассе ост. Московская - 19:50
РЦ Бекасово - 20:30
Убытие из РЦ Бекасово - 21:20
"`, TROPAREVO: `🚎***Тропарево -> РЦ Бекасово -> Тропарево*** \n\n"ООО ""Эталон"" (+7-925-202-98-30)  
Mercedes Sprinter М 828 СТ 82
Водитель: Георгий 8-977-416-32-21
Представитель перевозчика: Александр 8-925-202-98-30

Остановки
Утро:

м.Тропарева - 7:40
г. Апрелевка остановка Горки улица Горького 34А - 8:00
п. Селятино: остановка Дубрава - 8:05
д. Рассудово: остановка Рассудово - 8:10
РЦ Бекасово - 8:30
Убытие из РЦ Бекасово - 9:30

Вечер:
м.Тропарева - 19:40
г. Апрелевка остановка Горки улица Горького 34А - 20:00
п. Селятино: остановка Дубрава - 20:05
д. Рассудово: остановка Рассудово - 20:10
РЦ Бекасово - 20:30
Убытие из РЦ Бекасово - 21:30
"`, VIDEO_INFO: `output.mp4`,VIDEO_CADR: `video-cadr.mp4`, IMAGE_INFO: "imageinfo.jpg"
};

module.exports = textMap;
