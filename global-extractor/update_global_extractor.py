import os
import requests
import re

updaterVersion = "1.0.0"
latestVersionNumber = None
awaitingUpdateFiles = []
class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'  # Reset to default

def get_latest_version_number():
    versionUrl = "https://raw.githubusercontent.com/JMcrafter26/sora-global-extractor/refs/heads/main/global-extractor/VERSION"
    response = requests.get(versionUrl)
    if response.status_code == 200:
        return response.text.strip()
    return None

def search_for_extractor():
    global latestVersionNumber

    # search in the current directory
    currentDir = os.getcwd()
    extractorFiles = []
    awaitingUpdateFiles = []
    for root, dirs, files in os.walk(currentDir):
        for filename in files:
            # if fileextension is .js
            if filename.endswith(".js"):
                with open(os.path.join(root, filename), 'r') as file:
                    content = file.read()
                    # check if "/* {GE START} */" and "/* {GE END} */" are in the file
                    if "/* {GE START} */" in content and "/* {GE END} */" in content:
                        print(f"Found global extractor in: {Colors.GREEN}{os.path.join(root, filename)}{Colors.END}")
                        extractorFiles.append(os.path.join(root, filename))
                        # check the version of the extractor "/* {VERSION: 1.1.0} */" using regex
                        versionMatch = re.search(r"/\* {VERSION: ([\d\.]+)} \*/", content)
                        if versionMatch:
                            version = versionMatch.group(1)
                            print(f"Version found: {Colors.YELLOW}{version}{Colors.END}")
                            if version != latestVersionNumber:
                                print(f"Version is outdated.{Colors.YELLOW} Update needed.{Colors.END}")
                                awaitingUpdateFiles.append(os.path.join(root, filename))
                            else:
                                print(f"Version matches the latest version.{Colors.GREEN} No update needed.{Colors.END}")
                        else:
                            print(f"{Colors.RED}Version not found in {os.path.join(root, filename)}{Colors.END}")
                            awaitingUpdateFiles.append(os.path.join(root, filename))
    if not extractorFiles:
        print(f"{Colors.RED}No global extractor found in the current directory.{Colors.END}")
    else:
        print(f"Found {Colors.GREEN}{len(extractorFiles)}{Colors.END} global extractor files, with {Colors.YELLOW}{len(awaitingUpdateFiles)}{Colors.END} needing updates")
        if awaitingUpdateFiles:
            print(f"{Colors.YELLOW}The following files need to be updated:{Colors.END}")
            for file in awaitingUpdateFiles:
                print(f"- {file}")
        return awaitingUpdateFiles
    return []

def get_global_extractor_github():
    global latestVersionNumber
    remove_global_extractor()
    print(f"Downloading global extractor from GitHub...")
    extractorUrl = "https://raw.githubusercontent.com/JMcrafter26/sora-global-extractor/refs/heads/main/global_extractor.js"
    response = requests.get(extractorUrl)
    if response.status_code == 200:
        print(f"Global extractor downloaded {Colors.GREEN}successfully!{Colors.END}")
        with open("global_extractor_update.js", 'w') as file:
            file.write(response.text)
        if not prepare_global_extractor():
            print(f"{Colors.RED}Failed to prepare the global extractor.{Colors.END}")
            return None
        print(f"Global extractor prepared {Colors.GREEN}successfully!{Colors.END}")
        return "global_extractor_update.js"
    else:
        print(f"{Colors.RED}Failed to download the global extractor.{Colors.END}")
        return None

