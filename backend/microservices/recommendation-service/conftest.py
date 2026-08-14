import sys
from pathlib import Path

# Guarantee `import app...` works regardless of pytest's import-mode/rootdir quirks.
sys.path.insert(0, str(Path(__file__).resolve().parent))
