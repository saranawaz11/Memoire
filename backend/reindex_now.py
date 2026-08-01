"""
python reindex_now.py

Backfills note_chunks for every note currently in the DB that's missing
embeddings — this is the one-time cleanup needed because tools.py's
create_note/update_note didn't call the embedding step until just now.

Safe to re-run any time: rag.reindex_all_notes() deletes and regenerates
chunks per note, so it's idempotent.
"""

from database import SessionLocal
import rag

db = SessionLocal()
try:
    count = rag.reindex_all_notes(db)  # no user_id filter = every user's notes
    print(f"Reindexed {count} notes.")
finally:
    db.close()