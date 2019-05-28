from threading import Lock

ip_lock = Lock()
sessions_lock = Lock()
location_lock = Lock()

ip_set = set()
sessions = {}  # ip: set(pid,user,term)[]
location_data = {}  # ip: city,country,proxy,cartesian[]
