from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

base_url = "https://f1api.dev/api"
weather_url = "https://api.openf1.org/v1"

weather_params = ("temperature", "humidity", "rainfall", "track_temperature")

@app.get("/")
async def root():
    return {"Hello": "lala"}

class LastWinner(BaseModel):
    year: int
    # Winner
    winner_name: str
    winner_no: int
    winner_nation: str
    winner_team: str
    winner_time: str
    # # Best lap
    # best_lap_time: str
    # best_lap_driver: str
    # Weather conditions
    temperature: float
    humidity: float
    rainfall: float
    track_temperature: float

class Racer(BaseModel):
    position: int
    name: str
    no: int
    team: str
    nation: str
    time: str

class Standing(BaseModel):
    position: int
    name: str
    no: int
    team: str
    nation: str
    points: float
    wins: int



@app.get("/results/last_race")
async def get_last_race_results():
    data = requests.get(base_url + "/current/last/race").json()
    top_three = []
    last_winners = []
    race_country = data["races"]["circuit"]["country"]
    print(race_country)

    # Top three
    index = 0
    for result in data["races"]["results"]:
        if index >= 3:
            break
        driver_no = 0
        if result["driver"]["number"] is not None:
            driver_no = result["driver"]["number"]
        racer = Racer(position=result["position"], name=result["driver"]["name"] + " " + result["driver"]["surname"],
                      no=driver_no, team=result["team"]["teamName"],
                      nation=result["driver"]["nationality"], time=result["time"])
        top_three.append(racer)
        index += 1

    weather_conditions = get_weather_conditions(race_country.replace(" ", "%20"), 2025)
    weather_conditions = dict(zip(weather_params, weather_conditions))

    # History winners
    response = None
    for year in range(2024, 2019, -1):
        # Get every race of the {year} season to check if there was the same one
        response = requests.get(base_url + f"/{year}").json()
        for race in response["races"]:
            # Looking for the same race
            if race["circuit"]["country"] == race_country:
                round = race["round"]
                print("Runda: ", round, " rok: ", year)
                race_data = requests.get(base_url + f"/{year}/{round}/race").json()
                for pos in race_data["races"]["results"]:
                    if pos["position"] == 1:

                        # Get data about winner
                        winner_name = pos["driver"]["name"] + " " + pos["driver"]["surname"]
                        winner_no = 0
                        if pos["driver"]["number"] is not None:
                            winner_no = pos["driver"]["number"]
                        winner_nation = pos["driver"]["nationality"]
                        winner_team = pos["team"]["teamName"]
                        winner_time = pos["time"]

                        temp = 10000
                        hum = 10000
                        rain = 10000
                        track_temp = 10000

                        if year >= 2023:
                            temp, hum, rain, track_temp = get_weather_conditions(race_country, year)

                        last_winner = LastWinner(year=year, winner_name=winner_name, winner_no=winner_no,
                                                 winner_nation=winner_nation, winner_team=winner_team,
                                                 winner_time=winner_time, temperature=temp, humidity=hum,
                                                 rainfall=rain, track_temperature=track_temp)
                        last_winners.append(last_winner)
                        break
                # Get data about winner
                # winner_name = race["winner"]["name"] + race["winner"]["surname"]
                # winner_no = race["winner"]["number"]
                # winner_nation = race["winner"]["country"]
                # winner_team = race["teamWinner"]["teamName"]
                # winner_time = None
                # Get data about fastest lap of the race
                # best_lap_time = race["fast_lap"]["fast_lap"]
                # best_lap_driver = race["fast_lap"]["fast_lap_driver_id"]

                break

    print(response["season"])
    return {"top_three": top_three, "last_winners": last_winners, "weather_conditions": weather_conditions,
            "location": data["races"]["raceName"]}

