import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

interface UploadScreenshotRequest {
  file: File;
  userId: string;
  instrument: string;
  tradeType: string;
  tradeDate: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const instrument = formData.get("instrument") as string;
    const tradeType = formData.get("tradeType") as string;
    const tradeDate = formData.get("tradeDate") as string;

    if (!file || !userId || !instrument || !tradeType || !tradeDate) {
      return NextResponse.json(
        { error: "Missing required fields: file, userId, instrument, tradeType, tradeDate" },
        { status: 400 }
      );
    }

    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!serviceAccountJson || !driveFolderId) {
      return NextResponse.json(
        { error: "Google Drive credentials not configured" },
        { status: 500 }
      );
    }

    // Parse service account credentials
    const credentials = JSON.parse(serviceAccountJson);

    // Authenticate with Google Drive
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Create user subfolder if it doesn't exist
    const userFolderName = userId;
    let userFolderId: string | null = null;

    // Search for existing user folder
    const folderList = await drive.files.list({
      q: `name='${userFolderName}' and '${driveFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
    });

    if (folderList.data.files && folderList.data.files.length > 0) {
      userFolderId = folderList.data.files[0].id ?? null;
    } else {
      // Create user folder
      const userFolder = await drive.files.create({
        requestBody: {
          name: userFolderName,
          mimeType: "application/vnd.google-apps.folder",
          parents: [driveFolderId],
        },
        fields: "id",
      });
      userFolderId = userFolder.data.id ?? null;
    }

    if (!userFolderId) {
      return NextResponse.json(
        { error: "Failed to create or find user folder" },
        { status: 500 }
      );
    }

    // Generate filename with specified structure
    const timestamp = Math.floor(Date.now() / 1000);
    const extension = file.name.split(".").pop() ?? "png";
    const fileName = `Tradeon_${tradeDate}_${instrument}_${tradeType}_${timestamp}.${extension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file to Google Drive
    const uploadedFile = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [userFolderId],
      },
      media: {
        mimeType: file.type,
        body: buffer,
      },
      fields: "id",
    });

    if (!uploadedFile.data.id) {
      return NextResponse.json(
        { error: "Failed to upload file to Google Drive" },
        { status: 500 }
      );
    }

    // Set file permissions to "anyone with the link can view"
    await drive.permissions.create({
      fileId: uploadedFile.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // Generate shareable link
    const shareableLink = `https://drive.google.com/file/d/${uploadedFile.data.id}/view`;

    return NextResponse.json({ success: true, screenshotUrl: shareableLink });
  } catch (error) {
    console.error("Google Drive upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload screenshot to Google Drive" },
      { status: 500 }
    );
  }
}
