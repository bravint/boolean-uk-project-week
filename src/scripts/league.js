eventForm();

function initrender(league) {
clearState();
clearContent();
setBannerStyling (league)
renderLeagueLogo(league);
init('teams', 'PL');
init('standings', 'PL', renderStandings);
init('matches', 'PL', renderFixtures);
}

initrender('PL')

function eventForm() {
    const form = document.querySelector("#league");
    form.addEventListener ("change", function (event) {
        let league = event.target.value;
        if (league === "default") return;
        clearState();
        clearContent();

        setBannerStyling (league)
        renderLeagueLogo(league);

        init('teams', league);
        init('standings', league, renderStandings);
        init('matches', league, renderFixtures);
    })
}

function clearState() {
    state.standings = [];
    state.matches = [];
    state.teams = [];
}

function clearContent() {
    const tableSection = document.querySelector('.leagueTable')
    tableSection.innerHTML="";

    const fixturesSection = document.querySelector('.leagueFixtures');
    fixturesSection.innerHTML="";

    const resultsSection = document.querySelector('.leagueResults');
    resultsSection.innerHTML="";

    const imgDiv = document.querySelector(".leagueLogoEl");
    imgDiv.innerHTML="";

    const statsEl = document.querySelector(".stats");
    statsEl.innerHTML = "";
}

async function initDatabase(type, league) {
    const leagueId = league;
    const typeId  = getTypeId(type);
    console.log(`http://localhost:3000/${leagueId}/${typeId}`)
    const response = await fetch(`http://localhost:3000/${leagueId}/${typeId}` , {
        "method": "GET"
    })
    let data = await response.json();    
    data = await checkDate(data, type, league);
    console.log('data for' , type, 'in local JSON server', data);
    updateState (data, type, league);
    return data;
}

async function checkDate(data, type, league) {
    console.log('check date start', type);
    console.log(data);
    const date = getDate();
    const day = getDay();
    if (!(data.date)) {
        data = await updateDatabase(type, league);
        console.log ('date checked finished for', type, 'data missing in local JSON server, changes needed');
        return data;
    } else if ((data.date) && ((date.date !== data.date) || (day === 6) || (day === 7))) {
        data = await updateDatabase(type, league);
        console.log ('date checked finished for', type, 'date mismatch, changes needed');
        return data;
    } else {
        console.log ('date checked finished for', type, 'no changes needed');
        return data;
    }
}

