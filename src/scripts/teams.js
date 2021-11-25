/*
BL1 = Bundersliga
PD = La Liga
PL = Premier League
FL1 = Ligue 1
SA = Seria A


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
    const response = await fetch(`https://api.football-data.org/v2/teams/${teamId}`, {
        "method": "GET",
            headers: { 
                "X-Auth-Token": "7e9a4f65ba4e4427ab9bed7e86d765e0"
            }
        })
        
    let data = await response.json();
    const date = getDate();
    let dataid = data.id
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
    state.team.push(data);
    console.log('state.team',state.team);
    renderPage()
    renderSquadList()
    renderSplashBackground()
    renderSplash() 
}


function start () {
    init(state.teams.id);
}

function renderPage() {
    const main = document.querySelector('main');

    const splash = document.createElement('div');
    splash.className = "splash";
    main.append(splash);

    const splashContent = document.createElement('div');
    splashContent.className = "content splashContent";
    splash.append(splashContent);

    const splashImg = document.createElement('div');
    splashImg.className = "leagueLogoEl";
    splashContent.append(splashImg);

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
    goalkeeper.className = " content goalkeeper";
    main.append(goalkeeper);

    const goalkeeperTitle = document.createElement('h2');
    goalkeeperTitle.innerText = "Goalkeepers";
    goalkeeper.append(goalkeeperTitle);

    const goalkeeperListContainer = document.createElement('ul');
    goalkeeperListContainer.className = "goalkeeperUl playerUl";
    goalkeeper.append(goalkeeperListContainer);

    const defender = document.createElement('div');
    defender.className = "content defender";
    main.append(defender);

    const defenderTitle = document.createElement('h2');
    defenderTitle.innerText = "Defenders";
    defender.append(defenderTitle);

    const defenderListContainer = document.createElement('ul');
    defenderListContainer.className = "defenderUl playerUl";
    defender.append(defenderListContainer);

    const midfielder = document.createElement('div');
    midfielder.className = "content midfielder";
    main.append(midfielder);

    const midfielderTitle = document.createElement('h2');
    midfielderTitle.innerText = "Midfielders";
    midfielder.append(midfielderTitle);

    const midfielderListContainer = document.createElement('ul');
    midfielderListContainer.className = "midfielderUl playerUl";
    midfielder.append(midfielderListContainer);

    const striker = document.createElement('div');
    striker.className = "content striker";
    main.append(striker);

    const strikerTitle = document.createElement('h2');
    strikerTitle.innerText = "Strikers";
    striker.append(strikerTitle);

    const strikerListContainer = document.createElement('ul');
    strikerListContainer.className = "strikerUl playerUl";
    striker.append(strikerListContainer);
}

function renderSquadList() {
    let fragment = document.createDocumentFragment();

    for (let i=0; i < state.team[0].squad.length; i++) {
        const playerListItem = document.createElement('li');
        playerListItem.className = "playerListItem";
        fragment.append(playerListItem);

        const playerName = document.createElement('p');
        playerName.className = "playerName"
        playerName.innerText = `${state.team[0].squad[i].name}`;
        playerListItem.append(playerName);

        const playerAge = document.createElement('p');
        playerAge.innerText = `Age: ${state.team[0].squad[i].dateOfBirth}`;
        playerListItem.append(playerAge);

        const playerPosition = document.createElement('p');
        playerPosition.innerText = `${state.team[0].squad[i].position}`;
        playerListItem.append(playerPosition);

        if (state.team[0].squad[i].position == "Goalkeeper") {
            document.querySelector(".goalkeeperUl").append(fragment)
        } else if (state.team[0].squad[i].position == "Defender") {
            document.querySelector(".defenderUl").append(fragment)
        } else if (state.team[0].squad[i].position == "Midfielder") {
            document.querySelector(".midfielderUl").append(fragment)
        } else if (state.team[0].squad[i].position == "Attacker") {
            document.querySelector(".strikerUl").append(fragment)
        }
    }
}

function renderSplashBackground() {
    let clubPrimaryColor = getclubPrimaryColor() 
    console.log ('clubPrimaryColor',clubPrimaryColor)
    document.querySelector(".splashContent").style.background = `${clubPrimaryColor}`
}

function getclubPrimaryColor() {
    let clubPrimaryColor = state.team[0].clubColors
    clubPrimaryColor = clubPrimaryColor.split(' ')[0]
    return clubPrimaryColor
}

function renderSplash() {
    const titlecontainer = document.querySelector(".splashContent");
    const imgcontainer = document.querySelector(".leagueLogoEl");

    const img = document.createElement('img');
    img.className = "leagueLogo"
    img.src = `${state.team[0].crestUrl}`;
    img.setAttribute("height", "260px");
    imgcontainer.append(img);

    const title = document.createElement('p');
    title.innerText = `${state.team[0].name}`;
    title.style.color = checkColor();
    title.className = "stats statsContent Title";
    titlecontainer.append(title); 
}

init(`${location.href.split('=')[1]}`)

function checkColor () {
    let color;
    let clubPrimaryColor = getclubPrimaryColor() 
    if (clubPrimaryColor == "Black") {
        color= "white";
    }
    return color;
}