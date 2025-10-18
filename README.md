# ai-legal-doc-analyzer
AI-powered legal document analyzer that answers questions, cites sources, and summarizes legal PDFs.

steps to do :

PDF rendering library: Which approach do you prefer?
a) react-pdf (most popular, uses PDF.js, better performance)
b) @react-pdf-viewer (feature-rich, built-in toolbar)
c) PDF.js directly (more control, steeper learning curve)

AI Integration: Which AI service will you use?
a) OpenAI GPT API (most common, requires API key)
b) Anthropic Claude API (good for long documents)
c) Setup backend proxy first, decide AI provider later
d) Other service you have in mind

PDF text extraction for AI processing:
a) Extract text on upload and store in database
b) Extract text on-demand when user asks questions
c) Use a service like Unstructured.io or similar

Highlighting/annotations implementation:
a) Store coordinates in database, render overlays
b) Use PDF.js built-in annotation layer
c) Implement simple text selection + note association first, advanced later