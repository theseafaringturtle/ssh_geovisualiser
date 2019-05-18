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
    data = set(loc_data_queue)  # remove duplicates
    resp_arr = []
    for obj in data:
        query, city, country, lon, lat = obj
        lon = float(lon) * math.pi / 180
        lat = float(lat) * math.pi / 180
        f = 0
        ls = math.atan((1 - f)**2 * math.tan(lat))
        x = radius * math.cos(ls) * math.cos(lon)
        y = radius * math.cos(ls) * math.sin(lon)
        z = radius * math.sin(ls)
        resp_obj = {"country": country, "city": city, "ip": query, "cartesian": [x, y, z]}
        resp_arr.append(resp_obj)
    return web.json_response(resp_arr, headers={"Access-Control-Allow-Origin": CLIENT_URL})

app = web.Application()
app.add_routes(routes)

fetcherThread = threading.Thread(target=getIPs)
readerThread = threading.Thread(target=readFile)

fetcherThread.start()
readerThread.start()

web.run_app(app)
