from threading import Lock


class Locks:
    ip_lock = Lock()
    sessions_lock = Lock()
    location_lock = Lock()


class Data:
    ip_set = set()
    sessions = {}  # ip: set(pid,user,term)[]
    location_data = {}  # ip: (city,country,proxy,cartesian[])
    # no lock, fetched at the beginning
    server_location = {}  # (country, city, cartesian[])


locks = Locks()
data = Data()
