import { $, component$, PropFunction } from "@builder.io/qwik";
import type { JukeBoxContentRow } from "~/models/song";

type SongCardProps = {
  song: JukeBoxContentRow;
  publishCallback: PropFunction<(message: string) => void>;
};

export const SongCard = component$(
  ({ song, publishCallback }: SongCardProps) => {
    const handlePublish = $((folderNumber: number, songNumber: number) => {
      const message = JSON.stringify({
        folderNumber: folderNumber.toString().padStart(2, "0"),
        songNumber: songNumber.toString().padStart(2, "0"),
      });
      publishCallback(message);
    });

    return (
      <div key={song.id} class="card bg-base-100 w-96 shadow-xl">
        <figure class="px-10 pt-10">
          <img
            src={song.coverUrl}
            width="256"
            height="256"
            alt="cover"
            class="rounded-xl"
          />
        </figure>
        <div class="card-body items-center text-center">
          <h2 class="card-title">
            {song.title} - {song.author} ({song.year})
          </h2>
          <p>
            #folder: {song.folder_number} - #song: {song.song_number}
          </p>
          <div class="card-actions">
            <button
              class="btn btn-primary"
              onClick$={() =>
                handlePublish(song.folder_number, song.song_number)
              }
            >
              Play
            </button>
          </div>
        </div>
      </div>
    );
  },
);
