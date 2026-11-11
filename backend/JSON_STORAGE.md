# Local JSON storage

The backend stores each collection as a JSON array in `backend/data`. Records
from this checkout's existing local project database were migrated into these
files. A fresh clone creates empty collection files on its first run. The JSON
files then persist across server restarts.

Writes are serialized per collection and saved through a flushed temporary file
followed by an atomic rename. If a data file is invalid JSON, startup reports
the file and leaves it untouched so the records can be restored from a backup.

Back up `backend/data` if you need to preserve local demonstration data. These
files are ignored by Git because they can contain account details and password
hashes.

## Deployment limitation

This storage is for a local, single-process development/demo server. Vercel
serverless instances do not provide durable shared filesystem storage; writes
can disappear between invocations or run on different instances. Keep JSON
storage for local development and choose a persistent writable host or external
storage before deploying this backend.
