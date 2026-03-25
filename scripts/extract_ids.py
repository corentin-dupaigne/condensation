import json
import os

def extract_ids_from_json(file_path):
    ids = set()
    if not os.path.exists(file_path):
        print(f"Warning: File not found: {file_path}")
        return ids

    with open(file_path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
            # Recursive function to find all "id" keys with integer values
            def find_ids(obj):
                if isinstance(obj, dict):
                    for k, v in obj.items():
                        if k == "id" and isinstance(v, int):
                            ids.add(v)
                        else:
                            find_ids(v)
                elif isinstance(obj, list):
                    for item in obj:
                        find_ids(item)
            
            find_ids(data)
        except json.JSONDecodeError:
            print(f"Error: Invalid JSON in file: {file_path}")

    return ids

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    app_ids_file = os.path.join(base_dir, "app_ids.txt")
    featured_app_file = os.path.join(base_dir, "featured-app.json")
    featured_cat_file = os.path.join(base_dir, "featured-categorie.json")

    # 1. Read existing IDs from app_ids.txt to avoid duplicates
    existing_ids = set()
    if os.path.exists(app_ids_file):
        with open(app_ids_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        existing_ids.add(int(line))
                    except ValueError:
                        pass # Ignore non-integer lines if any

    # 2. Extract IDs from the JSON files
    new_ids = set()
    new_ids.update(extract_ids_from_json(featured_app_file))
    new_ids.update(extract_ids_from_json(featured_cat_file))

    # 3. Filter out IDs that already exist
    ids_to_add = new_ids - existing_ids

    # 4. Append new IDs to app_ids.txt
    if ids_to_add:
        # Open in append mode ('a') so we don't overwrite existing content
        with open(app_ids_file, 'a', encoding='utf-8') as f:
            for new_id in sorted(ids_to_add):
                f.write(f"{new_id}\n")
        print(f"Successfully added {len(ids_to_add)} new IDs to app_ids.txt")
    else:
        print("No new IDs found to add. app_ids.txt is up to date.")

if __name__ == "__main__":
    main()
