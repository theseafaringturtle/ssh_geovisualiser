import subprocess
import re


def get_ssh_changes(prev_active_sessions, prev_active_ips):
    active_sessions = set()
    active_ips = set()
    # list sshd processes and take their ID, username and terminal
    cmd = "ps axww | grep sshd"
    out = subprocess.check_output(cmd, shell=True)
    out = str(out, "utf-8")
    lines = out.split("\n")[:-1]
    terminals = {}
    pid_list = []
    # e.g. 18666 ?        S      0:01 sshd: derp@pts/0
    ps_regex = "(\d+).*sshd.*@(pts|notty)"
    for line in lines:
        ps_match = re.search(ps_regex, line)
        if ps_match is None or len(ps_match.groups()) != 2:
            continue
        pid = str(ps_match.group(1))
        term = ps_match.group(2)
        terminals[pid] = term
        pid_list.append(pid)
    pid_string = ",".join(pid_list)
    # no connections?
    if len(pid_string) == 0:
        return set(), set(), None
    # list ssh connections and match the IPs to the processes
    cmd = "lsof -nai -p "+pid_string
    out = subprocess.check_output(cmd, shell=True)
    out = str(out, "utf-8")
    lines = out.split("\n")[:-1]
    # e.g. sshd    18666      derp    3u  IPv4 515909      0t0  TCP 33.33.33.33:ssh->66.66.66.66:55333 (ESTABLISHED)
    lsof_regex = "sshd\s* (\d+)\s+(\S+).*TCP\s.*\-\>((?:(?:\d{1,3}\.){3})\d{1,3})"
    for line in lines:
        #print(line)
        lsof_match = re.search(lsof_regex, line)
        if lsof_match is None:
            continue
        pid = str(lsof_match.group(1))
        term = terminals[pid]
        user = str(lsof_match.group(2))
        ip = lsof_match.group(3)
        proc_info = (pid, user, term, ip)  # the pid keeps them unique
        active_sessions.add(proc_info)
        active_ips.add(ip)
    # not super efficient but no premature optimization
    new_sessions = active_sessions.difference(prev_active_sessions)
    removed_sessions = prev_active_sessions.difference(active_sessions)
    new_ips = active_ips.difference(prev_active_ips)
    removed_ips = prev_active_ips.difference(active_ips)
    return active_sessions, active_ips, (new_sessions, removed_sessions, new_ips, removed_ips)
