'''
very simple logger
written by strnge
03-2025
'''



import datetime
import os

def start_log(filename):
    if(not os.path.exists('./logs/')):
        os.makedirs('./logs/')
    
    with open(f'./logs/{filename}.log', 'w') as file:
        curtime = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        file.write(f"Starting log at {curtime}\n")

def log_operation(filename, operation, data):
    with open(f'./logs/{filename}.log','a') as file:
        curtime = datetime.datetime.now()
        file.write(f"{operation} occured at {curtime} with {data}\n")