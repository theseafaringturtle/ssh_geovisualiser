import threading
from ipaddress import ip_address, ip_network
from aiohttp import web
from data import sessions, sessions_lock, location_data, location_lock
from reader import get_location_data, get_session_data, stop_threads
from threading import Thread
#CLIENT_URL = sys.argv[1]

subnet_whitelist = [ip_network(net) for net in [
    "192.168.0.0/16"
]]
ip_whitelist = [ip_address(ip) for ip in [
    "127.0.0.1"
]]


def check_whitelist(host):
    # alternative: return host.is_private
    for net in subnet_whitelist:
        if host in net:
            return True
    if host in ip_whitelist:
        return True
    return False

routes = web.RouteTableDef()

@routes.get('/data')
async def get_data(request):
    host = ip_address(request.remote)
    if not check_whitelist(host):
        return web.json_response("Your host is not whitelisted", status=401)
    radius = 55.0
    if "radius" in request.rel_url.query:
        radius = float(request.rel_url.query["radius"])
    resp_arr = []
    sessions_lock.acquire()
    location_lock.acquire()
    for ip_key in sessions:
        ret_sessions = list(sessions[ip_key])
        if ip_key in location_data:
            city, country, proxy, norm_cartesian = location_data[ip_key]
            cartesian = [v * radius for v in norm_cartesian]
            resp_obj = {"country": country, "city": city, "ip": ip_key, "terminals": ret_sessions, "cartesian": cartesian}
        else:
            resp_obj = {"ip": ip_key, "terminals": ret_sessions, "country": "TBA"}
        resp_arr.append(resp_obj)
    sessions_lock.release()
    location_lock.release()
    headers = {}
    #headers = {"Access-Control-Allow-Origin": CLIENT_URL}
    return web.json_response(resp_arr, headers=headers)

app = web.Application()
app.add_routes(routes)


def run_server():
    web.run_app(app)