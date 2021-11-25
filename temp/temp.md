if ((leagueData.date) && date.date != leagueData.date) {
    await fetch("http://localhost:3000/PL/1", {
        method: 'DELETE'       
    })
    leagueData = renewLeagueDatabase()
    console.log('old data, renew')
} else if (!(leagueData.date)) {
    leagueData = renewLeagueDatabase()
    console.log('no data, renew')
} else{
    console.log('current data ok')

    async function initFixturesDatabase(type, league) {
    const response = await fetch(`http://localhost:3000/${type}/${league}` , {
        "method": "GET"
    })
    let FixturesData = await response.json();
    const date = getDate()
    
    //console.log (date)
    if ((FixturesData.date) && date.date != FixturesData.date) {
        await fetch("http://localhost:3000/PL/2", {
            method: 'DELETE'       
        })
        FixturesData = renewFixturesDatabase()
        console.log('old data, renew start')
    } else if (!(FixturesData.date)) {
        FixturesData = renewFixturesDatabase()
        console.log('no data, renew start')
    } else{
        console.log( 'current data ok')
    return FixturesData;
    }
}

async function renewFixturesDatabase() {
    const response = await fetch("https://api.football-data.org/v2/competitions/PL/matches", {
        "method": "GET",
            headers: { 
            "X-Auth-Token": "7e9a4f65ba4e4427ab9bed7e86d765e0"
            }
        })

    let data = await response.json();
    //console.log(data);
    date = getDate()
    //console.log ("date", date)
    Object.assign(data, date);
    //console.log ("data with date", data);

    await fetch("http://localhost:3000/PL", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      console.log('post completed')
      //console.log(data)
    return data;
}

function initLeague(command) {
    initLeagueDatabase()
       .then (leagueData => command(leagueData))
       .catch (reason => console.log(reason.message))
   }

function initFixtures(command) {
    initFixturesDatabase()
    .then (fixturesData => command(fixturesData))
    .catch (reason => console.log(reason.message))
}

function dataToState(data) {
    state.data = [];
    state.data = data
    console.log(state.data)
}

function setId(data) {
    const id = data
    const objId = {"id": id}
    console.log (objId)
    return objId;
}

renewFixturesDatabase()



/*
const standingsURL = `https://api.football-data.org/v2/competitions/${competition}/standings`;
const seasonsURL =  `https://api.football-data.org/v2/competitions/${competition}`;
const fixturesURL = `https://api.football-data.org/v2/competitions/${competition}/matches`
*/

function getLog(data) {
    console.log(data);
}