var baseUrl = "http://127.0.0.1:8000";

var lastRaceData;
var anotherRaceData;
var currentStandingsData;
var anotherStandingsData;
var currentConstructorsStandingsData;


async function initializeData() {
    var basicData;
    await fetch(baseUrl + "/basic_data", {method: "GET"}).then(response => response.json())
        .then(data => {console.log(data); basicData = data}).catch(error => console.log(error));
    document.getElementById("nextRaceNameString").innerHTML = "<i>" + basicData["name"] + "</i>";
    document.getElementById("nextRaceNameString").style.visibility = "visible";
    document.getElementById("nextRaceCircuitString").innerHTML = "<i>" + basicData["circuit"] + "</i>";
    document.getElementById("nextRaceCircuitString").style.visibility = "visible";
    var date = new Date(basicData["date"]).getTime();
    var x = setInterval(function () {
        var now = new Date().getTime();
        var distance = date - now;
        var days = Math.floor(distance / (3600000 * 24));
        var hours = Math.floor((distance % (3600000 * 24)) / 3600000);
        var mins = Math.floor((distance % 3600000) / 60000);
        var secs = Math.floor((distance % 60000) / 1000);

        document.getElementById("countdown").innerHTML = "<i>" + days + "d " + hours + "h " + mins + "m " + secs + "s</i>";
        document.getElementById("countdown").style.visibility = "visible";
        if (distance < 0) {
            clearInterval(x);
            document.getElementById("countdown").innerHTML = "<i>Race is going on!</i>";
        }
    }, 1000);
    document.getElementById("lastRaceWinner").innerText = "Winner: " + basicData["last_winner"];
    document.getElementById("lastRaceWinner").style.visibility = "visible";
    document.getElementById("currentStandingLeader").innerText = "Leader: " + basicData["current_leader"];
    document.getElementById("currentStandingLeader").style.visibility = "visible";
}
document.addEventListener("DOMContentLoaded", initializeData);

document.getElementById("lastRaceBtn").addEventListener("submit", async function(event) {
    document.getElementById("standingsTable").style.display = "none";
    await fetch(baseUrl + "/results/last_race", {method: "GET"}).then(response => response.json())
        .then(data => {console.log(data); lastRaceData = data}).catch(error => console.log(error));
    console.log(lastRaceData);
})
async function handleLastRace(event) {
    document.getElementById("standingsTable").style.display = "none";
    hideResultsContainer();
    document.getElementById("raceResults").style.display = "block";
    await fetch(baseUrl + "/results/last_race", {method: "GET"}).then(response => response.json())
        .then(data => lastRaceData = data).catch(error => console.log(error));
    console.log(lastRaceData);
    document.getElementById("topThreeTableBody").replaceChildren();
    document.getElementById("lastWinnersTableBody").replaceChildren();

    // Weather conditions
    var description;
    description = "<b>Temperature:</b> " + lastRaceData["weather_conditions"]["temperature"].toString() +
                " C <b>Humidity:</b> " + lastRaceData["weather_conditions"]["humidity"].toString() + " % <b>Rainfall:</b> " +
                lastRaceData["weather_conditions"]["rainfall"].toString() + " mm <b>Track temperature:</b> " +
                lastRaceData["weather_conditions"]["track_temperature"].toString() + " C";
    document.getElementById("weatherConditionsPar").innerHTML = description;

    document.getElementById("raceLocation").textContent = lastRaceData["location"];

    // Top three table
    for (var i=0; i < lastRaceData["top_three"].length; i++) {
        var row = document.createElement("tr");
        var posColumn = document.createElement("td");
        posColumn.textContent = lastRaceData["top_three"][i]["position"];
        row.appendChild(posColumn);
        var noColumn = document.createElement("td");
        noColumn.textContent = lastRaceData["top_three"][i]["no"];
        row.appendChild(noColumn);
        var nameColumn = document.createElement("td");
        nameColumn.textContent = lastRaceData["top_three"][i]["name"];
        row.appendChild(nameColumn);
        var nationColumn = document.createElement("td");
        nationColumn.textContent = lastRaceData["top_three"][i]["nation"];
        row.appendChild(nationColumn);
        var teamColumn = document.createElement("td");
        teamColumn.textContent = lastRaceData["top_three"][i]["team"];
        row.appendChild(teamColumn);
        var timeColumn = document.createElement("td");
        timeColumn.textContent = lastRaceData["top_three"][i]["time"];
        row.appendChild(timeColumn);

        document.getElementById("topThreeTableBody").appendChild(row);
    }

    // Last winners table
    for (var j=0; j < lastRaceData["last_winners"].length; j++) {
        var row2 = document.createElement("tr");
        var yearColumn = document.createElement("td");
        yearColumn.textContent = lastRaceData["last_winners"][j]["year"];
        row2.appendChild(yearColumn);
        var no2Column = document.createElement("td");
        no2Column.textContent = lastRaceData["last_winners"][j]["winner_no"];
        row2.appendChild(no2Column);
        var name2Column = document.createElement("td");
        name2Column.textContent = lastRaceData["last_winners"][j]["winner_name"];
        row2.appendChild(name2Column);
        var nation2Column = document.createElement("td");
        nation2Column.textContent = lastRaceData["last_winners"][j]["winner_nation"];
        row2.appendChild(nation2Column);
        var team2Column = document.createElement("td");
        team2Column.textContent = lastRaceData["last_winners"][j]["winner_team"];
        row2.appendChild(team2Column);
        var time2Column = document.createElement("td");
        time2Column.textContent = lastRaceData["last_winners"][j]["winner_time"];
        row2.appendChild(time2Column);

        var weatherColumn = document.createElement("td");
        if (lastRaceData["last_winners"][j]["temperature"] !== 10000) {
            weatherColumn.innerHTML = "<b>Temperature:</b> " + lastRaceData["last_winners"][j]["temperature"].toString() +
                " C<br><b>Humidity:</b> " + lastRaceData["last_winners"][j]["humidity"].toString() + " %<br><b>Rainfall:</b> " +
                lastRaceData["last_winners"][j]["rainfall"].toString() + " mm<br><b>Track temperature:</b> " +
                lastRaceData["last_winners"][j]["track_temperature"].toString() + " C";
        } else {
            weatherColumn.innerHTML = "<i>No data</i>"
        }
        row2.appendChild(weatherColumn);

        document.getElementById("lastWinnersTableBody").appendChild(row2);
    }
    showResultsContainer();
}

