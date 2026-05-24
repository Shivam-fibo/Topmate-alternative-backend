export interface UploadFileInput {
  file: Buffer;

  fileName: string;

  contentType: string;

  folder?: string;
}

export interface UploadedFileResult {
  key: string;

  url: string;
}
