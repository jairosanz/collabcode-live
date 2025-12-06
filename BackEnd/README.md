# CollabCode Backend

## Setup

1.  Navigate to the backend directory:
    ```bash
    cd BackEnd
    ```

2.  Sync dependencies:
    ```bash
    uv sync
    ```

## Running the Server

Start the development server:

```bash
uv run uvicorn main:app --reload
uv run uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.
- Root endpoint: `http://localhost:8000/`
- Documentation: `http://localhost:8000/docs`

## Verification

Run the verification script to test all endpoints:

```bash
uv run python verify_api.py
```
