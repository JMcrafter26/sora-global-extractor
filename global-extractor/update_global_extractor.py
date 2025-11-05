"""
@name: update_global_extractor.py
@description: A script to update global extractor files in a project.
@version: 1.1.0
@author: JMcrafter26
@license: MIT License
"""

import os
import requests
import re
import random
import json

updaterVersion = "1.1.0"
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
    versionUrl = "https://raw.github.com/JMcrafter26/sora-global-extractor/main/global-extractor/VERSION.json" + "?r=" + str(random.randint(100000, 999999))
    response = requests.get(versionUrl)
    if response.status_code == 200:
        data = response.json()
        return data
    return None

def parse_version(version_str):
    """Parse version string and extract numeric version parts."""
    # Match common version patterns: 1.0.0, 1.0, 1, 1.0.0.0, etc.
    match = re.search(r'(\d+(\.\d+)*)', str(version_str))
    if match:
        return match.group(1)
    return None

def compare_versions(version1, version2):
    """Compare two version strings. Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2"""
    v1_parts = [int(x) for x in str(version1).split('.')]
    v2_parts = [int(x) for x in str(version2).split('.')]
    
    # Pad shorter version with zeros
    max_len = max(len(v1_parts), len(v2_parts))
    v1_parts.extend([0] * (max_len - len(v1_parts)))
    v2_parts.extend([0] * (max_len - len(v2_parts)))
    
    for i in range(max_len):
        if v1_parts[i] < v2_parts[i]:
            return -1
        elif v1_parts[i] > v2_parts[i]:
            return 1
    return 0

def increment_version(version_str):
    """Increment the patch version number."""
    original = str(version_str)
    version_part = parse_version(original)
    
    if not version_part:
        return None, "No valid version number found"
    
    # Split version into parts
    parts = version_part.split('.')
    
    # Increment the last part (patch version)
    try:
        parts[-1] = str(int(parts[-1]) + 1)
    except ValueError:
        return None, "Invalid version format"
    
    new_version = '.'.join(parts)
    
    # If original had text, preserve it by replacing the numeric part
    if version_part != original:
        new_full_version = original.replace(version_part, new_version)
        return new_full_version, None
    
    return new_version, None