@app.get("/results/{year}/{round}")
async def get_race_results(year: str, round: str):
    data = requests.get(base_url + f"/{year}/{round}/race").json()

    top_three = []
    last_winners = []
    race_country = data["races"]["circuit"]["country"]
    print(race_country)

    # Top three
    index = 0
    for result in data["races"]["results"]:
        if index >= 3:
            break
        driver_no = 0
        if result["driver"]["number"] is not None:
            driver_no = result["driver"]["number"]
        racer = Racer(position=result["position"], name=result["driver"]["name"] + " " + result["driver"]["surname"],
                      no=driver_no, team=result["team"]["teamName"],
                      nation=result["driver"]["nationality"], time=result["time"])
        top_three.append(racer)
        index += 1
    weather_conditions = {"temperature": 10000, "humidity": 10000, "rainfall": 10000, "track_temperature": 10000}
    if int(year) >= 2023:
        weather_conditions = get_weather_conditions(race_country.replace(" ", "%20"), int(year))
        weather_conditions = dict(zip(weather_params, weather_conditions))

    for year2 in range(int(year)-1, int(year)-6, -1):
        # Get every race of the {year} season to check if there was the same one
        response = requests.get(base_url + f"/{year2}").json()
        for race in response["races"]:
            # Looking for the same race
            if race["circuit"]["country"] == race_country:
                round = race["round"]
                print("Runda: ", round, " rok: ", year2)
                race_data = requests.get(base_url + f"/{year2}/{round}/race").json()
                for pos in race_data["races"]["results"]:
                    if pos["position"] == 1:

                        # Get data about winner
                        winner_name = pos["driver"]["name"] + " " + pos["driver"]["surname"]
                        winner_no = 0
                        if pos["driver"]["number"] is not None:
                            winner_no = pos["driver"]["number"]
                        winner_nation = pos["driver"]["nationality"]
                        winner_team = pos["team"]["teamName"]
                        winner_time = pos["time"]
                        temp = 10000
                        hum = 10000
                        rain = 10000
                        track_temp = 10000

                        if year2 >= 2023:
                            temp, hum, rain, track_temp = get_weather_conditions(race_country, year2)

                        last_winner = LastWinner(year=year2, winner_name=winner_name, winner_no=winner_no,
                                                 winner_nation=winner_nation, winner_team=winner_team,
                                                 winner_time=winner_time, temperature=temp, humidity=hum,
                                                 rainfall=rain, track_temperature=track_temp)
                        last_winners.append(last_winner)
                        break
                break
    return {"top_three": top_three, "last_winners": last_winners, "weather_conditions": weather_conditions,
            "location": data["races"]["raceName"]}

@app.get("/weather/{country}/{year}")
def get_weather_conditions(country: str, year: int):
    data = requests.get(weather_url + f"/sessions?country_name={country}&session_name=Race&year={year}").json()
    session_key = data[0]["session_key"]
    weather_data = requests.get(weather_url + f"/weather?session_key={session_key}").json()
    index = 0
    temp_avg = 0
    hum_avg = 0
    rain_avg = 0
    track_temp_avg = 0
    while index < 20:
        temp_avg += weather_data[index]["air_temperature"]
        hum_avg += weather_data[index]["humidity"]
        rain_avg += weather_data[index]["rainfall"]
        track_temp_avg += weather_data[index]["track_temperature"]
        index += 1
    temp_avg = round(temp_avg / 20, 2)
    hum_avg = round(hum_avg / 20, 2)
    rain_avg = round(rain_avg / 20, 2)
    track_temp_avg = round(track_temp_avg / 20, 2)
    return temp_avg, hum_avg, rain_avg, track_temp_avg



@app.get("/standings/drivers/current")
async def get_current_drivers_standings():
    standings = []
    # Getting meeting key of a race
    data = requests.get(base_url + "/current/drivers-championship").json()
    for driver in data["drivers_championship"]:
        wins = 0
        if driver["wins"] is not None:
            wins = driver["wins"]

        standing = Standing(position=driver["position"], name=driver["driver"]["name"]+" "+driver["driver"]["surname"],
                            no=driver["driver"]["number"], team=driver["team"]["teamName"],
                            nation=driver["driver"]["nationality"], points=driver["points"], wins=wins)
        standings.append(standing)
    return standings

@app.get("/standings/drivers/{year}")
async def get_drivers_standings(year: str):
    standings = []
    # Getting meeting key of a race
    data = requests.get(base_url + f"/{year}/drivers-championship").json()
    for driver in data["drivers_championship"]:
        wins = 0
        number = 0
        if driver["wins"] is not None:
            wins = driver["wins"]
        if driver["driver"]["number"] is not None:
            number = driver["driver"]["number"]

        standing = Standing(position=driver["position"], name=driver["driver"]["name"]+" "+driver["driver"]["surname"],
                            no=number, team=driver["team"]["teamName"],
                            nation=driver["driver"]["nationality"], points=driver["points"], wins=wins)
        standings.append(standing)
    return standings
