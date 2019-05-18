import re
import sys
from collections import deque

FILENAME=sys.argv[2]
Q_SIZE=int(sys.argv[3])

ip_queue = deque([],Q_SIZE)

def readFile():
    while True:  # keep reading new lines appended
        line = sys.stdin.readline()
        match = re.search("Failed password for invalid user .+ from .+ port", line)
        if match is None:
            continue
        netinfo_index = line.rfind("from")
        # ipv4 only for now
        ip_regex = "(\d+\.{1,3}){3}\d{1,3}"
        ip_match = re.search(ip_regex, line[netinfo_index:])
        if ip_match is None:
            continue
        ip = ip_match.group()
        ip_queue.append(ip)
        print(ip)

'''
def tryReadFile():
    try:
        readFile()
    except FileNotFoundError:
        print("Log file not found at "+FILENAME)
    except PermissionError:
        print("You don't have permission to access "+FILENAME)
'''
