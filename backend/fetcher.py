import requests
import json
import sys
from time import sleep
from collections import deque
from reader import ip_queue

Q_SIZE=int(sys.argv[3])

loc_data_queue = deque([],Q_SIZE)

def fetchLocData(ip_list):
    api_url = 'http://ip-api.com/batch?fields=query,city,country,lat,lon'
    json_arr = json.dumps([{"query": ip} for ip in ip_list])
    print(json_arr)
    res = requests.post(api_url, timeout=7, data=json_arr)
    print(res.status_code)
    if res.status_code == requests.codes.ok:
        json_res_arr = res.json()
        for obj in json_res_arr:
            print(obj)
            # convert to tuple for set hashing
            loc_tuple = (obj["query"], obj["city"], obj["country"], obj["lon"], obj["lat"])
            loc_data_queue.append(loc_tuple)

def getIPs():
    while True:
        sleep(1)
        ip_set = set()
        # print(ip_queue.count())
        for i in range(5):
            if len(ip_queue) > 0:#check if it has items
                ip_set.add(ip_queue.pop())
        if len(ip_set) > 0:
            fetchLocData(list(ip_set))