async function handleAnotherRace(event) {
    document.getElementById("standingsTable").style.display = "none";
    hideResultsContainer();
    document.getElementById("raceResults").style.display = "block";
    var year = document.getElementById("raceYear").value;
    var round = document.getElementById("raceRound").value;
    await fetch(baseUrl + `/results/${year}/${round}`, {method: "GET"}).then(response => response.json())
        .then(data => anotherRaceData = data).catch(error => console.log(error));
    console.log(anotherRaceData);

    document.getElementById("topThreeTableBody").replaceChildren();
    document.getElementById("lastWinnersTableBody").replaceChildren();

    // Weather conditions
    var description;
    if (anotherRaceData["weather_conditions"]["temperature"] !== 10000) {
        description = "<b>Temperature:</b> " + anotherRaceData["weather_conditions"]["temperature"].toString() +
            " C <b>Humidity:</b> " + anotherRaceData["weather_conditions"]["humidity"].toString() + " % <b>Rainfall:</b> " +
            anotherRaceData["weather_conditions"]["rainfall"].toString() + " mm <b>Track temperature:</b> " +
            anotherRaceData["weather_conditions"]["track_temperature"].toString() + " C";
    } else {
        description = "<b>No weather conditions data provided</b>"
    }
    document.getElementById("weatherConditionsPar").innerHTML = description;

    document.getElementById("raceLocation").textContent = anotherRaceData["location"];

    // Top three table
    for (var i=0; i < anotherRaceData["top_three"].length; i++) {
        var row = document.createElement("tr");
        var posColumn = document.createElement("td");
        posColumn.textContent = anotherRaceData["top_three"][i]["position"];
        row.appendChild(posColumn);
        var noColumn = document.createElement("td");
        noColumn.textContent = anotherRaceData["top_three"][i]["no"];
        row.appendChild(noColumn);
        var nameColumn = document.createElement("td");
        nameColumn.textContent = anotherRaceData["top_three"][i]["name"];
        row.appendChild(nameColumn);
        var nationColumn = document.createElement("td");
        nationColumn.textContent = anotherRaceData["top_three"][i]["nation"];
        row.appendChild(nationColumn);
        var teamColumn = document.createElement("td");
        teamColumn.textContent = anotherRaceData["top_three"][i]["team"];
        row.appendChild(teamColumn);
        var timeColumn = document.createElement("td");
        timeColumn.textContent = anotherRaceData["top_three"][i]["time"];
        row.appendChild(timeColumn);

        document.getElementById("topThreeTableBody").appendChild(row);
    }

    // Last winners table
    for (var j=0; j < anotherRaceData["last_winners"].length; j++) {
        var row2 = document.createElement("tr");
        var yearColumn = document.createElement("td");
        yearColumn.textContent = anotherRaceData["last_winners"][j]["year"];
        row2.appendChild(yearColumn);
        var no2Column = document.createElement("td");
        no2Column.textContent = anotherRaceData["last_winners"][j]["winner_no"];
        row2.appendChild(no2Column);
        var name2Column = document.createElement("td");
        name2Column.textContent = anotherRaceData["last_winners"][j]["winner_name"];
        row2.appendChild(name2Column);
        var nation2Column = document.createElement("td");
        nation2Column.textContent = anotherRaceData["last_winners"][j]["winner_nation"];
        row2.appendChild(nation2Column);
        var team2Column = document.createElement("td");
        team2Column.textContent = anotherRaceData["last_winners"][j]["winner_team"];
        row2.appendChild(team2Column);
        var time2Column = document.createElement("td");
        time2Column.textContent = anotherRaceData["last_winners"][j]["winner_time"];
        row2.appendChild(time2Column);

        var weatherColumn = document.createElement("td");
        if (anotherRaceData["last_winners"][j]["temperature"] !== 10000) {
            weatherColumn.innerHTML = "<b>Temperature:</b> " + anotherRaceData["last_winners"][j]["temperature"].toString() +
                " C<br><b>Humidity:</b> " + anotherRaceData["last_winners"][j]["humidity"].toString() + " %<br><b>Rainfall:</b> " +
                anotherRaceData["last_winners"][j]["rainfall"].toString() + " mm<br><b>Track temperature:</b> " +
                anotherRaceData["last_winners"][j]["track_temperature"].toString() + " C";
        } else {
            weatherColumn.innerHTML = "<i>No data</i>"
        }
        row2.appendChild(weatherColumn);

        document.getElementById("lastWinnersTableBody").appendChild(row2);
    }
    showResultsContainer();
}

