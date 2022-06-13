// !!! important variables/constants


var PK_VAR = 0;//! Primary key variable
let isOpened = false;//! don't temper with it. it specifies that sidebar is opened or not 
var CURRENT_PLAYING_INDEX = -1;//* index of currently playing track in PLAYLIST_ARRAY;
var IS_PLAYING_ANYTHING = false;
let PLAYLIST_ARRAY = [];// * array of songs(objects of music class) which identified as playlist
let IS_RANDOM_PLAYING = false;
let IS_REPEAT_PLAYING = false;
class music {
    duration;//length of song
    name;// track name  without extension
    fileHandle;
    PRIMARY_KEY;
    url;//url.createurl(filehandle.getfile())
    folder_name;
}//* music class declaration
var AUDIO_OBJ = new Audio();//* will manipulate this object to play/pause audio 
//! don't give empty string in Audio constructor it will change the src to the hostname instead of any url 



// --------***---------
//* adding functionallity to every scroller button in horizontal scroll section 
let ScrollerArray = document.querySelectorAll(".scrollerImage");
if (ScrollerArray) ScrollerArray = Array.from(ScrollerArray);
let listArray = document.querySelectorAll(".slider");
if (listArray) listArray = Array.from(listArray);
for (let i = 0; i < ScrollerArray.length; i++) {
    if (i & 1) {
        //right scroller
        ScrollerArray[i].addEventListener("click", () => {
            let index = Number(ScrollerArray[i].id.substring(9)) - 1;

            let scrollAmount = 0;
            var rightIntervalId = setInterval(() => {
                listArray[index].scrollLeft += 20;
                scrollAmount += 20;
                if (scrollAmount >= 200) {
                    clearInterval(rightIntervalId);
                }
            }, 25);

        });
    }
    else {
        //left scroller
        ScrollerArray[i].addEventListener("click", () => {
            let index = Number(ScrollerArray[i].id.substring(9)) - 1;
            let scrollAmount = 0;
            var leftIntervalId = setInterval(() => {
                listArray[index].scrollLeft -= 20;
                scrollAmount += 20;
                if (scrollAmount >= 200) {
                    clearInterval(leftIntervalId);
                }
            }, 25);
        });
    }
}



//* all extra space in bottom so every content will be visible.
function addFalback() {
    let h = document.querySelector(".bottomPlayer").offsetHeight;
    let e = document.querySelector(".bottomFallback");
    e.style.height = `${h}px`;
}
addFalback();
// todo: add responsive layout features (eg. turn off repeat and random playing when they are not shown to user.)
window.addEventListener("resize", () => {

    addFalback();

    if (window.innerWidth > 1186) {

        console.log("BIG SCREEn");
        document.querySelector(".sidebar").style.visibility = "visible";
        document.querySelector(".sidebar").style.maxWidth = "15vw";
    }
    else {
        document.querySelector(".sidebar").style.visibility = "hidden";
        document.querySelector(".sidebar").style.maxWidth = "unset";

    }
});



//* adding functionallity to open sidebar with trigger
let trigger = document.getElementById("sidebar-trigger");
trigger.addEventListener("click", () => {
    console.log("event triggered");
    let sidebar = document.querySelector(".sidebar");
    if (isOpened === false) {
        sidebar.style.visibility = "visible";
        sidebar.style.animation = "open-sidebar 1s 1 forwards";
        isOpened = true;
    }
    else {

        sidebar.style.animation = "close-sidebar 1s 1 forwards";
        setTimeout(() => {
            sidebar.style.visibility = "hidden";
        }, 500);
        isOpened = false;
    }
    console.log(sidebar);
});



//* open folder functionallity
let openFolderBtn = document.getElementById("open-folder-btn");
console.log(openFolderBtn);
openFolderBtn.addEventListener("click", (e) => {
    e.preventDefault();
    reset();
    getDirectory(addlistenerToPlayBtn);
});



