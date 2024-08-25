import { createDOM } from '@builder.io/qwik/testing';
import { test, expect } from 'vitest';
import { SongCard } from './song-card';
import { JukeBoxContentRow } from '~/models/song';

const aSong: JukeBoxContentRow = {
    id: 1,
    author: 'The Beatles',
    title: 'Come Together',
    album: 'Abbey Road',
    year: 1969,
    genre: 'Rock',
    coverUrl: 'https://example.com/cover.jpg',
    cover_key: 'cover.jpg',
    created_at: new Date().toISOString(),
    folder_number: 1,
    song_number: 2,
}

test(`[SongCard Component]: Should render`, async () => {
    const { screen, render } = await createDOM();
    await render(<SongCard song={aSong} />);
    expect(screen.outerHTML).toContain('Come Together - The Beatles (1969)');
    expect(screen.outerHTML).toContain('#folder: 1 - #song: 2');
});