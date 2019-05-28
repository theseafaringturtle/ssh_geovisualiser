from time import sleep
import sys
from fetcher import fetch_loc_data, store_loc_data
from data import location_data, ip_set, sessions, sessions_lock, ip_lock
import os
import signal

is_running = True

def stop_threads():
    # global is_running
    # is_running = False
    # needed to terminate stdin.readline(), otherwise user would have to enter a newline
    pid = os.getpid()
    os.kill(pid, signal.SIGTERM)

def get_location_data():
    # global is_running
    # print("Starting fetch thread...")
    while is_running:
        sleep(1)
        if len(ip_set) == 0:
            continue
        res = fetch_loc_data(ip_set)
        if res.status_code == 200:
            store_loc_data(res, location_data)
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
            sessions_lock.acquire()
            new_s = line.split("\t")[1:]
            for s in new_s:
                pid, user, term, ip = s.split()
                if ip not in sessions:
                    sessions[ip] = {(pid, user, term)}
                else:
                    sessions[ip].add((pid, user, term))
            sessions_lock.release()
        elif line.startswith("REMOVED_SESSION"):
            sessions_lock.acquire()
            rem_s = line.split("\t")[1:]
            for s in rem_s:
                pid, user, term, ip = s.split()
                sessions[ip].remove((pid, user, term))
                if len(sessions[ip]) == 0:
                    sessions.pop(ip)
            sessions_lock.release()
        elif line.startswith("NEW_IPS"):
            ip_lock.acquire()
            new_ips = line.split("\t")[1:]
            for ip in new_ips:
                ip_set.add(ip)
            ip_lock.release()
        elif line.startswith("REMOVED_IPS"):
            ip_lock.acquire()
            rem_ips = line.split("\t")[1:]
            for ip in rem_ips:
                if ip in ip_set:
                    ip_set.remove(ip)
            ip_lock.release()
    # print("Stopping reader thread...")

