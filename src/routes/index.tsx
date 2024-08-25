import {
  $,
  component$,
  NoSerialize,
  noSerialize,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import mqtt, { MqttClient } from "mqtt";
import { createServerClient } from "supabase-auth-helpers-qwik";
import { SongCard } from "~/components/song/song-card";
import type { Database } from "~/lib/supabase/database.types";
import type { JukeBoxContentRow } from "~/models/song";

export const useJukeboxContent = routeLoader$(async (requestEv) => {
  const supabaseClient = createServerClient<Database>(
    requestEv.env.get("PUBLIC_SUPABASE_URL")!,
    requestEv.env.get("PUBLIC_SUPABASE_ANON_KEY")!,
    requestEv,
  );
  const { data } = await supabaseClient.from("song").select("*");

  const jukeboxContent: JukeBoxContentRow[] = await Promise.all(
    data?.map(async (song) => {
      const publicUrlResult = await supabaseClient.storage
        .from("remote-jukebox-covers")
        .createSignedUrl(song.cover_key || "", 60 * 60 * 24);

      return {
        ...song,
        coverUrl: publicUrlResult.data?.signedUrl,
      };
    }) ?? [],
  );

  return jukeboxContent;
});

export default component$(() => {
  const jukeboxContent = useJukeboxContent();

  const connectionStatus = useSignal<
    "connected" | "disconnected" | "connecting"
  >("disconnected");

  const mqttClient = useSignal<NoSerialize<MqttClient> | null>(null);

  const handlePublish = $((message: string) => {
    if (!mqttClient.value) {
      console.error("MQTT Client not ready");
      return;
    }

    if (connectionStatus.value !== "connected") {
      console.error("MQTT Client not connected");
      return;
    }

    mqttClient.value.publish("jukebox", message);
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {    
    connectionStatus.value = "connecting";

    const mqttBrokerUrl = import.meta.env.VITE_MQTT_BROKER_URL;
    if (!mqttBrokerUrl) {
      console.error("MQTT_BROKER_URL not found in environment");
      return;
    }

    const client = mqtt.connect(mqttBrokerUrl);
    mqttClient.value = noSerialize(client);

    client.on("connect", () => {
      console.log("Connected to MQTT broker");
      connectionStatus.value = "connected";
    });

    client.on("error", (err) => {
      console.error("MQTT error:", err);
      connectionStatus.value = "disconnected";
    });

    client.on("close", () => {
      console.log("Connection to MQTT broker closed");
      connectionStatus.value = "disconnected";
    });

    cleanup(() => {
      client.end();
      connectionStatus.value = "disconnected";
      console.log("Cleanup MQTT broker connection");
    });
  });

  return (
    <>
      <div class="navbar bg-primary text-primary-content">
        <h1 class="text-2xl">Remote Jukebox</h1>
      </div>
      <div class="container flex flex-wrap gap-4">
        {jukeboxContent.value.map((song) => (
          <SongCard key={song.id} song={song} publishCallback={handlePublish} />
        ))}
      </div>
      <footer class="footer bg-neutral text-neutral-content p-10">
        <div>
          <p>MQTT Connection status: {connectionStatus.value}</p>
        </div>
      </footer>
    </>
  );
});

export const head: DocumentHead = {
  title: "Remote Jukebox",
  meta: [
    {
      name: "Remote Jukebox - Home",
      content: "Remote Jukebox Home Page",
    },
  ],
};
