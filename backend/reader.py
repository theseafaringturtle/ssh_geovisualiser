import re
import sys
from shared import ip_query_dict, location_dict


waiting_sessions = {}  # user, ip[]
active_sessions = {}  # num, ip

def readFile():
    while True:  # keep reading new lines appended
        line = sys.stdin.readline()
        accept_match = re.search("Accepted password for (.+) from ((\d+\.{1,3}){3}\d{1,3})", line)
        if accept_match is not None:
            user = accept_match.group(1)
            ip = accept_match.group(2)
            # a user might have multiple connections
            if user not in waiting_sessions:
                waiting_sessions[user] = [ip]
            else:
                waiting_sessions[user].append(ip)
        session_match = re.search("New session (\d{1,}) of user (.+)\.", line)
        if session_match is not None:
            sess_num = session_match.group(1)
            user = session_match.group(2)
            ip = waiting_sessions[user].pop()
            if len(waiting_sessions[user]) == 0:
                waiting_sessions.pop(user)
            active_sessions[sess_num] = ip
            if ip not in location_dict:  # location not fetched yet for that ip
                if ip in ip_query_dict:  # increase connection count from ip
                    ip_query_dict[ip] += 1
                else:
                    ip_query_dict[ip] = 1
                #print("Increasing count of ip_query_dict to " + str(ip_query_dict[ip]))
            else:
                location_dict[ip][0] += 1  # increase connection count from ip
                #print("Increasing count of location_dict to " + str(location_dict[ip][0]))
            print(ip+" was assigned session "+sess_num)
        disco_match = re.search("Removed session (\d{1,})\.", line)
        if disco_match is not None:
            sess_num = disco_match.group(1)
            ip = active_sessions.pop(sess_num)
            print(ip+" disconnected from session "+sess_num)
            if ip in ip_query_dict:
                ip_query_dict[ip] -= 1
                #print("Decreasing count of ip_query_dict to " + str(ip_query_dict[ip]))
                if ip_query_dict[ip] == 0:  # only connection from that IP
                    ip_query_dict.pop(ip)
            if ip in location_dict:
                location_dict[ip][0] -= 1
                #print("Decreasing count of location_dict to " + str(location_dict[ip][0]))
                if location_dict[ip][0] == 0:  # only connection from that IP
                    location_dict.pop(ip)
            print("Active sessions: "+str(active_sessions))