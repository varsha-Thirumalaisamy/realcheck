import c2pa
import json

def test_c2pa(file_path, mime_type="image/jpeg"):
    try:
        with open(file_path, "rb") as f:
            try:
                reader = c2pa.Reader.try_create(mime_type, f)
                print("JSON:", reader.json())
                print("VALID:", reader.is_valid())
                print("RESULTS:", reader.get_validation_results())
            except Exception as e:
                print("c2pa exception:", e)
    except Exception as e:
        print("error:", e)

if __name__ == "__main__":
    with open("test_dummy.jpg", "wb") as f:
        f.write(b"123")
    test_c2pa("test_dummy.jpg")
