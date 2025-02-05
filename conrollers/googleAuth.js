const { GoogleSpreadsheet } = require("google-spreadsheet");

require("dotenv").config();
const {
  GOOGLE_SPREADSHEET_ID,
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY,
} = process.env;
const doc = new GoogleSpreadsheet(GOOGLE_SPREADSHEET_ID);
doc.useServiceAccountAuth({
  client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
});
const main = async () => {
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  await sheet.loadCells("A1:G100");
  const rows = await sheet.getRows();
  const list = rows.reduce((obj, row) => {
    if (row.button) {
      const todo = {
        category1: row.category1,
        category2: row.category2,
        category3: row.category3,
        questions: row.questions,
        answer: row.answer,
        secondAnswer: row.secondAnswer,
        teg: row.teg,
        button: row.button,
        buttonAnswer: row.buttonAnswer,
      };
      obj = [...obj, todo];
    }
    return obj;
  }, []);
  return list;
};
const getGooglePhoneauth = async () => {
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[1];
  await sheet.loadCells("A1:G100");
  const rows = await sheet.getRows();
  const list = rows.reduce((obj, row) => {
    const todo = {
      phone: row.phone,
    };
    obj = [...obj, todo];

    return obj;
  }, []);

  return list;
};
const getGoogleUserOnboarding = async () => {
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[1];
  await sheet.loadCells("A1:G100");
  const rows = await sheet.getRows();
  const list = rows.reduce((obj, row) => {
    const todo = {
      phone: row.phone,
    };
    obj = [...obj, todo];

    return obj;
  }, []);

  return list;
};
const setGoogleUserId = async (props) => {
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[1];
  await sheet.loadCells("A1:G100");
  const rows = await sheet.getRows();
  const row = await rows.find((row) => row.phone == props.phone);
  console.log(rows[0].rowNumber - 2);
  // console.log(rows[1].ID)
  console.log(row._rowNumber - 2);
  // console.log(rowId)
  rows[row._rowNumber - 2].ID = props.name;
  await rows[row._rowNumber - 2].save();
};
const searchOnboadging = async () => {
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[1];
  await sheet.loadCells("A1:G100");
  const rows = await sheet.getRows();
  const onboardingID = [];
  const row = await rows.find((row) => {
    row.onboarding == "да" ? (row.ID ? onboardingID.push(row.ID) : "") : "";
  });
  return onboardingID;
};
const searchUserID = async () => {
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[1];
  await sheet.loadCells("A1:G100");
  const rows = await sheet.getRows();
  const userID = [];
  const row = await rows.find((row) => {
    row.ID ? userID.push(row.ID) : "";
  });
  return userID;
};
const setGoogleUserNumberId = async (props) => {
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[1];
  await sheet.loadCells("A1:G100");
  console.log(props.phone);
  sheet.addRow([props.phone]);
};
const deleteGoogleUser = async (props) => {
  try {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[1];
    await sheet.loadCells("A1:G200");
    // console.log(props.phone);
    // sheet.addRow([props.phone]);
    const rows = await sheet.getRows();
    const row = await rows.find((row) => row.phone == props.phone);

    // console.log(rows[0].rowNumber-2);
    console.log(props.phone);
    // console.log(rows[row._rowNumber])
    // console.log(row._rowNumber-2)
    // // console.log(rowId)

    rows[row._rowNumber - 2].delete();
    rows[row._rowNumber - 2].save();
  } catch (error) {
    console.log(`Ошибка ${error.message}`);
  }
};
const setQuestionsGoogleSheets = async (props) => {
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[2];
  await sheet.loadCells("A1:B100");

  const rows = await sheet.getRows();
  return { rows, sheet };
};
const setReviewsGoogleSheets = async (ID, date, text1,
  text2,
  text3,
  text4,
  text5,
  text6,) => {
  await doc.loadInfo();
  const sheet4 = doc.sheetsByIndex[4];
  const sheet2 = doc.sheetsByIndex[1];
  await sheet4.loadCells("A1:B100");
  await sheet2.loadCells("A1:B100");
  // const rows4 = await sheet4.getRows();
  const rows2 = await sheet2.getRows();
  const rowName = await rows2.find((row) => row.ID == ID);
  console.log(rowName);
  console.log(ID);

  sheet4.addRow([date,
    rowName._rawData[1],
    rowName._rawData[0],
    rowName._rawData[2],
    rowName._rawData[3],
    text1,
    text2,
    text3,
    text4,
    text5,
    text6,
  ]);
};
const setOprosGoogleSheets = async (ID, text) => {
  await doc.loadInfo();
  const sheet6 = doc.sheetsByIndex[5];
  const sheet2 = doc.sheetsByIndex[1];
  await sheet6.loadCells("A1:B100");
  await sheet2.loadCells("A1:B100");
  // const rows4 = await sheet4.getRows();
  const rows2 = await sheet2.getRows();
  const rowName = await rows2.find((row) => row.ID == ID);
  console.log(rowName.fullName);
  console.log(ID);

  sheet6.addRow([rowName.fullName, text]);
};

module.exports = {
  main,
  searchUserID,
  setQuestionsGoogleSheets,
  getGooglePhoneauth,
  setGoogleUserId,
  setGoogleUserNumberId,
  deleteGoogleUser,
  searchOnboadging,
  setReviewsGoogleSheets,
  setOprosGoogleSheets,
};
