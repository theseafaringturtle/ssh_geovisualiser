import requests
import json
import math
from data import locks


'''Fetch location data for batch of IPS, return json array'''
def fetch_loc_data(ip_set):
    api_url = 'http://ip-api.com/batch?fields=query,city,country,lat,lon'
    locks.ip_lock.acquire()
    json_arr = json.dumps([{"query": ip, "fields": "query,city,country,lon,lat,proxy"} for ip in ip_set])
    ip_set.clear()
    locks.ip_lock.release()
    # print(json_arr)
    try:
        res = requests.post(api_url, timeout=7, data=json_arr)
    except Exception as ex:
        print(ex)
    print(res.status_code)
    return res

'''Store retrieved location data of batch inside dict argument'''
def store_loc_data(res, location_data):
    json_res_arr = res.json()
    for obj in json_res_arr:
        print(obj)
        ip = obj["query"]
        norm_cart = getNormCartesianForSpherical(float(obj["lon"]), float(obj["lat"]))
        loc_info = (obj["city"], obj["country"], obj["proxy"], norm_cart)
        location_data[ip] = loc_info


'''Single-IP query for the running server's external IP'''
def get_server_location():
    api_url = "http://ip-api.com/json?fields=city,country,lon,lat,query"
    res = requests.get(api_url, timeout=5)
    if res.status_code != 200:
        print(res.text())
        return None
    loc = res.json()
    country = loc["country"]
    city = loc["city"]
    ip = loc["query"]
    norm_cart = getNormCartesianForSpherical(float(loc["lon"]), float(loc["lat"]))
    return {"ip": ip, "country": country, "city": city, "cartesian": norm_cart, "proxy": False}


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

