import datetime

def start_log(filename):
    with open(f'./logs/{filename}.log', 'w') as file:
        curtime = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        file.write(f"Starting log at {curtime}\n")

def log_operation(filename, operation, data):
    with open(f'./logs/{filename}.log','a') as file:
        curtime = datetime.datetime.now()
        file.write(f"{operation} occured at {curtime} with {data}\n")