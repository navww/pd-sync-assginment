# Pipedrive Sync Assignment

This is a simple script to map and sync person data from a local JSON file to Pipedrive. It reads from `inputData.json`, maps the fields according to `mappings.json`, and then either creates a new person or updates an existing one if they are found by name.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with your Pipedrive credentials:
   ```
   PIPEDRIVE_API_KEY=your_key
   PIPEDRIVE_COMPANY_DOMAIN=your_domain
   ```

## Running the Project

To run the project in development mode:
```bash
npm run dev
```

To build and start for production:
```bash
npm run build
npm start
```

## Implementation Details

The script follows this logic:
1. It loads the `inputData.json` and `mappings.json`.
2. It builds a payload dynamically. I added a helper to handle nested keys like `phoneNumber.home`.
3. It checks Pipedrive to see if a person with the same name already exists.
4. If found -> Update (`PUT`).
5. If not found -> Create (`POST`).

### Edge Cases
I handled a few edge cases to make sure the script is robust:
- **Missing Env Variables**: The script stops immediately if the API key or domain is missing.
- **Missing Data Fields**: If a mapped field isn't found in the input, it just logs a warning and continues with the rest of the data.
- **API Errors**: It catches Axios errors properly to show the actual error message from Pipedrive (like 401 Unauthorized), which helps a lot with debugging.
