from time import sleep
import sys
from fetcher import fetch_loc_data, store_loc_data, get_server_location
from data import data, locks
import os
from ipaddress import ip_address
import signal

is_running = True

def stop_threads():
    # global is_running
    # is_running = False
    # needed to terminate stdin.readline(), otherwise user would have to enter a newline
    pid = os.getpid()
    os.kill(pid, signal.SIGTERM)


'''Start with a sync call to fetch the server IP which doubles as an API check,
then fetch any authenticated connection IPs as they come in'''
def get_location_data():
    # global is_running
    # print("Starting fetch thread...")
    data.server_location = get_server_location()
    if data.server_location is None:
        print("Something went wrong with the GeoLocation API")
        stop_threads()
        return
    while is_running:
        sleep(1)
        if len(data.ip_set) == 0:
            continue
        res = fetch_loc_data(data.ip_set)
        if res.status_code == 200:
            store_loc_data(res, data.location_data)
        else:
            print("ERROR: "+str(res.status_code))
            print(res.text)
    # print("Stopping fetch thread...")

def get_session_data():
    # global is_running
    # print("Starting reader thread...")
    while is_running:
        line = sys.stdin.readline()[:-1]
        # if line.startswith("exit"):
        #     print("Exiting")
        #     is_running = False
        #     continue
        if line.startswith("NEW_SESSION"):
            locks.sessions_lock.acquire()
            new_s = line.split("\t")[1:]
            for s in new_s:
                pid, user, term, ip = s.split()
                if ip not in data.sessions:
                    data.sessions[ip] = {(pid, user, term)}
                else:
                    data.sessions[ip].add((pid, user, term))
            locks.sessions_lock.release()
        elif line.startswith("REMOVED_SESSION"):
            locks.sessions_lock.acquire()
            rem_s = line.split("\t")[1:]
            for s in rem_s:
                pid, user, term, ip = s.split()
                data.sessions[ip].remove((pid, user, term))
                if len(data.sessions[ip]) == 0:
                    data.sessions.pop(ip)
            locks.sessions_lock.release()
        elif line.startswith("NEW_IPS"):
            locks.ip_lock.acquire()
            new_ips = line.split("\t")[1:]
            for ip in new_ips:
                if ip_address(ip).is_private:
                    data.location_data[ip] = data.server_location
                data.ip_set.add(ip)
            locks.ip_lock.release()
        elif line.startswith("REMOVED_IPS"):
            locks.ip_lock.acquire()
            rem_ips = line.split("\t")[1:]
            for ip in rem_ips:
                if ip in data.ip_set:
                    data.ip_set.remove(ip)
            locks.ip_lock.release()
    # print("Stopping reader thread...")

