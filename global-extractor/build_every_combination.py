import build
from InquirerPy import inquirer

def guide():
    print("This script builds the global extractor with the specified extractors.")
    functions = build.get_functions()

    # Interactive selection
    selected_functions = inquirer.checkbox(
        message="Select functions to include (use arrow keys and space to select):",
        choices=functions,
        instruction="(Press <space> to select and <enter> to confirm)",
    ).execute()

    if not selected_functions:
        print("No functions selected. Exiting.")
        exit(0)

    # clear the screen
    print("\033[H\033[J", end="")

    # ask if it should test the build and only build the working ones, yes no
    test_build = input("Do you want to test the build and only keep the working ones? (y/n): ").strip().lower() == 'y'


    build.build(allowed_functions=selected_functions)
    print("\n\nBuild completed successfully.")

    if not test_build:
        print("Skipping test.")
    else:
        print("Testing the build...")
        # test the build

        test_results = build.test()
        print("Test completed successfully.")

        allowed_functions = []

        for provider, result in test_results.items():
            if result == 'passed':
                allowed_functions.append(provider)

        print('Building global extractor with allowed functions...')
        build.build(allowed_functions=allowed_functions)
        print("\n\nBuild completed successfully.")
        print("Not working functions:")
        for provider, result in test_results.items():
            if result == 'failed':
                print(f" - {provider}")



if __name__ == "__main__":
    guide()