import urllib.request
import xml.etree.ElementTree as ET
import ssl

ssl._create_default_https_context = ssl._create_unverified_context
url = 'http://export.arxiv.org/api/query?search_query=all:pothole&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending'
try:
    response = urllib.request.urlopen(url).read()
    root = ET.fromstring(response)
    entries = root.findall('{http://www.w3.org/2005/Atom}entry')
    if not entries:
        print("No results found for accelerometer. Trying general pothole detection...")
        url2 = 'http://export.arxiv.org/api/query?search_query=all:pothole+AND+all:detection&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending'
        response = urllib.request.urlopen(url2).read()
        root = ET.fromstring(response)
        entries = root.findall('{http://www.w3.org/2005/Atom}entry')
        
    for e in entries:
        title = e.find('{http://www.w3.org/2005/Atom}title').text
        summary = e.find('{http://www.w3.org/2005/Atom}summary').text
        published = e.find('{http://www.w3.org/2005/Atom}published').text
        print(f"[{published[:10]}] Title: {title.strip()}\nSummary: {summary.strip()}\n---\n")
except Exception as e:
    print("Error:", e)
