import type { Tables } from "~/lib/supabase/database.types";

export type JukeBoxContentRow = Tables<"song"> & { coverUrl?: string };

export type PlaySongCommand = {
  folderNumber: number;
  songNumber: number;
};
