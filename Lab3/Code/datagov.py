import requests
import mysql.connector
from time import sleep
from datetime import datetime

INTERVAL = 60 # Update every 1 minute

# == Table columns ==
# carparkId (fixed)
# carLotsAvail
# carTotalLots
# update_datetime
# address (fixed)
# lat (fixed)
# lng (fixed)

def getdata(db, cursor):
    while (True):
        print("Updating now...")
        r = requests.get("https://api.data.gov.sg/v1/transport/carpark-availability")
        main_r = r.json()['items'][0]['carpark_data'] # List of dictionaries (main_r is a list)
        for carpark in main_r: # carpark is a dictionary consisting of 'carpark_info', 'carpark_number', 'update_datetime'
            has_car_lot = 0
            total_car_lots = 0
            avail_car_lots = 0
            for info in carpark['carpark_info']:
                if info['lot_type'] == 'C':
                    has_car_lot = 1
                    total_car_lots = int(info['total_lots'])
                    avail_car_lots = int(info['lots_available'])
                    break
            carpark_number = carpark['carpark_number']
            update_datetime = carpark['update_datetime']
            # Check if value already in the database
            entry_exists = False
            cursor.execute(f"SELECT * FROM carparks WHERE carparkId=\"{carpark_number}\"")
            for x in cursor:
                if x[0] == carpark_number:
                    entry_exists = True
                    # If exists, update
                    cursor.execute(f"UPDATE carparks SET \
                    carLotsAvail={avail_car_lots}, \
                    carTotalLots={total_car_lots}, \
                    update_datetime=\"{update_datetime}\" \
                    WHERE carparkId=\"{carpark_number}\"")
                    db.commit()
                    # print(f"{carpark_number} updated with {avail_car_lots} available.")
                    break
            if not entry_exists:
                # If no exist, insert
                cursor.execute(f"INSERT INTO carparks (carparkId, carLotsAvail, carTotalLots, update_datetime) VALUES \
                    (\"{carpark_number}\",{avail_car_lots}, {total_car_lots}, \"{update_datetime}\")")
                db.commit()
                # print(f"{carpark_number} inserted with {avail_car_lots} available.")
        

        # datetime object containing current date and time
        now = datetime.now()
        # dd/mm/YY H:M:S
        dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
        print("================================\nLast Update:", dt_string, "\n================================")
        for i in range(INTERVAL):
            if (i%10==0):
                print(60-i, "seconds before next update...")
            sleep(1)

def main():
    while True:
        try:
            db = mysql.connector.connect(
            host="localhost",
            user="YOUR_USERNAME",
            password="YOUR_PASSWORD",
            database="YOUR_DATABASE"
            )
            cursor = db.cursor()
            getdata(db, cursor)
        except mysql.connector.errors.DatabaseError:
            continue

if __name__ == "__main__":
    main()
