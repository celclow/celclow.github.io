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
  4.75,
  5
];
const MIN_BPM = 60;
const MAX_BPM = 250;

let round = (v, l) => {
  return Math.round(v * 10 ** l) / 10 ** l;
};

let getSpeedList = targetSpeed => {
  let speedList = [];

  for (let i = 0; i < SPEED_LIST.length; i++) {
    let row = {};

    row.speed = SPEED_LIST[i];
    row.lowBpm = round(
      targetSpeed / ((SPEED_LIST[i] + SPEED_LIST[i + 1]) / 2),
      3
    );
    row.midBpm = round(targetSpeed / SPEED_LIST[i], 3);
    row.highBpm = round(
      targetSpeed / ((SPEED_LIST[i - 1] + SPEED_LIST[i]) / 2),
      3
    );

    speedList.push(row);
  }

  return speedList;
};

let getBpmList = targetSpeed => {
  let bpmList = [];

  for (let bpm = MIN_BPM; bpm <= MAX_BPM; bpm++) {
    let row = {};

    row.bpm = bpm;
    row.speed = round(targetSpeed / bpm, 3);

    // mark
    row.mark = false;
    SPEED_LIST.forEach(speed => {
      if (targetSpeed / (bpm + 1) < speed && speed <= targetSpeed / bpm) {
        row.mark = true;
      }
    });

    bpmList.push(row);
  }

  return bpmList;
};

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

  getSpeedList(targetSpeed).forEach(row => {
    let rowElm = document.createElement("ul");
    rowElm.classList.add("row");

    let speedElm = document.createElement("li");
    let lowBpmElm = document.createElement("li");
    let midBpmElm = document.createElement("li");
    let highBpmElm = document.createElement("li");

    speedElm.append(row.speed);
    lowBpmElm.append(row.lowBpm);
    midBpmElm.append(row.midBpm);
    highBpmElm.append(row.highBpm);

    rowElm.append(speedElm);
    rowElm.append(lowBpmElm);
    rowElm.append(midBpmElm);
    rowElm.append(highBpmElm);
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

  getBpmList(targetSpeed).forEach(row => {
    let rowElm = document.createElement("ul");
    rowElm.classList.add("row");

    let bpmElm = document.createElement("li");
    let speedElm = document.createElement("li");

    bpmElm.append(row.bpm);
    speedElm.append(row.speed);
    if (row.mark) {
      speedElm.classList.add("mark");
    }

    rowElm.append(bpmElm);
    rowElm.append(speedElm);
    rootElm.append(rowElm);
  });

  return rootElm;
};

let main = () => {
  let get = getGetParameter();
  let targetSpeed = Number(get.targetspeed);

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
