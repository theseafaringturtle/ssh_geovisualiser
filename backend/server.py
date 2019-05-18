import threading
import math
import sys
from aiohttp import web
from fetcher import getIPs, loc_data_queue
from reader import readFile

CLIENT_URL=sys.argv[1]

routes = web.RouteTableDef()

@routes.get('/data')
async def getData(request):
    radius = 55.0
    if "radius" in request.rel_url.query:
        radius = float(request.rel_url.query['radius'])
    data = list(loc_data_queue)
    resp_arr = []
    for obj in data:
        lon = float(obj["lon"]) * math.pi / 180
        lat = float(obj["lat"]) * math.pi / 180
        f = 0
        ls = math.atan((1 - f)**2 * math.tan(lat))
        x = radius * math.cos(ls) * math.cos(lon)
        y = radius * math.cos(ls) * math.sin(lon)
        z = radius * math.sin(ls)
        resp_obj = {"country": obj["country"], "city": obj["city"], "ip": obj["query"], "cartesian": [x, y, z]}
        resp_arr.append(resp_obj)
    return web.json_response(resp_arr, headers={"Access-Control-Allow-Origin": CLIENT_URL})

app = web.Application()
app.add_routes(routes)

fetcherThread = threading.Thread(target=getIPs)
readerThread = threading.Thread(target=readFile)

fetcherThread.start()
readerThread.start()

web.run_app(app)
