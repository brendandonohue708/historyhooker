// YouTube Data API v3 lookup: given a search query and a channel name,
// return the first public, embeddable video that matches.

const apiKey = Deno.env.get('YOUTUBE_API_KEY');

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: { title: string; channelTitle: string };
}

interface YouTubeVideoItem {
  id: string;
  status: { privacyStatus: string; embeddable: boolean };
}

export interface VerifiedVideo {
  videoId: string;
  videoTitle: string;
  channelName: string;
}

export async function verifyVideo(
  searchQuery: string,
  preferredChannel: string,
): Promise<VerifiedVideo | null> {
  if (!apiKey) {
    console.warn('YOUTUBE_API_KEY missing — falling back to null video.');
    return null;
  }
  const params = new URLSearchParams({
    part: 'snippet',
    q: searchQuery,
    type: 'video',
    maxResults: '5',
    safeSearch: 'strict',
    videoEmbeddable: 'true',
    key: apiKey,
  });
  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`,
  );
  if (!searchRes.ok) {
    console.error(`YouTube search failed: ${searchRes.status}`);
    return null;
  }
  const searchData = (await searchRes.json()) as {
    items?: YouTubeSearchItem[];
  };
  const items = searchData.items ?? [];
  if (items.length === 0) return null;

  // Prefer items from the requested channel, otherwise take top result.
  const preferred =
    items.find(
      (i) =>
        i.snippet.channelTitle.toLowerCase() ===
        preferredChannel.toLowerCase(),
    ) ?? items[0];

  // Verify embeddability via videos endpoint (search results sometimes lie).
  const verifyParams = new URLSearchParams({
    part: 'status',
    id: preferred.id.videoId,
    key: apiKey,
  });
  const verifyRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${verifyParams}`,
  );
  if (!verifyRes.ok) {
    return {
      videoId: preferred.id.videoId,
      videoTitle: preferred.snippet.title,
      channelName: preferred.snippet.channelTitle,
    };
  }
  const verifyData = (await verifyRes.json()) as { items?: YouTubeVideoItem[] };
  const status = verifyData.items?.[0]?.status;
  if (status && status.privacyStatus === 'public' && status.embeddable) {
    return {
      videoId: preferred.id.videoId,
      videoTitle: preferred.snippet.title,
      channelName: preferred.snippet.channelTitle,
    };
  }
  return null;
}
