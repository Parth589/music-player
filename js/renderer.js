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

window.addEventListener("resize", () => {
    
    let h = document.querySelector(".bottomPlayer").offsetHeight;
    let e = document.querySelector(".bottomFallback");
    e.style.height = `${h}px`;
});