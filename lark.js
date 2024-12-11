const lark = require('@larksuiteoapi/node-sdk');

async function testLark() {
  try {
    const client = new lark.Client({
      appId: '',
      appSecret: '',
      appType: lark.AppType.SelfBuild,
      domain: lark.Domain.Feishu,
    });
  
    const res = await client.bitable.appTableRecord.create({
      path: {
        app_token: "",
        table_id: ""
      },
      data: {
        fields: {
          "Text": "test",
          "Single option": "gio",
          "Date": 173371574200,
          "Text 1": "alo",
          "– ありがとう ございます": "– ありがとう ございます"
        }
      }
    });
    console.log(res);
  } catch (e) {
    console.log(JSON.stringify(e));
  }
  
}

testLark();