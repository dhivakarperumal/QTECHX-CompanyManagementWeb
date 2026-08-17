import json
import re

with open('AdminServicesSettingsPage.backup.jsx', 'r', encoding='utf-8') as f:
    old_content = f.read()

# The user wants exactly the AllClients UI but adapted for Services.
# We will construct the React component text.

# First, extract the old imports, state, helper functions, and logic.
# Then construct the JSX block.

# We will just write a complete JSX file.
