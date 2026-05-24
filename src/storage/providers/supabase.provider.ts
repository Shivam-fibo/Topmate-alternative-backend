import { randomUUID } from "crypto";

import { createClient } from "@supabase/supabase-js";
import ws from "ws";

import { config } from "../../config";
import type { StorageProvider } from "../storage.interface";
import type { UploadFileInput, UploadedFileResult } from "../storage.types";

export class SupabaseStorageProvider implements StorageProvider {
  private readonly client = createClient(
    config.storage.supabaseUrl,

    config.storage.supabaseServiceRoleKey,

    {
      realtime: {
        transport: ws as unknown as typeof globalThis.WebSocket,
      },
    },
  );

  async uploadFile(input: UploadFileInput): Promise<UploadedFileResult> {
    const uniqueFileName = `${randomUUID()}-${input.fileName}`;

    const filePath = input.folder
      ? `${input.folder}/${uniqueFileName}`
      : uniqueFileName;

    const { error } = await this.client.storage
      .from(config.storage.bucket)
      .upload(filePath, input.file, {
        contentType: input.contentType,

        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data: publicUrlData } = this.client.storage
      .from(config.storage.bucket)
      .getPublicUrl(filePath);

    return {
      key: filePath,

      url: publicUrlData.publicUrl,
    };
  }

  async deleteFile(key: string): Promise<void> {
    const { error } = await this.client.storage
      .from(config.storage.bucket)
      .remove([key]);

    if (error) {
      throw new Error(error.message);
    }
  }
}
