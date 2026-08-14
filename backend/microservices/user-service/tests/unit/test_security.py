from app.core.security import create_access_token, decode_access_token, hash_password, verify_password


def test_password_hash_roundtrip():
    hashed = hash_password("hunter22")
    assert hashed != "hunter22"
    assert verify_password("hunter22", hashed)
    assert not verify_password("wrong-password", hashed)


def test_token_roundtrip():
    token = create_access_token("user-123", "secret", 60)
    payload = decode_access_token(token, "secret")
    assert payload["sub"] == "user-123"
