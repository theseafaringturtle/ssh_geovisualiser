import time
import sys
from reader import get_ssh_changes

active_sessions = set()
active_ips = set()
location_data = {}  # ip, (city, country, proxy, cartesian[])
is_running = True


def stop_running():
    global is_running
    is_running = False
    print("Stopping data thread")


def update_data():
    global is_running, active_sessions, active_ips
    while is_running:
        time.sleep(1)
        active_sessions, active_ips, delta = get_ssh_changes(active_sessions, active_ips)
        send_data(delta)


def send_data(delta):
    new_sessions, removed_sessions, new_ips, removed_ips = delta
    if len(new_sessions) > 0:
        out = "NEW_SESSIONS\t" + "\t".join(" ".join(se) for se in new_sessions)
        sys.stdout.write(out+"\n")
    if len(removed_sessions) > 0:
        out = "REMOVED_SESSIONS\t" + "\t".join(" ".join(se) for se in removed_sessions)
        sys.stdout.write(out + "\n")
    if len(new_ips) > 0:
        out = "NEW_IPS\t" + "\t".join(se for se in new_ips)
        sys.stdout.write(out + "\n")
    if len(removed_ips) > 0:
        out = "REMOVED_IPS\t" + "\t".join(se for se in removed_ips)
        sys.stdout.write(out + "\n")
    sys.stdout.flush()


try:
    update_data()
except KeyboardInterrupt as e:
    sys.exit()
