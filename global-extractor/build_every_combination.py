import build
import itertools
import os
import shutil
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor, as_completed  # Add this import



def build_combination(selected_functions):
    build.build(allowed_functions=selected_functions)
    output_dir = "global-extractor/generated"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    output_file = os.path.join(output_dir, f"{'_'.join(selected_functions)}.js")
    shutil.copyfile("global-extractor/output/global_extractor.js", output_file)
    return selected_functions

def guide():
    print("This script builds the global extractor with every combination of extractors.")
    functions = build.get_functions()

    # Generate all non-empty subsets of functions
    all_combinations = []
    for r in range(1, len(functions) + 1):
        for subset in itertools.combinations(functions, r):
            all_combinations.append(list(subset))
    
    # remove duplicates, that are the same but in a different order
    all_combinations = [list(x) for x in set(tuple(x) for x in all_combinations)]
    # Sort the combinations to ensure consistent order
    all_combinations.sort(key=lambda x: (len(x), x))

    for i, subset in enumerate(all_combinations):
        print(f"Combination {i + 1}: {subset}")

    print(f"\nTotal combinations: {len(all_combinations)}")

    # Use ThreadPoolExecutor for multithreading
    with ThreadPoolExecutor(max_workers=os.cpu_count() or 4) as executor:
        futures = {executor.submit(build_combination, selected_functions): selected_functions for selected_functions in all_combinations}
        for _ in tqdm(as_completed(futures), total=len(futures), desc="Building combinations", unit="comb"):
            pass  # Progress bar only

if __name__ == "__main__":
    print("Don't use this. It doesn't work.")
    input("Press Enter if you can't resist.")
    guide()