async function updateDatabase(type, league) {
    const typeVar = type;
    const leagueId = league;
    const typeId  = getTypeId (type);
    const response = await fetch(`https://api.football-data.org/v2/competitions/${leagueId}/${typeVar}`, {
        "method": "GET",
            headers: { 
            "X-Auth-Token": "7e9a4f65ba4e4427ab9bed7e86d765e0"
            }
        })
        
    let data = await response.json();
    const date = getDate();
    const id = setid (type);
    Object.assign(data, date);
    Object.assign(data, id);
    await fetch(`http://localhost:3000/${leagueId}/${typeId}`, {
        method: 'DELETE',
    })
    console.log ('data to push', data);
    await fetch(`http://localhost:3000/${leagueId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
    console.log ('data pushed');
    return data;
}

function init(type, league, command = console.log) {
    initDatabase(type, league)
    .then(data => command(data))
    .catch (reason => console.log(reason.message))
}

function getDate() {
    let today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();   
    today = Number(yyyy+mm+dd);
    console.log (`today's date`, today);
    const obj = {"date": today};
    return obj;  
}

function getDay () {
    const today = new Date();
    const day = today.getUTCDay();
    console.log ('UTC day', day);
    return day;
}

function setid (type) {
    let typeId = getTypeId (type);
    const obj = {"id": typeId};
    console.log('type', obj);
    return obj;
}

function updateState (data, type, league) {
    const leagueId = league;
    state.league = leagueId;
    if (type == "standings") {
        state.standings = [];
        state.standings.push(data);
        console.log('state.standings',state.standings);
    } else if(type == "matches"){
        state.matches = [];
        state.matches.push(data);
        console.log('state.matches',state.matches);
    }  else if(type == "teams"){
        state.teams = [];
        state.teams.push(data);
        console.log('state.teams',state.teams);
    }
}

function getTypeId (type) {
    let typeId = 0;
    if (type == "standings") {
        return typeId = 1;
        } else if (type == "matches") {
        return typeId = 2;
        } else if (type == "teams") {
        return typeId = 3;
        }
}

function dateAndTimeofMatch(date) {
    let newdate = date;
    newdate = newdate.slice (0, -4);
    newdate = newdate.replace(/T/g,' ');
    return (newdate);
}

function dateOfMatch(date) {
    let newdate = date;
    newdate = newdate.slice (0, -10);
    newdate = newdate.replace(/-/g,'');
    return(newdate);
}

function fixTeamNames(name) {
    let newName = name;
    if (state.league === "PL") {
        newName = newName.replace(/ FC/g,'');
    }
    return newName
}

function renderVenue(homeId) {
    venue ="";

    for (let i=0; i< state.teams[0].teams.length; i++) {
        if (homeId == state.teams[0].teams[i].id) {
            venue = state.teams[0].teams[i].venue;
        }
    }

    return venue;
}

function renderLeagueLogo(id) {
    const imgDiv = document.querySelector(".leagueLogoEl");
    const img = document.createElement('img');
    img.className = "leagueLogo"
    img.src = `./src/assets/images/${id}.svg`;
    img.setAttribute("height", "260px");
    imgDiv.append(img);
}

function renderStandings(data) {
    const tableSection = document.querySelector('.leagueTable')

    const sectionHeading = document.createElement('h2')
    sectionHeading.className = "sectionHeading";
    sectionHeading.innerText = "League Table";
    tableSection.append(sectionHeading);

    const listContainer = document.createElement('ul');
    listContainer.className = 'standingContainer';
    tableSection.append(listContainer);

    const listItemEl = document.createElement('li');
    listItemEl.className = 'standingsListItem';
    listContainer.append(listItemEl);

    const position = document.createElement('p');
    position.innerText = "Pos";
    listItemEl.append(position);

    const emptyDiv = document.createElement('div');
    emptyDiv.innerText = "Team";
    listItemEl.append(emptyDiv);

    const name = document.createElement('p');
    listItemEl.append(name);

    const playedGames = document.createElement('p');
    playedGames.innerText = "Played";
    listItemEl.append(playedGames);

    const won = document.createElement('p');
    won.innerText = "Won";
    listItemEl.append(won);

    const draw = document.createElement('p');
    draw.innerText = "Drawn";
    listItemEl.append(draw);

    const lost = document.createElement('p');
    lost.innerText = "Lost";
    listItemEl.append(lost);

    const goalsFor = document.createElement('p');
    goalsFor.innerText = "GF";
    listItemEl.append(goalsFor);

    const goalsAgainst = document.createElement('p');
    goalsAgainst.innerText = "GA";
    listItemEl.append(goalsAgainst);

    const goalDifference = document.createElement('p');
    goalDifference.innerText = "GD";
    listItemEl.append(goalDifference);

    const points = document.createElement('p');
    points.innerText = "Points";
    listItemEl.append(points);

    for (let i = 0; i < data.standings[0].table.length; i++) {
        const listItemEl = document.createElement('li');
        listItemEl.className = 'standingsListItem';
        listItemEl.id = data.standings[0].table[i].team.id;
        listContainer.append(listItemEl);

        const position = document.createElement('p');
        position.innerText = data.standings[0].table[i].position;
        listItemEl.append(position);

        const crest = document.createElement('img');
        crest.src = `${data.standings[0].table[i].team.crestUrl}`;
        crest.setAttribute("height", "25px");
        listItemEl.append(crest);
        
        const name = document.createElement('a');
        name.href = '#';
        name.className = 'teams';
        name.innerText = fixTeamNames(data.standings[0].table[i].team.name);
        name.id = data.standings[0].table[i].team.id;
        listItemEl.append(name);

        const playedGames = document.createElement('p');
        playedGames.innerText = data.standings[0].table[i].playedGames;
        listItemEl.append(playedGames);

        const won = document.createElement('p');
        won.innerText = data.standings[0].table[i].won;
        listItemEl.append(won);

        const draw = document.createElement('p');
        draw.innerText = data.standings[0].table[i].draw;
        listItemEl.append(draw);

        const lost = document.createElement('p');
        lost.innerText = data.standings[0].table[i].lost;
        listItemEl.append(lost);

        const goalsFor = document.createElement('p');
        goalsFor.innerText = data.standings[0].table[i].goalsFor;
        listItemEl.append(goalsFor);

        const goalsAgainst = document.createElement('p');
        goalsAgainst.innerText = data.standings[0].table[i].goalsAgainst;
        listItemEl.append(goalsAgainst);

        const goalDifference = document.createElement('p');
        goalDifference.innerText = data.standings[0].table[i].goalDifference;
        listItemEl.append(goalDifference);

        const points = document.createElement('p');
        points.innerText = data.standings[0].table[i].points;
        listItemEl.append(points);

        listItemEl.addEventListener("click", function(event) {
            let id = event.target.id;
            state.id = id;
            console.log(state.id);
            window.open(`/teams.html?id=${id}`)
        })
        }
        renderLeagueStats(data);
}

//fixtures

function renderFixtures(data) {
    let counter = 0;
    let currentMatchday = data.matches[0].season.currentMatchday;
    const fixturesSection = document.querySelector('.leagueFixtures');

    const fixturesHeading = document.createElement('h2');
    fixturesHeading.className = "fixturesHeading";
    fixturesHeading.innerText = "Upcoming Matches";
    fixturesSection.append(fixturesHeading);

    renderChangeRound("fixtures");
    renderDynamicElColours(data.competition.code); 

    const fixturesListContainer = document.createElement('ul');
    fixturesListContainer.className = 'fixturesContainer';
    fixturesSection.append(fixturesListContainer);
    renderUpcomingList (data);

    function renderUpcomingList (data) {
        let dateCurrent = getDate();

        for (let i = 0; i < data.matches.length; i++) {
            if (data.matches[i].matchday === currentMatchday) {
                date = dateOfMatch(data.matches[i].utcDate);

                if (dateCurrent.date <= date) {
                const homeId = data.matches[i].homeTeam.id;
                const awayId = data.matches[i].awayTeam.id;

                const listItemEl = document.createElement('li');
                listItemEl.className = 'matchdayListItem';
                fixturesListContainer.append(listItemEl);

                const homeCrest = document.createElement('img');
                homeCrest.src = `https://crests.football-data.org/${homeId}.svg`;
                homeCrest.setAttribute("height", "25px");
                listItemEl.append(homeCrest);

                const homeTeam = document.createElement('a');
                homeTeam.id = data.matches[i].homeTeam.id;
                homeTeam.href = "#";
                homeTeam.innerText = fixTeamNames(data.matches[i].homeTeam.name);
                listItemEl.append(homeTeam);

                const Score = document.createElement('p');
                Score.innerText = dateAndTimeofMatch(data.matches[i].utcDate);
                listItemEl.append(Score);

                const awayTeam = document.createElement('a');
                awayTeam.id = data.matches[i].awayTeam.id;
                awayTeam.href = "#";
                awayTeam.innerText = fixTeamNames(data.matches[i].awayTeam.name);
                listItemEl.append(awayTeam);

                const awaycrest = document.createElement('img');
                awaycrest.src = `https://crests.football-data.org/${awayId}.svg`;
                awaycrest.setAttribute("height", "25px");
                listItemEl.append(awaycrest);

                const matchDetails = document.createElement('p');
                matchDetails.innerText = renderVenue(homeId);
                listItemEl.append(matchDetails);

                listItemEl.addEventListener("click", function(event) {
                    let id = event.target.id;
                    state.id = id;
                    console.log(state.id);
                    window.open(`/teams.html?id=${id}`);
                })
                
                counter ++;
                }
            }
        }
    }

    if (counter == 0) {
        currentMatchday ++;
        console.log ('currentMatchday',currentMatchday);
        renderUpcomingList (data);  
    } else if (counter < (state.teams[0].teams.length /2)) {
        currentMatchday ++
    }

    const resultsSection = document.querySelector('.leagueResults');

    const resultsHeading = document.createElement('h2')
    resultsHeading.className = "resultsHeading";
    resultsHeading.innerText = "Results";
    resultsSection.append(resultsHeading);

    renderChangeRound("results")
    renderDynamicElColours(data.competition.code) 

    const resultsListContainer = document.createElement('ul');
    resultsListContainer.className = 'resultsContainer';
    resultsSection.append(resultsListContainer);

    for (let i = 0; i < data.matches.length; i++) {
        if (data.matches[i].matchday === currentMatchday -1) {
            if ((Number.isInteger(data.matches[i].score.fullTime.homeTeam))) {
                const homeId = data.matches[i].homeTeam.id;
                const awayId = data.matches[i].awayTeam.id;
                
                const listItemEl = document.createElement('li');
                listItemEl.className = 'upcomingListItem';
                resultsListContainer.append(listItemEl);

                const homeCrest = document.createElement('img');
                homeCrest.src = `https://crests.football-data.org/${homeId}.svg`;
                homeCrest.setAttribute("height", "25px");
                listItemEl.append(homeCrest);

                const homeTeam = document.createElement('a');
                homeTeam.id = data.matches[i].homeTeam.id;
                homeTeam.href = "#"
                homeTeam.innerText = fixTeamNames(data.matches[i].homeTeam.name);
                listItemEl.append(homeTeam);

                const Score = document.createElement('p');
                Score.innerText = `${data.matches[i].score.fullTime.homeTeam} - ${data.matches[i].score.fullTime.awayTeam}`;
                listItemEl.append(Score);

                const awayTeam = document.createElement('a');
                awayTeam.id = data.matches[i].homeTeam.id;
                awayTeam.href = "#"
                awayTeam.innerText = fixTeamNames(data.matches[i].awayTeam.name);
                listItemEl.append(awayTeam);

                const awaycrest = document.createElement('img');
                awaycrest.src = `https://crests.football-data.org/${awayId}.svg`;
                awaycrest.setAttribute("height", "25px");
                listItemEl.append(awaycrest);

                const matchVenue = document.createElement('p');
                matchVenue.innerText = renderVenue(homeId);
                listItemEl.append(matchVenue);
                
                const matchLink = document.createElement('p');
                listItemEl.append(matchVenue);

                const matchDetails = document.createElement('a');
                matchDetails.href = "#"
                matchDetails.innerText = 'Match Details';
                listItemEl.append(matchDetails);

                listItemEl.addEventListener("click", function(event) {
                    let id = event.target.id
                    state.id = id
                    console.log(state.id)
                    window.open(`/teams.html?id=${id}`)
                })
                


            }
        }
    }
}

function setBannerStyling (league) {
    if (league == 'PL') {
        document.querySelector(".splashContent").style.backgroundColor = "#37003c";

    } else if (league == 'BL1') {
        document.querySelector(".splashContent").style.backgroundColor = "white";

    } else if (league == 'SA') {
        document.querySelector(".splashContent").style.backgroundColor = "#00197d";

    } else if (league == 'PD') {
        document.querySelector(".splashContent").style.backgroundColor = "white"

    } else if (league == 'FL1') {
        document.querySelector(".splashContent").style.backgroundColor = "#091c3e"
        }
    }
    function renderDynamicElColours(league) {
        let newColor;
        if (league == 'PL') {
            newColor = "rgba( 55, 0, 60, 0.75 )";   
        } else if (league == 'SA') {
            newColor = "#00197d";
        } else if (league == 'FL1') {
            newColor = "#091c3e";
        } else if (league == 'PD') {
            newColor = "#25282a";
        } else if (league == 'BL1') {
            newColor = "red"
        }

        Array.from(document.querySelectorAll(".changeRound"))
        .forEach((element => element.style.backgroundColor = `${newColor}`))
    }

    function renderLeagueStats(data) {
        const statsEl = document.querySelector(".stats");

        const LeagueName = document.createElement("p");
        LeagueName.className = "statsContent Title";
        LeagueName.innerText = `${data.competition.name}`;
        statsEl.append(LeagueName);

        const LeagueCountry = document.createElement("p");
        LeagueCountry.className = "statsContent Text";
        LeagueCountry.innerText = `	\u00B7 ${data.competition.area.name} \u00B7 Season 2021/22 \u00B7 Matchday: ${data.season.currentMatchday}`;
        statsEl.append(LeagueCountry);

        if (data.competition.code == 'BL1' || data.competition.code == 'PD') {
            document.querySelector(".stats").style.color = "black";
        } else {
            document.querySelector(".stats").style.color = "white";
        }
    }

function renderChangeRound(type = "") {

    let parentEl;

    if (type == "results") {
            parentEl = document.querySelector('.leagueResults');
    } else {
            parentEl = document.querySelector('.leagueFixtures');
    }

    const selectRoundEl = document.createElement('div');
    selectRoundEl.className = "changeRound"
    parentEl.append(selectRoundEl)

    const prevRoundBtn = document.createElement('button');
    prevRoundBtn.className = "btnRound";
    prevRoundBtn.innerText = "<";
    selectRoundEl.append(prevRoundBtn);

    const textRound = document.createElement('p');
    textRound.className = "textRound";
    textRound.innerText = `Round currentMatchday`;
    selectRoundEl.append(textRound);

    const nextRoundBtn = document.createElement('button')
    nextRoundBtn.className = "btnRound"
    nextRoundBtn.innerText = ">"
    selectRoundEl.append(nextRoundBtn);
}
