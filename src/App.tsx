import "./App.css";

import React, { useEffect } from "react";

function App() {
  const [name, setName] = React.useState("NAVIZHYAN");
  const [runAnimation, setRunAnimation] = React.useState(true);
  const revealNameRef = React.useRef<HTMLDivElement>(null);
  const getShuffledName = () => {
    const shuffled = name.split("").sort(() => Math.random() - 0.5);
    return shuffled.join("");
  };
  const getNameOrder = () => {
    const order = Array.from({ length: name.length }, () => 0);
    const used = new Set<number>();
    const letters = revealNameRef.current?.querySelectorAll(
      ".block"
    ) as NodeListOf<HTMLElement>;
    name.split("").forEach((ch, nameInd) => {
      for (let letterInd = 0; letterInd < letters.length; letterInd++) {
        const letter = letters[letterInd];
        if (letter.textContent === ch && !used.has(letterInd)) {
          order[letterInd] = nameInd;
          used.add(letterInd);
          break;
        }
      }
    });
    return order;
  };

  const shuffledName = React.useMemo(() => getShuffledName(), [name]);

  useEffect(() => {
    let blockLimit = 15000;
    let cornerLimit = 10000;
    let isEvenIndex = true;
    let blockIntr: NodeJS.Timer;
    let blockTimeout: NodeJS.Timeout;
    let letterDisplayInterval: NodeJS.Timer;
    let cornerTimeout: NodeJS.Timeout;
    let cornerInterval: NodeJS.Timer;
    let checkAllDone: NodeJS.Timer;
    let nameInd = 0;
    const blocks = revealNameRef.current?.querySelectorAll(
      ".block"
    ) as NodeListOf<HTMLElement>;
    if (name && runAnimation) {
      let letterIndex = Math.floor(name.length / 2);
      letterDisplayInterval = setInterval(() => {
        if (nameInd < name.length) {
          blocks[nameInd]?.style.setProperty("--ind", `${letterIndex}em`);
          // blocks[nameInd]?.style.setProperty(
          //   "animation",
          //   "zoomOut 1.5s ease-in-out forwards"
          // );
          blocks[nameInd]?.classList.add("zoom-out");
          blocks[nameInd]?.style.setProperty("opacity", "1");
          letterIndex--;
          nameInd++;
        } else {
          clearInterval(letterDisplayInterval);
        }
      }, 1500);
      blockTimeout = setTimeout(() => {
        blockIntr = setInterval(() => {
          const ind = isEvenIndex
            ? Math.floor(Math.random() * 4) + 1
            : Math.floor(Math.random() * 3) + 6;
          const selectedEl = document?.querySelector(
            `[data-child="${ind}"]`
          ) as HTMLElement;
          const nextBlock = document?.querySelector(
            `[data-child="${ind + 1}"]`
          ) as HTMLElement;
          if (!selectedEl || !nextBlock) return;
          selectedEl.style.animation = "none";
          nextBlock.style.animation = "none";
          void selectedEl.offsetWidth;
          void nextBlock.offsetWidth;
          selectedEl.style.animation = "move 1.5s ease-in-out";
          nextBlock.style.animation = "pull 1.5s ease-in-out";
          const nextLetter = nextBlock.querySelector(".letter") as HTMLElement;
          const selectedLetter = selectedEl.querySelector(
            ".letter"
          ) as HTMLElement;
          function handleAnimationEnd() {
            const nextText = nextLetter.textContent;
            nextLetter.textContent = selectedLetter.textContent;
            selectedLetter.textContent = nextText;
            selectedEl.removeEventListener("animationend", handleAnimationEnd);
            nextBlock.removeEventListener("animationend", handleAnimationEnd);
          }
          selectedEl.addEventListener("animationend", handleAnimationEnd);
          nextBlock.addEventListener("animationend", handleAnimationEnd);
          blockLimit -= 1000;
          isEvenIndex = !isEvenIndex;
          if (blockLimit === 0) clearInterval(blockIntr);
        }, 1000);
      }, (name.length + 1) * 1500);
      cornerTimeout = setTimeout(() => {
        const container = revealNameRef.current?.querySelector(
          ".text-box"
        ) as HTMLElement;
        function moveBlocks() {
          const containerWidth = container.clientWidth - 800;
          const containerHeight = container.clientHeight - 500;

          blocks.forEach((block) => {
            const x = Math.random() * containerWidth;
            const y = Math.random() * containerHeight;
            block.style.transform = `translate(${x}px, ${y}px)`;
          });
          if (cornerLimit <= 0) {
            const order = getNameOrder();
            let transition = Array.from({ length: blocks.length }, () => false);
            blocks.forEach((block, ind) => {
              block.style.transform = `translate(${
                (order[ind] + ind - 2 * Math.floor(name.length / 2)) * -1
              }em,0)`;
              block.style.transition = `all 5s ease-in-out ${
                Math.random() * 15
              }s`;
              transition[ind] = true;
              block.addEventListener(
                "transitionend",
                () => (transition[ind] = false)
              );
            });
            const allDone = () => transition.every((t) => t === false);
            checkAllDone = setInterval(() => {
              if (allDone()) {
                blocks.forEach((block, ind) => {
                  block.style.transform = `translate(${
                    (ind - order[ind]) * -1
                  }em,0)`;
                  block.style.transition = `all 5s ease-in-out  ${
                    Math.random() * 15
                  }s`;
                });
                clearInterval(checkAllDone);
              }
            }, 1000);
            clearInterval(cornerInterval);
          }
          cornerLimit -= 2500;
        }
        cornerInterval = setInterval(moveBlocks, 2500);
      }, (name.length + 1) * 1500 + blockLimit);
    }

    return () => {
      clearInterval(blockIntr);
      clearTimeout(blockTimeout);
      clearInterval(cornerInterval);
      clearTimeout(cornerTimeout);
      clearInterval(letterDisplayInterval);
      clearInterval(checkAllDone);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, runAnimation]);

  return (
    <div className="App" ref={revealNameRef}>
      <video
        src="/background.mp4"
        autoPlay
        loop
        muted
        className="background-video"
      />
      <video
        src="/textBG.3gp"
        autoPlay
        loop
        muted
        className="background-video text-bg-video"
      />
      {!runAnimation ? (
        <div className="input-container">
          <label htmlFor="name-input">Enter your name:</label>
          <input
            id="name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
          />
          <button onClick={() => setRunAnimation(true)}>Start Animation</button>
        </div>
      ) : (
        <div className="text-box">
          {shuffledName
            .split("")
            .map((char, index) => (
              <div key={index} className="block" data-child={index + 1}>
                {/* <video
                  src={"/textfire.mp4"}
                  autoPlay
                  loop
                  muted
                  className="text-video"
                /> */}
                <div className="letter">{char}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default App;
