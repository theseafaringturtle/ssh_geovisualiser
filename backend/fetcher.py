import requests
import json
from time import sleep
from shared import ip_query_dict, location_dict


def fetchLocData():
    api_url = 'http://ip-api.com/batch?fields=query,city,country,lat,lon'
    json_arr = json.dumps([{"query": ip} for ip in ip_query_dict])
    print(json_arr)
    try:
        res = requests.post(api_url, timeout=7, data=json_arr)
    except Exception as ex:
        print(ex)
    print(res.status_code)
    if res.status_code == requests.codes.ok:
        json_res_arr = res.json()
        for obj in json_res_arr:
            print(obj)
            ip = obj["query"]
            num_conn = ip_query_dict.pop(ip)
            loc_info = [num_conn, obj["city"], obj["country"], obj["lon"], obj["lat"]]
            location_dict[ip] = loc_info

def getIPs():
    while True:
        sleep(1)
        if len(ip_query_dict) > 0:
            fetchLocData()


