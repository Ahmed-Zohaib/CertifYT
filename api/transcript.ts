import { YoutubeTranscript } from 'youtube-transcript';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Get the URL from the query
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing video URL' });
  }

  try {
    // 2. Fetch the transcript
    // This runs on the server, so no CORS issues.
    const transcriptItems = await YoutubeTranscript.fetchTranscript(url);

    // 3. Join the text parts into one big string
    const fullText = transcriptItems.map(item => item.text).join(' ');

    // 4. Return it
    return res.status(200).json({ transcript: fullText });

  } catch (error) {
    console.error('Transcript Error:', error);
    // If captions are disabled, this will fail. Handle it gracefully.
    return res.status(500).json({ error: 'Could not fetch transcript. Captions might be disabled.' });
  }
}