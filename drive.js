const { google } = require('googleapis');
const fs = require('fs');

async function testGoogle() {
  try {
    const auth = new google.auth.OAuth2({
      clientId: '',
      clientSecret: '',
    });
    const rootFolderId = 'root';
    auth.setCredentials({
      refresh_token: '',
    });
    // get user info

    const drive = google.drive({ version: 'v3', auth });

    let folders = [];
    let pageToken = null;

    // i want get folder before 2022-12-28T09:50:03.534Z
    const formattedDate = new Date('2022-01-01T00:00:00.534Z').toISOString();
    // const formattedDate = new Date().toISOString();
    do {
      console.log('pageToken', pageToken);
      // i want get folder name, id, and mimeType,
      // i want get all folder of folder id: 126UPmvtio6fljNYE47t2kjMKMJNJvI1C
      console.log(formattedDate);
      const res = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.folder' and trashed=false and modifiedTime < '" + formattedDate + "'" + " and '" + rootFolderId + "' in parents",
        // q: "mimeType='application/vnd.google-apps.folder'",
        fields: 'nextPageToken, files(id, name, createdTime, modifiedTime, mimeType, owners, size, webViewLink, trashed)',
        pageSize: 100,
        pageToken,
      });
      folders = folders.concat(res.data.files);
      pageToken = res.data.nextPageToken;
    } while (pageToken);
    console.log(folders);
    // save data to file json
    fs.writeFileSync('drive.json', JSON.stringify(folders, null, 2));
    
    // delete folder
    // for (let folder of folders) {
    //   await drive.files.delete({
    //     fileId: folder.id,
    //   });
    // }

  } catch (e) {
    console.log('error');
    console.log(JSON.stringify(e));
  }
}

testGoogle();