//* play/pause functionallity
let playBtn = document.getElementById("bottomPlayBtn");
playBtn.addEventListener("click", () => {
    if (AUDIO_OBJ.src !== "")
        if (IS_PLAYING_ANYTHING == true) {
            //pause the playback
            AUDIO_OBJ.pause();
            IS_PLAYING_ANYTHING = false;
            playBtn.src = "media/play-circle-fill.svg";
        }
        else {
            AUDIO_OBJ.play();
            IS_PLAYING_ANYTHING = true;
            playBtn.src = "media/pause-circle.svg";
        }
});
let nextBtn = document.getElementById("nextTrack");
nextBtn.addEventListener("click", () => {
    if (IS_RANDOM_PLAYING === false) {
        CURRENT_PLAYING_INDEX = (CURRENT_PLAYING_INDEX + 1) % PLAYLIST_ARRAY.length;
    }
    else {
        CURRENT_PLAYING_INDEX = Math.floor((Math.random() * (PLAYLIST_ARRAY.length - 1)));
    }

    playMusic(PLAYLIST_ARRAY[CURRENT_PLAYING_INDEX], updateBottomPlayer);
});


let prevBtn = document.getElementById("prevTrack");
prevBtn.addEventListener("click", () => {
    if (AUDIO_OBJ.src !== "") {
        if (AUDIO_OBJ.currentTime >= 5) {
            // first click will start playback from 0
            AUDIO_OBJ.currentTime = 0;
        }
        else {
            if (IS_RANDOM_PLAYING === false) {
                if (CURRENT_PLAYING_INDEX > 0) {
                    CURRENT_PLAYING_INDEX--;
                    playMusic(PLAYLIST_ARRAY[CURRENT_PLAYING_INDEX], updateBottomPlayer);
                }
            }
            else {
                CURRENT_PLAYING_INDEX = Math.floor((Math.random() * (PLAYLIST_ARRAY.length - 1)));
                playMusic(PLAYLIST_ARRAY[CURRENT_PLAYING_INDEX], updateBottomPlayer);
            }
        }
    }
});

let shuffleBtn = document.getElementById("shuffle");
shuffleBtn.addEventListener("click", () => {
    if (IS_RANDOM_PLAYING === false) {
        shuffleBtn.style.filter = "invert(42%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(119%) contrast(119%)";
        IS_RANDOM_PLAYING = true;
        if (IS_REPEAT_PLAYING === true) {
            IS_REPEAT_PLAYING = false;
            document.getElementById("repeat").style.filter = "invert()";
        }
    }
    else {
        shuffleBtn.style.filter = "invert()";
        IS_RANDOM_PLAYING = false;
    }
});


let repeatBtn = document.getElementById("repeat");
repeatBtn.addEventListener("click", () => {
    if (IS_REPEAT_PLAYING === false) {
        IS_REPEAT_PLAYING = true;
        repeatBtn.style.filter = "invert(42%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(119%) contrast(119%)";
        if (IS_RANDOM_PLAYING === true) {
            IS_RANDOM_PLAYING = false;
            shuffleBtn.style.filter = "invert()";
        }
    }
    else {
        IS_REPEAT_PLAYING = false;
        repeatBtn.style.filter = "invert()";
    }
});
//* file handling and all other functionality starts here.
async function func() {
    const pickerOpts = {
        types: [
            {
                description: 'Music files',
                accept: {
                    'audio/*': ['.mp3', '.ogg']
                }
            },
        ],
        excludeAcceptAllOption: true,
        multiple: true
    };

    var file = await window.showOpenFilePicker(pickerOpts);
    console.log(file);
    file = file[0];
    file = await file.getFile();
    console.log(file);
    document.getElementById("tempImg").src = URL.createObjectURL(file);
}
async function getDirectory(callback) {
    console.log("INSIDE FUNCTION");
    const dirHandle = await window.showDirectoryPicker();
    console.log(dirHandle);
    console.log("PICKED up");
    let container = document.querySelector(".slider");
    container.innerHTML = "";
    PK_VAR = 0;//doing this cause i know two folders can't be opened simultaneously.
    let anyAudioFound = false;
    for await (const entry of dirHandle.values()) {
        console.log(entry);
        if (entry.kind == "file") {
            let eName = entry.name;
            let extension = eName.substring(eName.lastIndexOf("."));
            console.log("ISFILE");
            if (extension == ".mp3") {
                console.log("ISMP3");
                anyAudioFound = true;
                let trackName = eName.substring(0, Math.min(eName.lastIndexOf("."), 16));
                let str = `
                    <li class="playlistCard">
                        <div class="down">
                            <img src="media/play-circle-fill.svg" alt="" class="filter bigImage playBtn" id="${PK_VAR}">
                            <span class="subsection">From your folder <strong>${dirHandle.name}</strong></span>
                            <h3 class="heading sectionHead">
                                ${trackName}
                            </h3>
                            <p class="more">
                                Lorem ipsum dolor sit, 
                            </p>
                        </div>
                    </li>`;
                let musicObj = new music();
                musicObj.PRIMARY_KEY = PK_VAR++;
                musicObj.name = trackName;
                musicObj.fileHandle = await entry.getFile();
                musicObj.url = URL.createObjectURL(musicObj.fileHandle);
                musicObj.folder_name = dirHandle.name;
                console.log(musicObj);
                PLAYLIST_ARRAY.push(musicObj);
                container.innerHTML += str;
                console.log(entry);
                console.log(entry.kind, entry.name);
            }
        }
    }
    if (anyAudioFound === false) {
        container.innerHTML = "<h1>No audio file found, select another folder!</h1>";
        return;
    }
    callback();
};

