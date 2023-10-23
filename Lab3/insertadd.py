import csv
import mysql.connector
from SVY21 import SVY21;


# == Table columns ==
# carparkId
# carLotsAvail
# carTotalLots
# update_datetime

db = mysql.connector.connect(
  host="localhost",
  user="root",
  password="pineapple",
  database="carpark"
)
cursor = db.cursor(buffered=True)
cv = SVY21()

with open("HDBCarparkInformation.csv", "r") as f:
    spamreader = csv.reader(f, delimiter=",")
    for row in spamreader:
        id = row[0]
        if id == "car_park_no":
            continue
        add = row[1]
        x_cord = row[2]
        y_cord = row[3]
        latlng = cv.computeLatLon(float(y_cord), float(x_cord))
        cursor.execute(f"UPDATE carparks SET \
            lat=\"{latlng[0]}\", \
            lng=\"{latlng[1]}\" \
            WHERE carparkId=\"{id}\"")
        db.commit()