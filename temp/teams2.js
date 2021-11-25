/*
BL1 = Bundersliga
PD = La Liga
PL = Premier League
FL1 = Ligue 1
SA = Seria A
*/

let state = {
    search: "",
    league: "",
    teamId: 0,
    standings: [],
    matches: [],
    teams: [],
    team: []
}
/*
eventForm();

function eventForm() {
    const form = document.querySelector("#league");
    form.addEventListener ("change", function (event) {
        let league = event.target.value;
        if (league === "default") return;
        clearState();
        initState()
    })
}
*/
function clearState() {
    state.standings = [];
    state.matches = [];
    state.teams = [];
    state.team = [];
}

async function initDatabase(id) {
    const teamId = id;
    console.log(`http://localhost:3000/Teams/${teamId}`)
    const response = await fetch(`http://localhost:3000/Teams/${teamId}` , {
        "method": "GET"
    })
    let data = await response.json();    
    data = await checkDate(data, id);
    console.log('data for' , id, 'in local JSON server', data);
    updateState (data);
    return data;
}

async function checkDate(data, id) {
    console.log('check date start', id);
    console.log(data);
    const date = getDate();
    const day = getDay();
    if (!(data.date)) {
        data = await updateDatabase(id);
        console.log ('date checked finished for', id, 'data missing in local JSON server, changes needed');
        return data;
    } else if ((data.date) && (date.date !== data.date)) {
        data = await updateDatabase(id);
        console.log ('date checked finished for', id, 'date mismatch, changes needed');
        return data;
    } else {
        console.log ('date checked finished for', id, 'no changes needed');
        return data;
    }
}

async function updateDatabase(id) {
    const teamId = id;
    const response = await fetch(`https://v3.football.api-sports.io/players/squads?team=${teamId}`, {
        "method": "GET",
            headers: { 
            "x-apisports-key": "586fc683c28ea1677e67d6c422dae481"
            }
        })
        
    let data = await response.json();
    const date = getDate();
    let dataid = data.response[0].team.id
    let idObj = {id: dataid};
    Object.assign(data, idObj);
    Object.assign(data, date);
    await fetch(`http://localhost:3000/Teams/${teamId}`, {
        method: 'DELETE',
    })
    console.log ('data to push', data);
    await fetch(`http://localhost:3000/Teams/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
    console.log ('data pushed');
    return data;
}

function init(id, command = console.log) {
    initDatabase(id)
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

function updateState(data) {
    state.team = []
    state.team.push(data.response[0]);
    console.log('state.team',state.team);
    renderSquad () 
}

init('33');

const main = document.querySelector('main');

const splash = document.createElement('div');
splash.className = "splash";
main.append(splash);

const splashContent = document.createElement('div');
splashContent.className = "content";
splash.append(splashContent);

const last6 = document.createElement('div');
last6.className = "form";
main.append(last6);

const last6Content = document.createElement('div');
last6Content.className = "content";
last6.append(last6Content);

const squad = document.createElement('div');
squad.className = "squad";
main.append(squad);

const goalkeeper = document.createElement('div');
goalkeeper.className = "goalkeepers";
main.append(goalkeeper);

const goalkeeperContent = document.createElement('div');
goalkeeperContent.className = "content playerContent goalkeeperUl";
goalkeeper.append(goalkeeperContent);

const defender = document.createElement('div');
defender.className = "defender";
main.append(defender);

const DefenderTitleContainer = document.createElement('div');
DefenderTitleContainer.className = "content";
defender.append(DefenderTitleContainer);

const defenderTitle = document.createElement('h2');
defenderTitle.innerText = "Defenders";
DefenderTitleContainer.append(defenderTitle);

const defenderContent = document.createElement('div');
defenderContent.className = "playerContent defenderUl";
DefenderTitleContainer.append(defenderContent);

const midfielder = document.createElement('div');
midfielder.className = "midfielder";
main.append(midfielder);

const midfielderContent = document.createElement('div');
midfielderContent.className = "content playerContent midfielderUl";
midfielder.append(midfielderContent);

const attacker = document.createElement('div');
attacker.className = "attacker";
main.append(attacker);

const attackerContent = document.createElement('div');
attackerContent.className = "content playerContent attackerUl";
attacker.append(attackerContent);


function renderSquad () {
    let fragment = document.createDocumentFragment();

    for (let i=0; i < state.team[0].players.length; i++) {
        const playerListItem = document.createElement('div');
        playerListItem.className = "playerListItem";
        fragment.append(playerListItem);

        const imgDiv = document.createElement('div');
        imgDiv.className = imgDiv
        playerListItem.append(imgDiv);

        const playerPhoto= document.createElement('img');
        playerPhoto.className = "playerPhoto"
        playerPhoto.src = `${state.team[0].players[i].photo}`;
        playerPhoto.width = "250";
        imgDiv.append(playerPhoto);

        const playerNumber = document.createElement('p');
        playerNumber.className = "playerNumber"
        playerNumber.innerText = `${state.team[0].players[i].number}`;
        playerListItem.append(playerNumber);

        const playerName = document.createElement('p');
        playerName.className = "playerName"
        playerName.innerText = `${state.team[0].players[i].name}`;
        playerListItem.append(playerName);

        const playerAge = document.createElement('p');
        playerAge.innerText = `Age: ${state.team[0].players[i].age}`;
        playerListItem.append(playerAge);

        const playerPosition = document.createElement('p');
        playerPosition.innerText = `${state.team[0].players[i].position}`;
        playerListItem.append(playerPosition);

        if (state.team[0].players[i].position == "Goalkeeper") {
            document.querySelector(".goalkeeperUl").append(fragment)
        } else if (state.team[0].players[i].position == "Defender") {
            document.querySelector(".defenderUl").append(fragment)
        } else if (state.team[0].players[i].position == "Midfielder") {
            document.querySelector(".midfielderUl").append(fragment)
        } else if (state.team[0].players[i].position == "Attacker") {
            document.querySelector(".attackerUl").append(fragment)
        }
    }
}

function createNewElement (type, classname, text) {
    const newElement = document.createElement(type);
    newElement.className = classname;
    newElement.innerText = text;    
}
