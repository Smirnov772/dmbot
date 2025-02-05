module.exports = {
  startMessage: 'Добро пожаловать! Нажмите кнопку "Начать" для продолжения.',
  startMenu: [
    {label: 'Начать', action: 'M_START_MENU'}],
  menus: {
    M_START_MENU: {
      subMenu: [
        {label: 'Информация', action: 'M_INFO'},
        {label: 'Документы', action: 'M_DOCUMENTS'},
        {label: 'Маршрут', action: 'M_ROUTE'},
        {label: 'Регистрация', action: 'REGISTRATION'}],
    }, M_INFO: {
      message: 'Ответ на запрос "Информация".', subMenu: [
        {label: 'Вернуться в меню', action: 'M_START_MENU'}],
    },
    M_INFO: {
      message: 'Информация', subMenu: [
        {label: 'Видео "О компании"', action: 'SHOW_VIDEO_VIDEO_INFO'},
        {label: 'О складе', action: 'SHOW_IMAGE_IMAGE_INFO'},

        {label: 'Вернуться в меню', action: 'M_START_MENU'}]
    },
    M_DOCUMENTS: {
      message: 'Ответ на запрос "Документы".', subMenu: [
        {
          label: 'Для граждан РФ', action: 'SHOW_TEXT_RF',
          text: `паспорт`,
        }, {
          label: 'Для граждан РБ', action: 'SHOW_TEXT_RB',
          text: `паспорт`,
        }, {label: 'Вернуться в меню', action: 'M_START_MENU'}],
    }, M_ROUTE: {
      message: 'Выберите тип маршрута:', subMenu: [
        {label: 'Путь от парковки до отдела кадров', action: 'SHOW_VIDEO_VIDEO_CADR'},
        {
          label: 'Построить маршрут в картах',
          link: 'https://yandex.ru/maps/?ll=36.815348%2C55.426544&mode=routes&rtext=~55.427960%2C36.812500&rtt=auto&ruri=~ymapsbm1%3A%2F%2Forg%3Foid%3D234736202517&z=16.95',
        },
        {label: 'На корпоративном транспорте', action: 'M_ROUTE_CORPORATE'},
        {label: 'Вернуться в меню', action: 'M_START_MENU'}],
    }, M_ROUTE_CORPORATE: {
      message: 'Информация о маршруте на корпоративном транспорте.', subMenu: [
        { label: 'Калуга-> РЦ Бекасово -> Калуга', action: 'SHOW_TEXT_KALUGA' },
        { label: 'ст.Нара->РЦ Бекасово -> ст.Нара', action: 'SHOW_TEXT_NARA' },
        { label: 'Одинцово -> Крекшино -> РЦ Бекасово', action: 'SHOW_TEXT_ODINZOVO' },
        { label: 'Малоярославец -> РЦ Бекасово -> Малоярославец', action: 'SHOW_TEXT_MALOYAROSLAVETS' },
        { label: 'Обнинск -> РЦ Бекасово -> Обнинск', action: 'SHOW_TEXT_OBNINSK' },
        { label: 'Балабаново -> РЦ Бекасово -> Балабаново', action: 'SHOW_TEXT_BALABANOVO' },
        { label: 'Тропарево -> РЦ Бекасово -> Тропарево', action: 'SHOW_TEXT_TROPAREVO' },

        {label: 'Назад', action: 'M_ROUTE'}],
    },
  },
};