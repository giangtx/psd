const { google } = require('googleapis');
const fs = require('fs');

async function testGoogle() {
  try {
    const auth = new google.auth.OAuth2({
      clientId: '',
      clientSecret: '',
    });

    const scope = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive'];

    const redirectUri = `http://localhost:5000/google/auth/callback`;

    const url = auth.generateAuthUrl({
      access_type: 'offline',
      scope,
      redirect_uri: redirectUri,
    });

    console.log('url', url);

  } catch (e) {
    console.log('error');
    console.log(JSON.stringify(e));
  }
}

testGoogle();