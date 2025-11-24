import os
import json
import re


def get_extractor():
    # read extractors from extractors/ directory
    extractors_dir = os.path.join(os.path.dirname(__file__), "..", "extractors")
    extractor_files = [f for f in os.listdir(extractors_dir) if f.endswith(".js")]
    extractors = []
    for file in extractor_files:
        extractor_name = file[:-3]  # remove .js extension
        extractors.append(extractor_name)
    return extractors

def detect_extractor(url):
    # try to find the extractor that matches the url. e.g. https://bigwarp.pro/ie35qwsi5590 -> bigwarp.
    extractors = get_extractor()
    for extractor in extractors:
        if extractor in url:
            return extractor
    return None

if __name__ == "__main__":
    extractors = get_extractor()
    print("\nPlease enter a URL to extract:")
    url = input().strip()
    if not url:
        print("No URL provided.")
        extractor_name = None
    else:
        extractor_name = detect_extractor(url)
        if extractor_name:
            print(f"Extractor found: {extractor_name}")
        else:
            print("No extractor found for the provided URL.\n Please select from the available extractors:")
            i = 1
            for extractor in extractors:
                print(f"{i}. {extractor}")
                i += 1
            print("Enter the number of the extractor you want to use:")
            choice = input().strip()
            if choice.isdigit() and 1 <= int(choice) <= len(extractors):
                extractor_name = extractors[int(choice) - 1]
                print(f"Using extractor: {extractor_name}")
            else:
                print("Invalid choice.")
                print("No extractor will be used.")
                extractor_name = None
    
    if not extractor_name:
        print("Exiting.")
        exit(0)

    print(f"Extracting using {extractor_name}...")
