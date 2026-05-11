# TODO - OpenBro chatbot integration

- [ ] Inspect backend `/api/chat` handler and existing AI provider (Ollama).
- [ ] Add OpenBro (Python) integration into `backend/server.py` so `/api/chat` can use the fine-tuned TinyLlama+LoRA from `C:\Users\lazar\Documents\OpenBro`.
- [ ] Wire `/api/chat` to call OpenBro’s model loader + generation (keep existing Ollama as fallback).
- [ ] Add configuration via env vars: OpenBro path, base model, adapter path, generation params.
- [ ] Test: start backend, send a sample POST to `/api/chat`, verify response.
- [ ] (Optional) Update error message in frontend if model init fails.