async function handleCurrentStandings(event) {
    document.getElementById("raceResults").style.display = "none";
    hideResultsContainer();
    document.getElementById("standingsTable").style.display = "block";
    await fetch(baseUrl + "/standings/drivers/current", {method: "GET"}).then(response => response.json())
        .then(data => currentStandingsData = data).catch(error => console.log(error));
    console.log(currentStandingsData);
    document.getElementById("standingsTableBody").replaceChildren();
    for (var i=0; i < currentStandingsData.length; i++) {
        var row = document.createElement("tr");
        var posColumn = document.createElement("td");
        posColumn.textContent = currentStandingsData[i]["position"];
        row.appendChild(posColumn);
        var noColumn = document.createElement("td");
        noColumn.textContent = currentStandingsData[i]["no"];
        row.appendChild(noColumn);
        var nameColumn = document.createElement("td");
        nameColumn.textContent = currentStandingsData[i]["name"];
        row.appendChild(nameColumn);
        var nationColumn = document.createElement("td");
        nationColumn.textContent = currentStandingsData[i]["nation"];
        row.appendChild(nationColumn);
        var teamColumn = document.createElement("td");
        teamColumn.textContent = currentStandingsData[i]["team"];
        row.appendChild(teamColumn);
        var pointsColumn = document.createElement("td");
        pointsColumn.textContent = currentStandingsData[i]["points"];
        row.appendChild(pointsColumn);
        var winsColumn = document.createElement("td");
        winsColumn.textContent = currentStandingsData[i]["wins"];
        row.appendChild(winsColumn);
        document.getElementById("standingsTableBody").appendChild(row);
    }
    showResultsContainer();
}

async function handleAnotherStandings(event) {
    document.getElementById("raceResults").style.display = "none";
    hideResultsContainer();
    document.getElementById("standingsTable").style.display = "block";
    var year = document.getElementById("standingYear").value;
    await fetch(baseUrl + `/standings/drivers/${year}`, {method: "GET"}).then(response => response.json())
        .then(data => anotherStandingsData = data).catch(error => console.log(error));
    console.log(anotherStandingsData);
    document.getElementById("standingsTableBody").replaceChildren();
    for (var i=0; i < anotherStandingsData.length; i++) {
        var row = document.createElement("tr");
        var posColumn = document.createElement("td");
        posColumn.textContent = anotherStandingsData[i]["position"];
        row.appendChild(posColumn);
        var noColumn = document.createElement("td");
        noColumn.textContent = anotherStandingsData[i]["no"];
        row.appendChild(noColumn);
        var nameColumn = document.createElement("td");
        nameColumn.textContent = anotherStandingsData[i]["name"];
        row.appendChild(nameColumn);
        var nationColumn = document.createElement("td");
        nationColumn.textContent = anotherStandingsData[i]["nation"];
        row.appendChild(nationColumn);
        var teamColumn = document.createElement("td");
        teamColumn.textContent = anotherStandingsData[i]["team"];
        row.appendChild(teamColumn);
        var pointsColumn = document.createElement("td");
        pointsColumn.textContent = anotherStandingsData[i]["points"];
        row.appendChild(pointsColumn);
        var winsColumn = document.createElement("td");
        winsColumn.textContent = anotherStandingsData[i]["wins"];
        row.appendChild(winsColumn);
        document.getElementById("standingsTableBody").appendChild(row);
    }
    showResultsContainer();
}

async function handleCurrentConstructorsStandings(event) {
    await fetch(baseUrl + "/standings/constructors/current", {method: "GET"}).then(response => response.json())
        .then(data => currentConstructorsStandingsData = data).catch(error => console.log(error));
    console.log(currentConstructorsStandingsData);
}

function showResultsContainer() {
    document.getElementById("resultsContainer").style.display = "block";
}

function hideResultsContainer() {
    document.getElementById("resultsContainer").style.display = "none";
}
