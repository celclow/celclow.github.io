class Utils {
  static round(v, l) {
    return Math.round(v * 10 ** l) / 10 ** l;
  }
  static getGetParameter(query_) {
    let query = query_.replace(/^\?/, "");
    let params = {};
    query.split("&").forEach(s => {
      let param = s.split("=", 2);
      let key = param[0];
      let value = param[1];
      if (key && value) params[key] = value;
    });

    return params;
  }
}

class SpeedCalculator {
  // [0.5, 0.75, 1, 1.25, ..., 4.75, 5]
  static SPEED_LIST = [...Array(20 + 1).keys()].map(v => v * 0.25).slice(2);
  static MIN_BPM = 60;
  static MAX_BPM = 250;

  targetSpeed = null;

  constructor(targetSpeed) {
    this.targetSpeed = targetSpeed;
  }

  getSpeedList() {
    let speedList = [];

    for (let i = 0; i < SpeedCalculator.SPEED_LIST.length; i++) {
      let row = {};

      row.speed = SpeedCalculator.SPEED_LIST[i];
      row.lowBpm = Utils.round(
        this.targetSpeed /
          ((SpeedCalculator.SPEED_LIST[i] + SpeedCalculator.SPEED_LIST[i + 1]) /
            2),
        3
      );
      row.midBpm = Utils.round(
        this.targetSpeed / SpeedCalculator.SPEED_LIST[i],
        3
      );
      row.highBpm = Utils.round(
        this.targetSpeed /
          ((SpeedCalculator.SPEED_LIST[i - 1] + SpeedCalculator.SPEED_LIST[i]) /
            2),
        3
      );

      speedList.push(row);
    }

    return speedList;
  }

  getBpmList() {
    let bpmList = [];

    for (
      let bpm = SpeedCalculator.MIN_BPM;
      bpm <= SpeedCalculator.MAX_BPM;
      bpm++
    ) {
      let row = {};

      row.bpm = bpm;
      row.speed = Utils.round(this.targetSpeed / bpm, 3);

      // mark
      row.mark = false;
      SpeedCalculator.SPEED_LIST.forEach(speed => {
        if (
          this.targetSpeed / (bpm + 1) < speed &&
          speed <= this.targetSpeed / bpm
        ) {
          row.mark = true;
        }
      });

      bpmList.push(row);
    }

    return bpmList;
  }

  getNealySpeed(bpm) {
    let speed;
    this.getSpeedList().forEach(row => {
      if ((row.lowBpm || 0) <= bpm && bpm < (row.highBpm || 9999)) {
        speed = row.speed;
      }
    });

    return speed;
  }
}

class VoiceRecognition {
  constructor(speedCalculator) {
    this.synthesisUtterance = new SpeechSynthesisUtterance();
    this.speedCalculator = speedCalculator;
  }

  start() {
    let SpeechRecognition = webkitSpeechRecognition || SpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.onresult = event => this.success(event);
    this.recognition.onsoundend = event => this.start(event);
    this.recognition.onspeechend = event => this.start(event);
    this.recognition.onerror = event => this.start(event);
    this.recognition.start();
  }

  stop(event) {
    // console.log(event);
    this.recognition.stop();
  }

  success(event) {
    // console.log(event);
    let result = event.results[event.resultIndex];
    // console.log("success: " + result[0].transcript);
    if (result.isFinal) {
      this.analyze(result[0].transcript);
    }

    this.start();
  }

  analyze(text) {
    console.log(text);
    if (text.match(/^\d+$/)) {
      let bpm = Number(text);
      let speed = this.speedCalculator.getNealySpeed(bpm);
      this.say("ビーピーエム" + bpm + "の推奨スピードは" + speed + "です");
    }
  }

  say(text) {
    this.synthesisUtterance.text = text;
    speechSynthesis.speak(this.synthesisUtterance);
  }
}

class ElementCreator {
  static setForm(targetSpeed) {
    document.getElementById("settings-targetspeed").value = targetSpeed;
  }

  static createSpeedList(speedCalculator) {
    /* return sample
      <li>
        <ul class="row">
          <li>1.00</li>
          <li>600</li>
        </ul>
      </li>
  */
    let rootElm = document.createElement("li");

    speedCalculator.getSpeedList().forEach(row => {
      let rowElm = document.createElement("ul");
      rowElm.classList.add("row");

      let speedElm = document.createElement("li");
      let lowBpmElm = document.createElement("li");
      let midBpmElm = document.createElement("li");
      let highBpmElm = document.createElement("li");

      speedElm.append(row.speed);
      lowBpmElm.append(row.lowBpm || "");
      midBpmElm.append(row.midBpm);
      highBpmElm.append(row.highBpm || "");

      rowElm.append(speedElm);
      rowElm.append(lowBpmElm);
      rowElm.append(midBpmElm);
      rowElm.append(highBpmElm);
      rootElm.append(rowElm);
    });

    return rootElm;
  }

  static createBpmList(speedCalculator) {
    /* return sample
      <li>
        <ul class="row">
          <li>200</li>
          <li>3.00</li>
        </ul>
      </li>
  */
    let rootElm = document.createElement("li");

    speedCalculator.getBpmList().forEach(row => {
      let rowElm = document.createElement("ul");
      rowElm.classList.add("row");

      let bpmElm = document.createElement("li");
      let speedElm = document.createElement("li");

      bpmElm.append(row.bpm);
      speedElm.append(
        row.speed // + ", " + speedCalculator.getNealySpeed(row.bpm)
      );
      if (row.mark) {
        speedElm.classList.add("mark");
      }

      rowElm.append(bpmElm);
      rowElm.append(speedElm);
      rootElm.append(rowElm);
    });

    return rootElm;
  }
}

let main = () => {
  let get = Utils.getGetParameter(location.search);
  let targetSpeed = Number(get.targetspeed);

  // guard
  if (!targetSpeed) {
    return;
  }

  ElementCreator.setForm(targetSpeed);
  let speedCalculator = new SpeedCalculator(targetSpeed);

  let speedListElm = document.getElementById("speed-list");
  speedListElm.append(ElementCreator.createSpeedList(speedCalculator));

  let bpmListElm = document.getElementById("bpm-list");
  bpmListElm.append(ElementCreator.createBpmList(speedCalculator));

  let voiceRecognition = new VoiceRecognition(speedCalculator);
  document.getElementById("settings_voice_toggle_on").onclick = event => {
    voiceRecognition.start();
  };
  document.getElementById("settings_voice_toggle_off").onclick = event => {
    voiceRecognition.stop();
  };
};

main();
