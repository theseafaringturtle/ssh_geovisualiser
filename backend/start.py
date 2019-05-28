
from threading import Thread
from reader import get_session_data, get_location_data, stop_threads
from server import run_server

fetcher_thread = Thread(target=get_location_data)
reader_thread = Thread(target=get_session_data)

fetcher_thread.start()
reader_thread.start()
run_server()

stop_threads()
fetcher_thread.join()
reader_thread.join()