import type { UploadFileInput, UploadedFileResult } from "./storage.types";

export interface StorageProvider {
  uploadFile(input: UploadFileInput): Promise<UploadedFileResult>;

  deleteFile(key: string): Promise<void>;
}
