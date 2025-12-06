.PHONY: install run verify clean

install:
	uv sync

run:
	uv run uvicorn main:app --reload

verify:
	uv run python verify_api.py

clean:
	rm -rf __pycache__
	find . -type d -name "__pycache__" -exec rm -rf {} +

seed:
	uv run python init_db.py --seed
