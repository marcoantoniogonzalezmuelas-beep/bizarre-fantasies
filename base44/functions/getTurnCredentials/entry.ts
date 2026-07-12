Deno.serve(async () => {
  try {
    const appName = Deno.env.get("METERED_TURN_APP_NAME");
    const apiKey = Deno.env.get("METERED_TURN_API_KEY");
    if (!appName || !apiKey) {
      return Response.json({ error: "Metered TURN is not configured" }, { status: 500 });
    }

    const url = `https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url);
    if (!response.ok) {
      return Response.json({ error: "Could not obtain TURN credentials" }, { status: 502 });
    }

    const iceServers = await response.json();
    if (!Array.isArray(iceServers) || iceServers.length === 0) {
      return Response.json({ error: "Metered returned no ICE servers" }, { status: 502 });
    }

    return Response.json({ iceServers });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});