def prepare_global_extractor():
    global latestVersionNumber
    print(f"Preparing global extractor...")
    with open("global_extractor_update.js", 'r') as file:
        content = file.read()
    # Check if the file contains the correct version comment
    if not "/* {GE START} */" in content or not "/* {GE END} */" in content:
        print(f"{Colors.RED}The global extractor file is not valid.{Colors.END}")
        return False
    
    # get version from the file
    versionMatch = re.search(r"/\* {VERSION: ([\d\.]+)} \*/", content)
    if versionMatch:
        version = versionMatch.group(1)
        if version != latestVersionNumber:
            print(f"{Colors.YELLOW}The global extractor version {version} does not match the latest version {latestVersionNumber}.{Colors.END}")
            return False
    else:
        print(f"{Colors.RED}Version not found in the global extractor file.{Colors.END}")
        return False
    
    # If everything is fine, we can prepare the extractor
    # remove the code not needed for update (beween /* {GE TEMPLATE FUNCTION START} */ and /* {GE TEMPLATE FUNCTION END} */)
    start = content.find("/* {GE TEMPLATE FUNCTION START} */")
    end = content.find("/* {GE TEMPLATE FUNCTION END} */")
    if start != -1 and end != -1:
        content = content[:start] + content[end + len("/* {GE TEMPLATE FUNCTION END} */"):]
    else:
        print(f"{Colors.RED}Template function markers not found in the global extractor file.{Colors.END}")
        return False
    # remove /* {GE START} */ and /* {GE END} */
    content = content.replace("/* {GE START} */", "").replace("/* {GE END} */", "")

    # remove all \n\n\n
    content = content.replace("\n\n\n", "\n")

    # write the content back to the file
    with open("global_extractor_update.js", 'w') as file:
        file.write(content)
    return True

def updateExtractorFiles(files):
    global latestVersionNumber
    errorFiles = []
    print(f"Updating extractor files to version {Colors.GREEN}{latestVersionNumber}{Colors.END}...")
    # check if global_extractor_update.js exists
    if not os.path.exists("global_extractor_update.js"):
        print(f"{Colors.RED}global_extractor_update.js not found. Please download it first.{Colors.END}")
        return False
    if not files:
        print(f"{Colors.RED}No files to update.{Colors.END}")
        return False
    
    for file in files:
        print(f"Updating {Colors.GREEN}{file}{Colors.END}...")
        with open(file, 'r') as f:
            content = f.read()
        
        # get /* {GE START} */ and /* {GE END} */ content
        start = content.find("/* {GE START} */")
        end = content.find("/* {GE END} */")
        if start == -1 or end == -1:
            print(f"{Colors.RED}Invalid extractor file: {file}. Missing /* {{GE START}} */ or /* {{GE END}} */.{Colors.END}")
            errorFiles.append(file)
            continue
        # replace the content between /* {GE START} */ and /* {GE END} */ with the new global extractor
        with open("global_extractor_update.js", 'r') as extractorFile:
            extractorContent = extractorFile.read()
        newContent = content[:start + len("/* {GE START} */")] + extractorContent + content[end:]
        with open(file, 'w') as f:
            f.write(newContent)
        print(f"Updated {Colors.GREEN}{file}{Colors.END}")

    # remove the global_extractor_update.js file
    remove_global_extractor()
    if errorFiles:
        print(f"{Colors.RED}Some files could not be updated due to errors:{Colors.END}")
        for errorFile in errorFiles:
            print(f"- {errorFile}")
        return False
    print(f"All extractor files updated to version {Colors.GREEN}{latestVersionNumber}{Colors.END} successfully!")
    return True

def remove_global_extractor():
    print(f"Removing global extractor...")
    if os.path.exists("global_extractor_update.js"):
        os.remove("global_extractor_update.js")
        print(f"{Colors.GREEN}Global extractor update file removed successfully!{Colors.END}")

if __name__ == "__main__":
    latestVersionNumber = get_latest_version_number()
    if latestVersionNumber is None:
        print(f"{Colors.RED}Failed to retrieve the latest version number.{Colors.END}")
        exit(1)
    print(f"Got latest version number: {Colors.GREEN}{latestVersionNumber}{Colors.END}")
    
    awaitingUpdateFiles = search_for_extractor()
    if not awaitingUpdateFiles:
        print(f"{Colors.RED}No extractor files found that need updates.{Colors.END}")
        exit(0)
    
    input(f"\n\n{Colors.CYAN}Press Enter to continue...{Colors.END}")
    if not get_global_extractor_github():
        exit(1)
    
    if not updateExtractorFiles(awaitingUpdateFiles):
        print(f"{Colors.RED}Failed to update some extractor files.{Colors.END}")
        exit(1)
    print(f"{Colors.GREEN}Global extractor update completed successfully!{Colors.END}")
    exit(0)