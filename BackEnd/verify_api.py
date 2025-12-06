import requests
import time
import sys

BASE_URL = "http://localhost:8000"

def test_api():
    print(f"Testing API at {BASE_URL}...")
    
    # 1. Create Room
    print("\n1. Testing Create Room...")
    try:
        response = requests.post(f"{BASE_URL}/rooms")
        response.raise_for_status()
        room = response.json()
        room_id = room["id"]
        print(f"✓ Room created: {room_id}")
    except Exception as e:
        print(f"✗ Failed to create room: {e}")
        sys.exit(1)

    # 2. Get Room
    print("\n2. Testing Get Room...")
    try:
        response = requests.get(f"{BASE_URL}/rooms/{room_id}")
        response.raise_for_status()
        fetched_room = response.json()
        assert fetched_room["id"] == room_id
        print(f"✓ Room fetched successfully")
    except Exception as e:
        print(f"✗ Failed to get room: {e}")
        sys.exit(1)

    # 3. Join Room
    print("\n3. Testing Join Room...")
    try:
        response = requests.post(f"{BASE_URL}/rooms/{room_id}/join")
        response.raise_for_status()
        joined_room = response.json()
        assert joined_room["connectedUsers"] > 0
        print(f"✓ Joined room. Users: {joined_room['connectedUsers']}")
    except Exception as e:
        print(f"✗ Failed to join room: {e}")
        sys.exit(1)

    # 4. Update Code
    print("\n4. Testing Update Code...")
    new_code = "print('Hello API')"
    try:
        response = requests.put(f"{BASE_URL}/rooms/{room_id}/code", json={"code": new_code})
        response.raise_for_status()
        
        # Verify update
        check = requests.get(f"{BASE_URL}/rooms/{room_id}")
        assert check.json()["code"] == new_code
        print(f"✓ Code updated successfully")
    except Exception as e:
        print(f"✗ Failed to update code: {e}")
        sys.exit(1)

    # 5. Update Language
    print("\n5. Testing Update Language...")
    new_lang = "python"
    try:
        response = requests.put(f"{BASE_URL}/rooms/{room_id}/language", json={"language": new_lang})
        response.raise_for_status()
        
        # Verify update
        check = requests.get(f"{BASE_URL}/rooms/{room_id}")
        assert check.json()["language"] == new_lang
        print(f"✓ Language updated successfully")
    except Exception as e:
        print(f"✗ Failed to update language: {e}")
        sys.exit(1)

    # 6. Execute Code
    print("\n6. Testing Execute Code...")
    try:
        response = requests.post(f"{BASE_URL}/execute", json={"code": "print(1)", "language": "python"})
        response.raise_for_status()
        result = response.json()
        assert "output" in result
        print(f"✓ Code executed. Output: {result['output']}")
    except Exception as e:
        print(f"✗ Failed to execute code: {e}")
        sys.exit(1)
        
    # 7. Get Connected Users
    print("\n7. Testing Get Connected Users...")
    try:
        response = requests.get(f"{BASE_URL}/rooms/{room_id}/users/count")
        response.raise_for_status()
        count = response.json()["count"]
        print(f"✓ Connected users: {count}")
    except Exception as e:
        print(f"✗ Failed to get users count: {e}")
        sys.exit(1)

    # 8. Leave Room
    print("\n8. Testing Leave Room...")
    try:
        response = requests.post(f"{BASE_URL}/rooms/{room_id}/leave")
        response.raise_for_status()
        print(f"✓ Left room successfully")
    except Exception as e:
        print(f"✗ Failed to leave room: {e}")
        sys.exit(1)

    print("\nAll tests passed! ✨")

if __name__ == "__main__":
    # Wait for server to start if needed (manual delay or loop)
    # create a simple retry loop for connection
    retries = 5
    for i in range(retries):
        try:
            requests.get(BASE_URL)
            break
        except requests.exceptions.ConnectionError:
            print(f"Waiting for server... ({i+1}/{retries})")
            time.sleep(1)
    
    test_api()
