// !!! important variables/constants

var PK_VAR = 0; //! Primary key variable
let isOpened = false; //! don't temper with it. it specifies that sidebar is opened or not
var CURRENT_PLAYING_INDEX = -1; //* index of currently playing track in PLAYLIST_ARRAY;
var IS_PLAYING_ANYTHING = false;
var PLAYLIST_ARRAY = []; // * array of songs(objects of music class) which identified as playlist
var IS_RANDOM_PLAYING = false;
var IS_REPEAT_PLAYING = false;
var SEEKBAR_INTERVAL_ID = null;
class music {
    duration; //length of song
    name; // track name  without extension
    fileHandle;
    PRIMARY_KEY;
    url; //url.createurl(filehandle.getfile())
    folder_name;
} //* music class declaration
var AUDIO_OBJ = document.getElementById('audio-obj'); //* will manipulate this object to play/pause audio
//! don't give empty string in Audio constructor it will change the src to the hostname instead of any url

// --------***---------
//* adding functionallity to every scroller button in horizontal scroll section
let ScrollerArray = document.querySelectorAll('.scrollerImage');
if (ScrollerArray) ScrollerArray = Array.from(ScrollerArray);
let listArray = document.querySelectorAll('.slider');
if (listArray) listArray = Array.from(listArray);
for (let i = 0; i < ScrollerArray.length; i++) {
    if (i & 1) {
        //right scroller
        ScrollerArray[i].addEventListener('click', () => {
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
    } else {
        //left scroller
        ScrollerArray[i].addEventListener('click', () => {
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
    ScrollerArray[i].addEventListener("mouseover", () => {
        ScrollerArray[i].click();
    });
}

//* all extra space in bottom so every content will be visible.
function addFalback() {
    let h = document.querySelector('.bottomPlayer').offsetHeight;
    let e = document.querySelector('.bottomFallback');
    e.style.height = `${h}px`;
}
addFalback();
window.addEventListener('resize', () => {
    addFalback();

    if (window.innerWidth > 1186) {
        document.querySelector('.sidebar').style.visibility = 'visible';
        document.querySelector('.sidebar').style.maxWidth = '15vw';
    } else {
        document.querySelector('.sidebar').style.visibility = 'hidden';
        document.querySelector('.sidebar').style.maxWidth = 'unset';
    }
    if (window.innerWidth <= 498) {
        IS_RANDOM_PLAYING = false;
        IS_REPEAT_PLAYING = false;
    }
});

//* adding functionallity to open sidebar with trigger
let trigger = document.getElementById('sidebar-trigger');
trigger.addEventListener('click', () => {
    let sidebar = document.querySelector('.sidebar');
    if (isOpened === false) {
        sidebar.style.visibility = 'visible';
        sidebar.style.animation = 'open-sidebar 1s 1 forwards';
        isOpened = true;
    } else {
        sidebar.style.animation = 'close-sidebar 1s 1 forwards';
        setTimeout(() => {
            sidebar.style.visibility = 'hidden';
        }, 500);
        isOpened = false;
    }
});

//* open folder functionallity
let openFolderBtn = document.getElementById('open-folder-btn');
openFolderBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    let a = await getDirectory(addlistenerToPlayBtn);
    if (a === false) reset();
});

//* play/pause functionallity
let playBtn = document.getElementById('bottomPlayBtn');
playBtn.addEventListener('click', () => {
    if (AUDIO_OBJ.src !== '')
        if (IS_PLAYING_ANYTHING == true) {
            //pause the playback
            playBtn.src = 'media/play-circle-fill.svg';
            pauseMusic();
        } else {
            if (AUDIO_OBJ.ended) {
                nextBtn.click();
                return;
            }
            playMusic2(true);
            playBtn.src = 'media/pause-circle.svg';
        }
});
AUDIO_OBJ.addEventListener('play', () => {
    if (IS_PLAYING_ANYTHING === false) {
        console.log('External Play controls');
        IS_PLAYING_ANYTHING = true;
        playBtn.src = 'media/pause-circle.svg';
        resumeInterval();
    } else {
        console.log('Internal Play Controls');
    }
});
AUDIO_OBJ.addEventListener('pause', () => {
    console.log("PAUse");
    if (IS_PLAYING_ANYTHING === true && AUDIO_OBJ.ended === false) {
        //info: i've put this AUDIO_OBJ.ended === false condition because when Audio object music finishes, first the play event is fired(with updated .ended property.) and then ended event is fired.
        console.log('External Play controls');
        IS_PLAYING_ANYTHING = false;
        playBtn.src = 'media/play-circle-fill.svg';
        stopInterval();
    } else {
        console.log('Internal Play Controls');
    }
});
let nextBtn = document.getElementById('nextTrack');
nextBtn.addEventListener('click', () => {
    if (AUDIO_OBJ.src !== '') {
        if (IS_RANDOM_PLAYING === false) {
            CURRENT_PLAYING_INDEX =
                (CURRENT_PLAYING_INDEX + 1) % PLAYLIST_ARRAY.length;
        } else {
            CURRENT_PLAYING_INDEX = Math.floor(Math.random() * PLAYLIST_ARRAY.length);
        }
        playMusic(PLAYLIST_ARRAY[CURRENT_PLAYING_INDEX], updateBottomPlayer);
    }
});

let prevBtn = document.getElementById('prevTrack');
prevBtn.addEventListener('click', () => {
    if (AUDIO_OBJ.src !== '') {
        if (AUDIO_OBJ.currentTime >= 5) {
            // first click will start playback from 0
            AUDIO_OBJ.currentTime = 0;
            playBtn.click();
            startInterval();
        } else {
            if (IS_RANDOM_PLAYING === false) {
                if (CURRENT_PLAYING_INDEX > 0) {
                    CURRENT_PLAYING_INDEX--;
                    playMusic(PLAYLIST_ARRAY[CURRENT_PLAYING_INDEX], updateBottomPlayer);
                }
            } else {
                CURRENT_PLAYING_INDEX = Math.floor(
                    Math.random() * PLAYLIST_ARRAY.length
                );
                playMusic(PLAYLIST_ARRAY[CURRENT_PLAYING_INDEX], updateBottomPlayer);
            }
        }
    }
});

let shuffleBtn = document.getElementById('shuffle');
shuffleBtn.addEventListener('click', () => {
    if (IS_RANDOM_PLAYING === false) {
        shuffleBtn.style.filter =
            'invert(42%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(119%) contrast(119%)';
        IS_RANDOM_PLAYING = true;
        if (IS_REPEAT_PLAYING === true) {
            IS_REPEAT_PLAYING = false;
            document.getElementById('repeat').style.filter = 'invert()';
        }
    } else {
        shuffleBtn.style.filter = 'invert()';
        IS_RANDOM_PLAYING = false;
    }
});

let repeatBtn = document.getElementById('repeat');
repeatBtn.addEventListener('click', () => {
    if (IS_REPEAT_PLAYING === false) {
        IS_REPEAT_PLAYING = true;
        repeatBtn.style.filter =
            'invert(42%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(119%) contrast(119%)';
        if (IS_RANDOM_PLAYING === true) {
            IS_RANDOM_PLAYING = false;
            shuffleBtn.style.filter = 'invert()';
        }
    } else {
        IS_REPEAT_PLAYING = false;
        repeatBtn.style.filter = 'invert()';
    }
});

//* autoplay + repeat functionallity
AUDIO_OBJ.addEventListener('ended', () => {
    if (IS_REPEAT_PLAYING == true) {
        playMusic(PLAYLIST_ARRAY[CURRENT_PLAYING_INDEX], updateBottomPlayer);
    } else {
        if (document.getElementById('autoPlayChk').checked) {
            if (CURRENT_PLAYING_INDEX == PLAYLIST_ARRAY.length - 1) {
                //playlist array has ended
                CURRENT_PLAYING_INDEX = 0;
                playMusic(
                    PLAYLIST_ARRAY[CURRENT_PLAYING_INDEX],
                    updateBottomPlayer,
                    () => {
                        playBtn.click();
                    }
                );
            } else nextBtn.click();
        } else {
            playBtn.click();
        }
    }
});

function setFolderName(name) {
    let tmp = document.querySelectorAll('.folderName');
    if (tmp.length !== 0) {
        Array.from(tmp).forEach((e) => {
            e.innerText = name;
        });
    }
}
function removeFolderName() {
    let tmp = document.querySelectorAll('.folderName');
    if (tmp.length !== 0) {
        Array.from(tmp).forEach((e) => {
            e.innerText = '';
        });
    }
}

//* file handling and all other functionality starts here.
async function func() {
    const pickerOpts = {
        types: [
            {
                description: 'Music files',
                accept: {
                    'audio/*': ['.mp3', '.ogg'],
                },
            },
        ],
        excludeAcceptAllOption: true,
        multiple: true,
    };

    var file = await window.showOpenFilePicker(pickerOpts);
    file = file[0];
    file = await file.getFile();
    document.getElementById('tempImg').src = URL.createObjectURL(file);
}
async function getDirectory(callback) {
    try {
        var dirHandle = await window.showDirectoryPicker();
    } catch (e) {
        console.error('User cancelled the folder selection wizard', e);
        return false;
    }
    let container = document.querySelector('.slider');
    let containerSecondary = document.querySelector('#musicList');
    container.innerHTML = '';
    containerSecondary.innerHTML = '';

    PK_VAR = 0; //doing this cause i know two folders can't be opened simultaneously.
    let anyAudioFound = false;
    for await (const entry of dirHandle.values()) {
        if (entry.kind == 'file') {
            let eName = entry.name;
            let extension = eName.substring(eName.lastIndexOf('.'));
            if (extension == '.mp3') {
                anyAudioFound = true;
                let trackName = eName.substring(0, Math.min(eName.lastIndexOf('.'), 20));
                if (eName.lastIndexOf('.') > 20) {
                    // trackname beautification
                    trackName += "...";
                }
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
                let s2 = `
                <li class="listItms fontWhite mediumFont">${trackName}</li>`;
                let musicObj = new music();
                musicObj.PRIMARY_KEY = PK_VAR++;
                musicObj.name = trackName;
                musicObj.fileHandle = await entry.getFile();
                musicObj.url = URL.createObjectURL(musicObj.fileHandle);
                musicObj.folder_name = dirHandle.name;
                PLAYLIST_ARRAY.push(musicObj);
                container.innerHTML += str;
                containerSecondary.innerHTML += s2;
            }
        }
    }
    if (anyAudioFound === false) {
        container.innerHTML =
            '<h1>No audio file found, select another folder!</h1>';
        return;
    }

    // render the folder name on every element which have class folderName
    setFolderName(dirHandle.name);
    callback();
    return true;
}

function addlistenerToPlayBtn() {
    // add event listeners to play btns attached with card
    let array = Array.from(document.querySelectorAll('.playBtn'));
    array.forEach((e) => {
        e.addEventListener('click', () => {
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
    let container = document.querySelector('.musicInfo');
    container.innerHTML = `
                <h4>${obj.name}</h4>
                <h6>Artists :</h6>
                <span>Playing from ${obj.folder_name}</span>
    `;
    document.getElementById('duration').innerText = secondToMins(
        AUDIO_OBJ.duration
    ).toString();
    if (play)
        document.getElementById('bottomPlayBtn').src = 'media/pause-circle.svg';
    else
        document.getElementById('bottomPlayBtn').src = 'media/play-circle-fill.svg';
}
async function playMusic(obj, callback, callback2) {
    // takes an music object and starts playing it
    if (SEEKBAR_INTERVAL_ID !== null) {
        stopInterval(true);
    }
    AUDIO_OBJ.src = obj.url;
    await playMusic2(false);
    startInterval();
    // i am using it for my own purpose it is not function's working need
    callback(true);
    if (callback2 != undefined) {
        callback2();
    }
}
async function playMusic2(resume) {
    //this function just play/pause the playback it doesn't change the track
    IS_PLAYING_ANYTHING = true;
    await AUDIO_OBJ.play();
    if (resume) resumeInterval();
}
function pauseMusic(stopEntirely) {
    //this function just play/pause the playback it doesn't change the track
    IS_PLAYING_ANYTHING = false;
    AUDIO_OBJ.pause();
    if (stopEntirely === undefined) stopInterval(false);
    else stopInterval(true);
}
function secondToMins(secs) {
    let fraction = (secs % 60) / 100;
    let decimal = Math.trunc(secs / 60);
    return (Math.round((decimal + fraction) * 100) / 100).toFixed(2);
}

// info: although i can use both string and number values to change input:range value, i will use number as they are easy to manipulate

let seekbar = document.getElementById('playTime');
seekbar.addEventListener('input', () => {
    if (AUDIO_OBJ.src !== '') {
        const D = AUDIO_OBJ.duration;
        let val = Math.trunc((D * (Math.round(seekbar.value / 100) * 100)) / 1000);
        AUDIO_OBJ.currentTime = val;
        seekbar.value = (val * 1000) / D;
    }
});
function startInterval() {
    if (SEEKBAR_INTERVAL_ID !== null) {
        stopInterval(false);
    }
    // it need to be called whenever track changes
    let seekbar = document.getElementById('playTime');
    let div = 50 / AUDIO_OBJ.duration;
    seekbar.value = div;
    SEEKBAR_INTERVAL_ID = setInterval(() => {
        seekbar.value = Number(seekbar.value) + div * 10;
    }, 500);
}
function resumeInterval() {
    // it just play/pause the seekbar movement
    if (SEEKBAR_INTERVAL_ID === null) {
        let seekbar = document.getElementById('playTime');
        let div = 50 / AUDIO_OBJ.duration;
        seekbar.value = Number(seekbar.value) + div * 10;
        SEEKBAR_INTERVAL_ID = setInterval(() => {
            seekbar.value = Number(seekbar.value) + div * 10;
        }, 500);
    }
}
function stopInterval(setSeekbarToFull) {
    if (SEEKBAR_INTERVAL_ID == null) {
        console.error('Check code again You Asshole ;<');
        return;
    }
    clearInterval(SEEKBAR_INTERVAL_ID);
    SEEKBAR_INTERVAL_ID = null;
    if (setSeekbarToFull) {
        document.getElementById('playTime').value = 1000;
        // ! 1000 is maxvalue of seekbar which is hardcoded
    }
}

//* searching in tracks
let search = document.getElementById('search');
let container = document.querySelector('.slider');
search.addEventListener('input', () => {
    // ! this functionallity depends on the structure of HTML (ul.slider)
    console.log('INput event is here...');
    let containerHTML = container.innerHTML.trim();
    if (containerHTML.startsWith('<h1')) {
        console.log('there is nothing to search');
    } else if (containerHTML.startsWith('<li')) {
        console.log('there is something to search');
        _search();
    }
});
search.addEventListener('blur', () => {
    console.log('blur event is here...');
    search.value = '';
    let container = document.querySelector('.slider');
    Array.from(container.children).forEach((element) => {
        element.style.display = 'block';
    });
});

function _search() {
    let regEx = new RegExp(search.value, 'i');
    Array.from(container.children).forEach((element) => {
        if (regEx.test(element.innerText)) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });
}

// * volume controls
let vol = document.getElementById("volume");
vol.addEventListener("input", () => {
    AUDIO_OBJ.volume = vol.value / 100;
});
function debug() {
    //this function will log all important constants
    console.log('PK_VAR', PK_VAR);
    console.log('isOpened', isOpened);
    console.log('CURRENT_PLAYING_INDEX', CURRENT_PLAYING_INDEX);
    console.log('IS_PLAYING_ANYTHING', IS_PLAYING_ANYTHING);
    console.log('PLAYLIST_ARRAY', PLAYLIST_ARRAY);
    console.log('IS_RANDOM_PLAYING', IS_RANDOM_PLAYING);
    console.log('IS_REPEAT_PLAYING', IS_REPEAT_PLAYING);
    console.log('SEEKBAR_INTERVAL_ID', SEEKBAR_INTERVAL_ID);
}
function reset() {
    PK_VAR = 0;
    CURRENT_PLAYING_INDEX = -1;
    document.querySelector('.slider').innerHTML = '';
    let container = document.querySelector('.musicInfo');
    container.innerHTML = `
                <h4>...</h4>
                <h6>Artists : ...</h6>
                <span>Playing from ...</span>
    `;
    IS_PLAYING_ANYTHING = false;
    let tmp = document.getElementById('bottomPlayBtn');
    if (tmp !== null) {
        tmp.src = 'media/play-circle-fill.svg';
    }
    PLAYLIST_ARRAY = [];
    IS_RANDOM_PLAYING = false;
    tmp = document.getElementById('shuffle');
    if (tmp !== null) {
        tmp.style.filter = 'invert()';
    }
    tmp = document.getElementById('repeat');
    IS_REPEAT_PLAYING = false;
    if (tmp !== null) {
        tmp.style.filter = 'invert()';
    }
    if (AUDIO_OBJ.src !== '') pauseMusic(true);
    AUDIO_OBJ.src = '';
    SEEKBAR_INTERVAL_ID = null;
    removeFolderName();
}
/**
 * todo:
 *
 * ! [✓] Controls from OS is not reflacted by the application.(if user play/pause track from non-application interface, the music gets paused but other controls dont reflctes it)
 * * [✓] do something to detect end of current track,
 * * [✓] repeat track functionallity is not working.
 * * [✓] searching is not possible
 * * [✓] currently i am asuming that if user opens the open folder wizard it is deffinately going to select a folder (Generate an exception in which if user cancels the wizard, the application wont make any error.)
 * ! [✓] test design with multiple audio files(creating multiple playist cards)
 * ! [✓] seeking is not possible
 * ! [X] can't see the current time in input range
 *   [✓] replace section title with folder name
 * * [X] use artists name and other metadata of mp3 file using id3 tag (don't use just lorem ipsum...)
 *
 * * [✓] make sidebar more useful (it is not made for just open folder button. add more stuff in it.)
 *   [✓] -add all song names in sidebar also without play button links
 *   [✓] -add autoplay option in sidebar
 *   [✓] -test that sidebar design with multiple tracks.(add a scrollbar if needed)
 */
// info: the way to perform a play/pause operation is :1> update the IS_PLAYING_ANYTHING flag 2> play/pause operation 