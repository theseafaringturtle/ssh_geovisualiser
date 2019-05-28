import requests
import json
import math
from data import ip_lock


def fetch_loc_data(ip_set):
    api_url = 'http://ip-api.com/batch?fields=query,city,country,lat,lon'
    ip_lock.acquire()
    json_arr = json.dumps([{"query": ip, "fields": "query,city,country,lon,lat,proxy"} for ip in ip_set])
    ip_set.clear()
    ip_lock.release()
    # print(json_arr)
    try:
        res = requests.post(api_url, timeout=7, data=json_arr)
    except Exception as ex:
        print(ex)
    print(res.status_code)
    return res


def store_loc_data(res, location_data):
    json_res_arr = res.json()
    for obj in json_res_arr:
        print(obj)
        ip = obj["query"]
        norm_cart = getNormCartesianForSpherical(float(obj["lon"]), float(obj["lat"]))
        loc_info = (obj["city"], obj["country"], obj["proxy"], norm_cart)
        location_data[ip] = loc_info


'''Get normalised coordinates - later multiply values by radius'''
def getNormCartesianForSpherical(lon, lat):
    lon = lon * math.pi / 180
    lat = lat * math.pi / 180
    f = 0
    ls = math.atan((1 - f) ** 2 * math.tan(lat))
    x = math.cos(ls) * math.cos(lon)
    y = math.cos(ls) * math.sin(lon)
    z = math.sin(ls)
    return (x,y,z)