def find_json_for_script(script_path):
    """Find the corresponding JSON file for a specific script file."""
    script_filename = os.path.basename(script_path)
    script_dir = os.path.dirname(script_path)
    
    # Search order: same dir -> parent dir -> 2 levels up max
    search_dirs = [
        script_dir,
        os.path.dirname(script_dir),
        os.path.dirname(os.path.dirname(script_dir))
    ]
    
    # Remove duplicates and ensure we don't go outside project
    project_root = os.getcwd()
    search_dirs = [d for d in search_dirs if d.startswith(project_root)]
    search_dirs = list(dict.fromkeys(search_dirs))  # Remove duplicates, preserve order
    
    for search_dir in search_dirs:
        # First, check the immediate directory for JSON files
        try:
            files = os.listdir(search_dir)
            for filename in files:
                if filename.endswith('.json'):
                    # if filename ends with .dev.json, .test.json, .tmp.json or .temp.json, skip it
                    if re.search(r'\.(dev|test|tmp|temp)\.json$', filename):
                        continue 
                    filepath = os.path.join(search_dir, filename)
                    try:
                        with open(filepath, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                        
                        # Check if it has scriptUrl key and references this script
                        if 'scriptUrl' in data:
                            script_url = data['scriptUrl']
                            if script_filename in script_url:
                                return filepath
                    except (json.JSONDecodeError, IOError, PermissionError):
                        continue
        except (PermissionError, FileNotFoundError):
            continue
    
    return None

def find_json_files_with_scripts(awaiting_files):
    """Find JSON files that reference scripts needing updates - optimized version."""
    print(f"   🔍 Searching for JSON files near each script...")
    
    json_to_scripts = {}  # Use dict to track: {json_path: [script_paths]}
    scripts_without_json = []
    
    for script_path in awaiting_files:
        script_filename = os.path.basename(script_path)
        print(f"   📄 Checking: {Colors.BLUE}{script_filename}{Colors.END}")
        
        json_file = find_json_for_script(script_path)
        
        if json_file:
            if json_file not in json_to_scripts:
                json_to_scripts[json_file] = []
            json_to_scripts[json_file].append(script_path)
            print(f"      ✅ Found: {Colors.GREEN}{os.path.basename(json_file)}{Colors.END}")
        else:
            scripts_without_json.append(script_path)
            print(f"      ⚠️  {Colors.YELLOW}No JSON found{Colors.END}")
    
    if scripts_without_json:
        print(f"\n   ℹ️  {Colors.YELLOW}Scripts without matching JSON:{Colors.END}")
        for script in scripts_without_json:
            print(f"      - {Colors.YELLOW}{script}{Colors.END}")
    
    return json_to_scripts

def update_json_versions(json_files):
    """Update version numbers in JSON files."""
    print(f"\n{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.CYAN}📦 UPDATING VERSION NUMBERS IN JSON FILES{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"📂 Files to process: {Colors.YELLOW}{len(json_files)}{Colors.END}\n")
    
    updated_count = 0
    skipped_count = 0
    error_count = 0
    
    for i, filepath in enumerate(json_files, 1):
        print(f"📄 [{i}/{len(json_files)}] Processing: {Colors.BLUE}{os.path.basename(filepath)}{Colors.END}")
        print(f"   Path: {Colors.CYAN}{filepath}{Colors.END}")
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if 'version' not in data:
                print(f"   ⚠️  {Colors.YELLOW}No version field found, skipping{Colors.END}")
                skipped_count += 1
                continue
            
            old_version = data['version']
            print(f"   📋 Current Version: {Colors.YELLOW}{old_version}{Colors.END}")
            
            new_version, error = increment_version(old_version)
            
            if error:
                print(f"   ⚠️  {Colors.YELLOW}Warning: {error}{Colors.END}")
                print(f"   ℹ Current version: '{old_version}'")
                response = input(f"   {Colors.CYAN}Replace with '1.0.0'? (y/n): {Colors.END}").strip().lower()
                
                if response == 'y' or response == 'yes':
                    new_version = '1.0.0'
                else:
                    print(f"   ⏭️  Skipped")
                    skipped_count += 1
                    continue
            
            data['version'] = new_version
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print(f"   ✅ {Colors.GREEN}Updated to: {new_version}{Colors.END}\n")
            updated_count += 1
            
        except Exception as e:
            print(f"   ❌ {Colors.RED}Error: {str(e)}{Colors.END}\n")
            error_count += 1
    
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.CYAN}📊 VERSION UPDATE RESULTS{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"✅ Successfully updated: {Colors.GREEN}{updated_count}{Colors.END}")
    print(f"⏭️  Skipped: {Colors.YELLOW}{skipped_count}{Colors.END}")
    print(f"❌ Errors: {Colors.RED}{error_count}{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}\n")
    
    return updated_count > 0


def search_for_extractor():
    global latestVersionNumber
    remove_global_extractor()

    print(f"\n{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.CYAN}🔍 SEARCHING FOR GLOBAL EXTRACTOR FILES{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    
    # search in the current directory
    currentDir = os.getcwd()
    print(f"📁 Scanning directory: {Colors.BLUE}{currentDir}{Colors.END}\n")
    
    extractorFiles = []
    awaitingUpdateFiles = []
    legacyFiles = []
    fileCount = 0
    
    for root, dirs, files in os.walk(currentDir):
        for filename in files:            # if fileextension is .js
            if filename.endswith(".js"):
                fileCount += 1
                with open(os.path.join(root, filename), 'r', encoding='utf-8') as file:
                    content = file.read()
                    # check if "/* {GE START} */" and "/* {GE END} */" are in the file
                    if "/* {GE START} */" in content and "/* {GE END} */" in content:
                        filePath = os.path.join(root, filename)
                        print(f"✅ {Colors.GREEN}Found global extractor:{Colors.END}")
                        print(f"   📄 {Colors.BOLD}{filePath}{Colors.END}")
                        extractorFiles.append(filePath)
                        
                        # check the version of the extractor "/* {VERSION: 1.1.0} */" using regex
                        versionMatch = re.search(r"/\* {VERSION: ([\d\.]+)} \*/", content)
                        if versionMatch:
                            version = versionMatch.group(1)
                            print(f"   📋 Current Version: {Colors.YELLOW}{version}{Colors.END}")
                            print(f"   📋 Latest Version:  {Colors.GREEN}{latestVersionNumber}{Colors.END}")
                            
                            if version != latestVersionNumber:
                                print(f"   ⚠️  {Colors.YELLOW}UPDATE NEEDED{Colors.END}")
                                awaitingUpdateFiles.append(filePath)
                            else:
                                print(f"   ✅ {Colors.GREEN}UP TO DATE{Colors.END}")
                        else:
                            print(f"   ❌ {Colors.RED}VERSION NOT FOUND - UPDATE NEEDED{Colors.END}")
                            awaitingUpdateFiles.append(filePath)
                        print()  # Add blank line for separation
                    # elif contains @name global_extractor.js - legacy extractor
                    elif "@name global_extractor.js" in content or "function multiExtractor(providers)" in content:
                        filePath = os.path.join(root, filename)
                        legacyFiles.append(filePath)
                        print(f"⚠️  {Colors.YELLOW}Legacy extractor found. Please update manually:{Colors.END}")
                        print(f"   📄 {Colors.BOLD}{filePath}{Colors.END}")
                        print(f"   ⚠ {Colors.YELLOW}This file is outdated and should be replaced with the new global extractor.{Colors.END}")
                        print()  # Add blank line for separation


    print(f"\n{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.CYAN}📊 SCAN RESULTS{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"🔍 JavaScript files scanned: {Colors.BLUE}{fileCount}{Colors.END}")
    print(f"✅ Global extractor files found: {Colors.GREEN}{len(extractorFiles)}{Colors.END}")
    print(f"⚠️  Files needing updates: {Colors.YELLOW}{len(awaitingUpdateFiles)}{Colors.END}")
    if legacyFiles:
        print(f"⚠️  Legacy extractor files found: {Colors.YELLOW}{len(legacyFiles)}{Colors.END}")
        print(f"   Please update these files manually to the new global extractor format.")
        for i, file in enumerate(legacyFiles, 1):
            print(f"   {i}. {Colors.YELLOW}{file}{Colors.END}")
    
    if not extractorFiles:
        print(f"\n❌ {Colors.RED}No global extractor files found in the current directory.{Colors.END}")
    elif awaitingUpdateFiles:
        print(f"\n{Colors.YELLOW}📋 FILES REQUIRING UPDATES:{Colors.END}")
        for i, file in enumerate(awaitingUpdateFiles, 1):
            print(f"   {i}. {Colors.YELLOW}{file}{Colors.END}")
    else:
        print(f"\n🎉 {Colors.GREEN}All global extractor files are up to date!{Colors.END}")
    
    print(f"{Colors.CYAN}{'='*60}{Colors.END}\n")
    return awaitingUpdateFiles

def get_global_extractor_github():
    global latestVersionNumber
    remove_global_extractor()
    
    print(f"\n{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.CYAN}📥 DOWNLOADING GLOBAL EXTRACTOR{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"🌐 Downloading from GitHub...")
    
    extractorUrl = "https://raw.github.com/JMcrafter26/sora-global-extractor/refs/heads/main/global_extractor.js" + "?r=" + str(random.randint(100000, 999999))
    response = requests.get(extractorUrl)
    if response.status_code == 200:
        print(f"✅ {Colors.GREEN}Download completed successfully!{Colors.END}")
        with open("global_extractor_update.js", 'w', encoding='utf-8') as file:
            file.write(response.text)
        
        print(f"🔧 Preparing global extractor...")
        if not prepare_global_extractor():
            print(f"❌ {Colors.RED}Failed to prepare the global extractor.{Colors.END}")
            return None
        print(f"✅ {Colors.GREEN}Global extractor prepared successfully!{Colors.END}")
        print(f"{Colors.CYAN}{'='*60}{Colors.END}\n")
        return "global_extractor_update.js"
    else:
        print(f"❌ {Colors.RED}Failed to download the global extractor. Status code: {response.status_code}{Colors.END}")
        print(f"{Colors.CYAN}{'='*60}{Colors.END}\n")
        return None

def prepare_global_extractor():
    global latestVersionNumber
    print(f"   🔍 Validating downloaded file...")
    
    with open("global_extractor_update.js", 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Check if the file contains the correct version comment
    if not "/* {GE START} */" in content or not "/* {GE END} */" in content:
        print(f"   ❌ {Colors.RED}Invalid global extractor file - missing markers.{Colors.END}")
        return False
    
    # get version from the file
    versionMatch = re.search(r"/\* {VERSION: ([\d\.]+)} \*/", content)
    if versionMatch:
        version = versionMatch.group(1)
        print(f"   📋 File Version: {Colors.YELLOW}{version}{Colors.END}")
        if version != latestVersionNumber:
            print(f"   ❌ {Colors.YELLOW}Version mismatch! Expected {latestVersionNumber}, got {version}{Colors.END}")
            return False
        print(f"   ✅ {Colors.GREEN}Version validated{Colors.END}")
    else:
        print(f"   ❌ {Colors.RED}Version not found in the global extractor file.{Colors.END}")
        return False
    
    print(f"   🧹 Cleaning up template code...")
    # If everything is fine, we can prepare the extractor
    # remove the code not needed for update (beween /* {GE TEMPLATE FUNCTION START} */ and /* {GE TEMPLATE FUNCTION END} */)
    start = content.find("/* {GE TEMPLATE FUNCTION START} */")
    end = content.find("/* {GE TEMPLATE FUNCTION END} */")
    if start != -1 and end != -1:
        content = content[:start] + content[end + len("/* {GE TEMPLATE FUNCTION END} */"):]
        print(f"   ✅ Template functions removed")
    else:
        print(f"   ❌ {Colors.RED}Template function markers not found in the global extractor file.{Colors.END}")
        return False
    
    # remove everything before /* {GE START} */
    start = content.find("/* {GE START} */")
    if start != -1:
        content = content[start:]
        
    # remove /* {GE START} */ and /* {GE END} */
    content = content.replace("/* {GE START} */", "").replace("/* {GE END} */", "")
    print(f"   ✅ Markers cleaned")

    # remove all \n\n\n
    content = content.replace("\n\n\n", "\n")
    print(f"   ✅ Formatting optimized")    # write the content back to the file
    with open("global_extractor_update.js", 'w', encoding='utf-8') as file:
        file.write(content)
    return True

def updateExtractorFiles(files):
    global latestVersionNumber
    errorFiles = []
    successFiles = []
    
    print(f"\n{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.CYAN}📝 UPDATING EXTRACTOR FILES{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"🎯 Target Version: {Colors.GREEN}{latestVersionNumber}{Colors.END}")
    print(f"📂 Files to update: {Colors.YELLOW}{len(files)}{Colors.END}\n")
    
    # check if global_extractor_update.js exists
    if not os.path.exists("global_extractor_update.js"):
        print(f"❌ {Colors.RED}global_extractor_update.js not found. Please download it first.{Colors.END}")
        return False, []
    if not files:
        print(f"❌ {Colors.RED}No files to update.{Colors.END}")
        return False, []
    
    for i, file in enumerate(files, 1):
        print(f"📝 [{i}/{len(files)}] Updating: {Colors.BLUE}{file}{Colors.END}")
        
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # get /* {GE START} */ and /* {GE END} */ content
            start = content.find("/* {GE START} */")
            end = content.find("/* {GE END} */")
            if start == -1 or end == -1:
                print(f"   ❌ {Colors.RED}Invalid extractor file - missing markers{Colors.END}")
                errorFiles.append(file)
                continue
                  # replace the content between /* {GE START} */ and /* {GE END} */ with the new global extractor
            with open("global_extractor_update.js", 'r', encoding='utf-8') as extractorFile:
                extractorContent = extractorFile.read()
            newContent = content[:start + len("/* {GE START} */")] + extractorContent + content[end:]
            
            with open(file, 'w', encoding='utf-8') as f:
                f.write(newContent)
            print(f"   ✅ {Colors.GREEN}Successfully updated{Colors.END}")
            successFiles.append(file)
            
        except Exception as e:
            print(f"   ❌ {Colors.RED}Error updating file: {str(e)}{Colors.END}")
            errorFiles.append(file)

    # remove the global_extractor_update.js file
    remove_global_extractor()
    
    print(f"\n{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.CYAN}📊 UPDATE RESULTS{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"✅ Successfully updated: {Colors.GREEN}{len(successFiles)}{Colors.END}")
    print(f"❌ Failed to update: {Colors.RED}{len(errorFiles)}{Colors.END}")
    
    if errorFiles:
        print(f"\n{Colors.RED}❌ FILES WITH ERRORS:{Colors.END}")
        for i, errorFile in enumerate(errorFiles, 1):
            print(f"   {i}. {Colors.RED}{errorFile}{Colors.END}")
        print(f"{Colors.CYAN}{'='*60}{Colors.END}\n")
        return len(successFiles) > 0, successFiles
    
    print(f"\n🎉 {Colors.GREEN}All extractor files updated to version {latestVersionNumber} successfully!{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}\n")
    return True, successFiles

def remove_global_extractor():
    if os.path.exists("global_extractor_update.js"):
        os.remove("global_extractor_update.js")
        print(f"   🗑️  {Colors.GREEN}Temporary update file cleaned up{Colors.END}")

if __name__ == "__main__":
    print(f"\n{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.CYAN}🚀 SORA GLOBAL EXTRACTOR UPDATER v{updaterVersion}{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    
    print(f"🌐 Fetching latest version information...")
    latestVersionNumber = get_latest_version_number()
    if latestVersionNumber is None:
        print(f"❌ {Colors.RED}Failed to retrieve the latest version number.{Colors.END}")
        exit(1)
    latestUpdaterVersion = latestVersionNumber["updater"]
    
    # Compare versions properly using semantic versioning
    version_comparison = compare_versions(updaterVersion, latestUpdaterVersion)
    if version_comparison < 0:  # Current version is older
        print(f"⚠ {Colors.YELLOW}Warning: You are using an outdated updater version!{Colors.END}")
        print(f"   Current Version: {Colors.YELLOW}{updaterVersion}{Colors.END}")
        print(f"   Latest Version:  {Colors.GREEN}{latestUpdaterVersion}{Colors.END}")
        print(f"   Please update the updater script to the latest version.")
        print(f"   Repo: {Colors.BLUE}https://github.com/JMcrafter26/sora-global-extractor{Colors.END}")
        exit(1)
    latestVersionNumber = latestVersionNumber["extractor"]
    print(f"✅ Latest Version: {Colors.GREEN}{latestVersionNumber}{Colors.END}")
    
    awaitingUpdateFiles = search_for_extractor()
    if not awaitingUpdateFiles:
        print(f"✅ {Colors.GREEN}No extractor files found that need updates. You're all set!{Colors.END}")
        exit(0)
    
    # Ask about version increment
    print(f"\n{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.CYAN}📦 VERSION INCREMENT{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"Would you like to increment version numbers in related JSON files?")
    print(f"This will search for JSON files with 'scriptUrl' pointing to updated scripts.")
    version_response = input(f"{Colors.CYAN}Increment versions? (Y/n): {Colors.END}").strip().lower()

    should_increment_versions = not (version_response == 'n' or version_response == 'no')
    json_to_scripts = {}
    
    if should_increment_versions:
        print(f"\n🔍 Searching for JSON files...")
        json_to_scripts = find_json_files_with_scripts(awaitingUpdateFiles)
        
        if json_to_scripts:
            print(f"\n✅ Found {Colors.GREEN}{len(json_to_scripts)}{Colors.END} JSON file(s) to update:")
            for i, jf in enumerate(json_to_scripts.keys(), 1):
                print(f"   {i}. {Colors.BLUE}{jf}{Colors.END}")
        else:
            print(f"\nℹ️  {Colors.YELLOW}No JSON files found with scriptUrl referencing updated scripts{Colors.END}")
            should_increment_versions = False
    
    print(f"\n{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.YELLOW}⚠️  READY TO UPDATE {len(awaitingUpdateFiles)} FILE(S){Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    input(f"📝 {Colors.CYAN}Press Enter to continue with the update...{Colors.END}")
    
    if not get_global_extractor_github():
        print(f"❌ {Colors.RED}Update process failed during download.{Colors.END}")
        exit(1)
    
    success, successFiles = updateExtractorFiles(awaitingUpdateFiles)
    if not success:
        print(f"❌ {Colors.RED}Update process completed with errors.{Colors.END}")
        exit(1)
    
    # Update JSON versions if requested - only for successfully updated scripts
    if should_increment_versions and json_to_scripts:
        # Filter JSON files to only those whose scripts were successfully updated
        json_files_to_update = []
        for json_file, script_paths in json_to_scripts.items():
            # Check if all scripts for this JSON were successfully updated
            if all(script in successFiles for script in script_paths):
                json_files_to_update.append(json_file)
            else:
                print(f"⚠️  {Colors.YELLOW}Skipping JSON update for {os.path.basename(json_file)} - associated script(s) failed to update{Colors.END}")
        
        if json_files_to_update:
            update_json_versions(json_files_to_update)
        
    print(f"🎉 {Colors.GREEN}Global extractor update completed successfully!{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    exit(0)