function addlistenerToPlayBtn() {
    let array = Array.from(document.querySelectorAll(".playBtn"));
    array.forEach((e) => {
        e.addEventListener("click", () => {
            // code to play song using e.id == PRIMARY_KEY 
            CURRENT_PLAYING_INDEX = Number(e.id);
            playMusic(PLAYLIST_ARRAY[CURRENT_PLAYING_INDEX], updateBottomPlayer);
        });
    });

}
function updateBottomPlayer(play) {
    //play is parameter which specifies that song is going to play or not
    let index = CURRENT_PLAYING_INDEX;
    let obj = PLAYLIST_ARRAY[index];
    let container = document.querySelector(".musicInfo");
    container.innerHTML = `
                <h4>${obj.name}</h4>
                <h6>Artists :</h6>
                <span>Playing from ${obj.folder_name}</span>
    `;
    document.getElementById("duration").innerText = secondToMins(AUDIO_OBJ.duration).toString();
    if (play)
        document.getElementById("bottomPlayBtn").src = "media/pause-circle.svg";
    else
        document.getElementById("bottomPlayBtn").src = "media/play-circle-fill.svg";
}
async function playMusic(obj, callback) {
    AUDIO_OBJ.src = obj.url;
    await AUDIO_OBJ.play();
    IS_PLAYING_ANYTHING = true;
    callback(true);
}

function secondToMins(secs) {
    let fraction = (secs % 60) / 100;
    let decimal = Math.trunc(secs / 60);
    return (Math.round((decimal + fraction) * 100) / 100).toFixed(2);
}

function reset() {
    PK_VAR = 0;
    isOpened = false;
    CURRENT_PLAYING_INDEX = -1;
    IS_PLAYING_ANYTHING = false;
    let tmp = document.getElementById("bottomPlayBtn");
    if (tmp !== null) {
        tmp.src = "media/play-circle-fill.svg";
    }
    PLAYLIST_ARRAY = [];
    IS_RANDOM_PLAYING = false;
    tmp = document.getElementById("shuffle");
    if (tmp !== null) {
        tmp.style.filter = "invert()";
    }
    tmp = document.getElementById("repeat");
    IS_REPEAT_PLAYING = false;
    if (tmp !== null) {
        tmp.style.filter = "invert()";
    }
    if (AUDIO_OBJ.src !== "")
        AUDIO_OBJ.pause();
    AUDIO_OBJ = new Audio();
}
AUDIO_OBJ.addEventListener("ended", () => {
    console.log("End event fired");
    AUDIO_OBJ.currentTime = 0;
    document.getElementById("nextTrack").click();
});


/**
 * todo:
 * do something to detect end of current track,
 * *repeat track functionallity is not working.
 * * searching is not possible
 * !test design with multiple audio files(creating multiple playist cards)
 * ! seeking is not possible
 * ! can't see the current time in input range
 * replace section title with folder name
 * 
 * if got some free work, add all song names in sidebar also without play button links
 */