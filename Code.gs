function doPost(e) {
  try {
    const params = e.parameter;
    const action = params.action;
    
    if (action === 'uploadFile') {
      return uploadFile(params);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid action'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const params = e.parameter;
    const action = params.action;
    
    if (action === 'uploadFile') {
      return uploadFile(params);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid action'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function uploadFile(params) {
  try {
    const fileName = params.fileName;
    const mimeType = params.mimeType;
    const fileData = params.fileData;
    
    if (!fileName || !mimeType || !fileData) {
      throw new Error('Missing required parameters: fileName, mimeType, or fileData');
    }
    
    // Decode base64 data
    const blob = Utilities.newBlob(
      Utilities.base64Decode(fileData),
      mimeType,
      fileName
    );
    
    // Get the target folder (SOC Images folder)
    const folderId = '1ifF6t5YPQH6KXSXPiQJbahlvhu2YJ4-7';
    const folder = DriveApp.getFolderById(folderId);
    
    // Create unique filename with timestamp
    const timestamp = new Date().getTime();
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `SOC_${timestamp}.${fileExtension}`;
    
    // Create file in the folder
    const file = folder.createFile(blob.setName(uniqueFileName));
    
    // Set file sharing to anyone with link can view
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Generate the direct image URL
    const fileId = file.getId();
    const imageUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
    
    // Alternative URL format that also works
    const alternativeUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    Logger.log('File uploaded successfully: ' + uniqueFileName);
    Logger.log('File ID: ' + fileId);
    Logger.log('Image URL: ' + imageUrl);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        fileId: fileId,
        fileName: uniqueFileName,
        url: imageUrl,
        alternativeUrl: alternativeUrl,
        message: 'File uploaded successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in uploadFile: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper function to test the upload functionality
function testUpload() {
  // This is for testing purposes only
  const testParams = {
    action: 'uploadFile',
    fileName: 'test.jpg',
    mimeType: 'image/jpeg',
    fileData: 'base64_encoded_data_here' // Replace with actual base64 data for testing
  };
  
  const result = uploadFile(testParams);
  Logger.log(result.getContent());
}

// Function to list files in the SOC folder (for debugging)
function listFilesInSOCFolder() {
  try {
    const folderId = '1ifF6t5YPQH6KXSXPiQJbahlvhu2YJ4-7';
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    
    Logger.log('Files in SOC folder:');
    while (files.hasNext()) {
      const file = files.next();
      Logger.log(`- ${file.getName()} (ID: ${file.getId()})`);
    }
  } catch (error) {
    Logger.log('Error listing files: ' + error.toString());
  }
}

// Function to clean up old files (optional - run manually if needed)
function cleanupOldFiles() {
  try {
    const folderId = '1ifF6t5YPQH6KXSXPiQJbahlvhu2YJ4-7';
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    let deletedCount = 0;
    while (files.hasNext()) {
      const file = files.next();
      if (file.getDateCreated() < thirtyDaysAgo) {
        Logger.log(`Deleting old file: ${file.getName()}`);
        file.setTrashed(true);
        deletedCount++;
      }
    }
    
    Logger.log(`Cleaned up ${deletedCount} old files`);
  } catch (error) {
    Logger.log('Error cleaning up files: ' + error.toString());
  }
}

// Function to get file info by ID (for debugging)
function getFileInfo(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    Logger.log(`File Name: ${file.getName()}`);
    Logger.log(`File Size: ${file.getSize()} bytes`);
    Logger.log(`Created: ${file.getDateCreated()}`);
    Logger.log(`Modified: ${file.getLastUpdated()}`);
    Logger.log(`MIME Type: ${file.getBlob().getContentType()}`);
    Logger.log(`Download URL: https://drive.google.com/uc?export=download&id=${fileId}`);
    Logger.log(`View URL: https://drive.google.com/uc?export=view&id=${fileId}`);
    Logger.log(`Direct Image URL: https://lh3.googleusercontent.com/d/${fileId}`);
  } catch (error) {
    Logger.log('Error getting file info: ' + error.toString());
  }
}