# Nova AI — Vercel Chatbot

A clean AI chatbot using a Vercel serverless function and Groq's OpenAI-compatible API.

## Deploy

1. Create a Groq API key.
2. Push this folder to GitHub.
3. Import the repository into Vercel.
4. In Vercel → Project Settings → Environment Variables, add:
   - Name: `GROQ_API_KEY`
   - Value: your Groq API key
5. Redeploy.

The API key is used only by `/api/chat.js`; it is never placed in the browser code.

## Local test

Install Vercel CLI, then run:

```bash
vercel dev
```

Open the local URL shown by Vercel.

## Notes

The included model is `llama-3.3-70b-versatile`. Provider availability and limits can change, so check the provider dashboard if requests stop working.
