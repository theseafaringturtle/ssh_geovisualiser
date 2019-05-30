from ipaddress import ip_address, ip_network
from aiohttp import web
from data import data, locks
import sys

CLIENT_URL = sys.argv[1]

subnet_whitelist = [ip_network(net) for net in [
    "192.168.0.0/16"
]]
ip_whitelist = [ip_address(ip) for ip in [
    "127.0.0.1",
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

@web.middleware
async def check_host(request, handler):
    host = ip_address(request.remote)
    if not check_whitelist(host):
        return web.json_response({"error": "Your host is not whitelisted"},
                                 status=401,
                                 headers={"Access-Control-Allow-Origin": CLIENT_URL})
    else:
        return await handler(request)

@routes.get('/server')
async def get_server_location(request):
    radius = 55.0
    if "radius" in request.rel_url.query:
        radius = float(request.rel_url.query["radius"])
    norm_cart = data.server_location["cartesian"]
    cartesian = [v * radius for v in norm_cart]
    resp_obj = data.server_location.copy()
    resp_obj["cartesian"] = cartesian
    return web.json_response(resp_obj,
                             headers={"Access-Control-Allow-Origin": CLIENT_URL})

@routes.get('/data')
async def get_data(request):
    radius = 55.0
    if "radius" in request.rel_url.query:
        radius = float(request.rel_url.query["radius"])
    resp_arr = []
    locks.sessions_lock.acquire()
    locks.location_lock.acquire()
    for ip_key in data.sessions:
        ret_sessions = list(data.sessions[ip_key])
        if ip_key in data.location_data:
            city, country, proxy, norm_cartesian = data.location_data[ip_key]
            cartesian = [v * radius for v in norm_cartesian]
            resp_obj = {"country": country, "city": city, "ip": ip_key, "proxy": proxy,
                        "terminals": ret_sessions, "cartesian": cartesian}
        else:
            resp_obj = {"ip": ip_key, "terminals": ret_sessions, "country": "TBA"}
        resp_arr.append(resp_obj)
    locks.sessions_lock.release()
    locks.location_lock.release()
    headers = {"Access-Control-Allow-Origin": CLIENT_URL}
    return web.json_response(resp_arr, headers=headers)

app = web.Application(middlewares=[check_host])
app.add_routes(routes)


def run_server():
    print("CORS:" + CLIENT_URL)
    web.run_app(app)
