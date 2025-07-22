"""
@name: update_global_extractor.py
@description: A script to update global extractor files in a project.
@version: 1.0.0
@author: JMcrafter26
@license: MIT License
"""

import os
import requests
import re
import random

updaterVersion = "1.0.1"
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
    versionUrl = "https://raw.githack.com/JMcrafter26/sora-global-extractor/main/global-extractor/VERSION.json" + "?r=" + str(random.randint(100000, 999999))
    response = requests.get(versionUrl)
    if response.status_code == 200:
        data = response.json()
        return data
    return None

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
                        print(f"   ❗ {Colors.YELLOW}This file is outdated and should be replaced with the new global extractor.{Colors.END}")
                        print()  # Add blank line for separation


    print(f"\n{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.CYAN}📊 SCAN RESULTS{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"📁 JavaScript files scanned: {Colors.BLUE}{fileCount}{Colors.END}")
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
        print(f"\n{Colors.YELLOW}📝 FILES REQUIRING UPDATES:{Colors.END}")
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
    
    extractorUrl = "https://raw.githubusercontent.com/JMcrafter26/sora-global-extractor/refs/heads/main/global_extractor.js"
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
    
    print(f"\n{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.CYAN}🔄 UPDATING EXTRACTOR FILES{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"🎯 Target Version: {Colors.GREEN}{latestVersionNumber}{Colors.END}")
    print(f"📂 Files to update: {Colors.YELLOW}{len(files)}{Colors.END}\n")
    
    # check if global_extractor_update.js exists
    if not os.path.exists("global_extractor_update.js"):
        print(f"❌ {Colors.RED}global_extractor_update.js not found. Please download it first.{Colors.END}")
        return False
    if not files:
        print(f"❌ {Colors.RED}No files to update.{Colors.END}")
        return False
    
    for i, file in enumerate(files, 1):
        print(f"🔄 [{i}/{len(files)}] Updating: {Colors.BLUE}{file}{Colors.END}")
        
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
            
        except Exception as e:
            print(f"   ❌ {Colors.RED}Error updating file: {str(e)}{Colors.END}")
            errorFiles.append(file)

    # remove the global_extractor_update.js file
    remove_global_extractor()
    
    print(f"\n{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.CYAN}📊 UPDATE RESULTS{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"✅ Successfully updated: {Colors.GREEN}{len(files) - len(errorFiles)}{Colors.END}")
    print(f"❌ Failed to update: {Colors.RED}{len(errorFiles)}{Colors.END}")
    
    if errorFiles:
        print(f"\n{Colors.RED}❌ FILES WITH ERRORS:{Colors.END}")
        for i, errorFile in enumerate(errorFiles, 1):
            print(f"   {i}. {Colors.RED}{errorFile}{Colors.END}")
        print(f"{Colors.CYAN}{'='*60}{Colors.END}\n")
        return False
    
    print(f"\n🎉 {Colors.GREEN}All extractor files updated to version {latestVersionNumber} successfully!{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}\n")
    return True

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
    if latestUpdaterVersion != updaterVersion:
        print(f"❗ {Colors.YELLOW}Warning: You are using an outdated updater version!{Colors.END}")
        print(f"   Current Version: {Colors.YELLOW}{updaterVersion}{Colors.END}")
        print(f"   Latest Version:  {Colors.GREEN}{latestUpdaterVersion}{Colors.END}")
        print(f"   Please update the updater script to the latest version.")
        exit(1)
    latestVersionNumber = latestVersionNumber["extractor"]
    print(f"✅ Latest Version: {Colors.GREEN}{latestVersionNumber}{Colors.END}")
    
    awaitingUpdateFiles = search_for_extractor()
    if not awaitingUpdateFiles:
        print(f"✅ {Colors.GREEN}No extractor files found that need updates. You're all set!{Colors.END}")
        exit(0)
    
    print(f"\n{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.YELLOW}⚠️  READY TO UPDATE {len(awaitingUpdateFiles)} FILE(S){Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    input(f"🔄 {Colors.CYAN}Press Enter to continue with the update...{Colors.END}")
    
    if not get_global_extractor_github():
        print(f"❌ {Colors.RED}Update process failed during download.{Colors.END}")
        exit(1)
    
    if not updateExtractorFiles(awaitingUpdateFiles):
        print(f"❌ {Colors.RED}Update process completed with errors.{Colors.END}")
        exit(1)
        
    print(f"🎉 {Colors.GREEN}Global extractor update completed successfully!{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")
    exit(0)