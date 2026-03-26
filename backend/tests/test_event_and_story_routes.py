def test_story_generate_uses_fallback(client):
    response = client.post(
        "/api/story/generate",
        json={
            "event_result": "success",
            "template_key": "chapter1_success",
        },
    )

    assert response.status_code == 201
    payload = response.get_json()
    assert payload["success"] is True
    assert payload["data"]["template_key"] == "chapter1_success"
    assert payload["data"]["tone"] == "adventure"
