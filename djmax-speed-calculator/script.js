const SPEED_LIST = [
  0.5,
  0.75,
  1,
  1.25,
  1.5,
  1.75,
  2,
  2.25,
  2.5,
  2.75,
  3,
  3.25,
  3.5,
  3.75,
  4,
  4.25,
  4.5,
  4.25,
  5
];
const MIN_BPM = 60;
const MAX_BPM = 250;

let getGetParameter = () => {
  let query = location.search.replace(/^\?/, "");
  let params = {};
  query.split("&").forEach(s => {
    let param = s.split("=", 2);
    let key = param[0];
    let value = param[1];
    if (key && value) params[key] = value;
  });

  return params;
};

let setForm = targetSpeed => {
  document.getElementById("settings-targetspeed").value = targetSpeed;
};

let round = (v, l) => {
  return Math.round(v * 10 ** l) / 10 ** l;
};

let createSpeedList = targetSpeed => {
  /* return sample
    <li>
      <ul class="row">
        <li>1.00</li>
        <li>600</li>
      </ul>
    </li>
*/
  let rootElm = document.createElement("li");
  SPEED_LIST.forEach(speed => {
    let rowElm = document.createElement("ul");
    rowElm.classList.add("row");

    let speedElm = document.createElement("li");
    let bpmElm = document.createElement("li");

    speedElm.append(speed);
    bpmElm.append(round(targetSpeed / speed, 3));

    rowElm.append(speedElm);
    rowElm.append(bpmElm);

    rootElm.append(rowElm);
  });

  return rootElm;
};

let createBpmList = targetSpeed => {
  /* return sample
    <li>
      <ul class="row">
        <li>200</li>
        <li>3.00</li>
      </ul>
    </li>
*/
  let rootElm = document.createElement("li");
  for (let bpm = MIN_BPM; bpm <= MAX_BPM; bpm++) {
    let rowElm = document.createElement("ul");
    rowElm.classList.add("row");

    let bpmElm = document.createElement("li");
    let speedElm = document.createElement("li");

    bpmElm.append(bpm);
    speedElm.append(round(targetSpeed / bpm, 3));
    let s1 = targetSpeed / bpm;
    let s2 = targetSpeed / (bpm + 1);

    SPEED_LIST.forEach((speed, i) => {
      if (s2 < speed && speed <= s1) {
        speedElm.classList.add("mark");
      }
    });

    rowElm.append(bpmElm);
    rowElm.append(speedElm);

    rootElm.append(rowElm);
  }

  return rootElm;
};

let main = () => {
  let get = getGetParameter();
  // console.log(get);
  let targetSpeed = Number(get.targetspeed);
  // console.log(targetSpeed);

  // guard
  if (!targetSpeed) {
    return;
  }

  setForm(targetSpeed);

  let speedListElm = document.getElementById("speed-list");
  speedListElm.append(createSpeedList(targetSpeed));

  let bpmListElm = document.getElementById("bpm-list");
  bpmListElm.append(createBpmList(targetSpeed));
};

main();
