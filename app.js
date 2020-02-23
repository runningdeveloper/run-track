import {
  html,
  render,
  useState,
  useEffect
} from "//unpkg.com/htm/preact/standalone.mjs";

// random pink #ff55aa

async function getBin({ bin, secret }) {
  let response = await fetch(`https://api.jsonbin.io/b/${bin}/latest`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "secret-key": `${secret}`
    }
  });
  if (response.status !== 200) {
    throw new Error("Get Failed");
  }
  let result = await response.json();
  console.log({result});
  return result;
}

async function updateBin({ data, bin, secret }) {
  let response = await fetch(`https://api.jsonbin.io/b/${bin}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      "secret-key": `${secret}`
    }
  });
  if (response.status !== 200) {
    throw new Error("Put Failed");
  }
  let result = await response.json();
  console.log({result});
  return result;
}

const blankWeek = {
  goal: 0,
  week: 0,
  mon: 0,
  tue: 0,
  wed: 0,
  thur: 0,
  fri: 0,
  sat: 0,
  sun: 0
};

function WeeksList({ bin, secret }) {
  const [rawWeeks, setRawWeeks] = useState(null);
  const [goal, setGoal] = useState(0);

  useEffect(async () => {
    if (bin && secret) {
      const result = await getBin({ bin, secret });
      setRawWeeks(result);
    }
  }, [bin, secret]);
  return html`
    <h3>Raw Weeks List</h3>
    <ul>
      ${rawWeeks &&
        rawWeeks.weeks.map(
          a =>
            html`
              <li><pre>${JSON.stringify(a, null, 2)}</pre></li>
            `
        )}
    </ul>
    <div class="row">
      <div class="col-sm-12">
        <label for="Goal">Goal</label>
        <input
          type="number"
          id="goal"
          placeholder="goal"
          value=${goal}
          onchange=${e => setGoal(e.target.value)}
        />

        <button
          class="primary"
          onclick=${async() => {
            // lol validation
            const newWeek = { ...blankWeek };
            newWeek.goal = parseFloat(goal);
            newWeek.week = rawWeeks.weeks.length + 1;
            const newWeeks = [...rawWeeks.weeks, newWeek];
            await updateBin({
              data: { currentWeek: rawWeeks.currentWeek, weeks: newWeeks },
              bin,
              secret
            });
            // hobo soz
            location.reload()
          }}
        >
          Add week
        </button>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-12">
      <button
          class="primary"
          onclick=${async() => {
            await updateBin({
              data: { currentWeek: rawWeeks.currentWeek+1, weeks: rawWeeks.weeks },
              bin,
              secret
            });
            // hobo soz
            location.reload()
          }}
        >
          Set Next week
        </button>
      </div>
    </div>
  `;
}

function Settings({ bin: originalBin, secret: originalSecret }) {
  const [bin, setBin] = useState(originalBin);
  const [secret, setSecret] = useState(originalSecret);
  const [msg, setMsg] = useState(null);
  return html`
    <h2>Settings!</h2>
    <form
      onsubmit=${e => {
        setMsg(null);
        e.preventDefault();
        // junk validation soz
        if (bin && secret) {
          localStorage.setItem("bin", bin);
          localStorage.setItem("secret", secret);
          setMsg("Saved");
        } else {
          setMsg("Error saving");
        }
      }}
    >
      <fieldset>
        <legend>Auth</legend>
        <div class="row">
          <div class="col-sm-12 col-md-6">
            <label for="bin">Bin</label>
            <input
              type="text"
              id="bin"
              placeholder="jsonbin.io bin id"
              value=${bin}
              onchange=${e => setBin(e.target.value)}
            />
          </div>
          <div class="col-sm-12 col-md-6">
            <label for="secret">Secret</label>
            <input
              type="password"
              id="secret"
              placeholder="jsonbin.io secret key"
              value=${secret}
              onchange=${e => setSecret(e.target.value)}
            />
          </div>
        </div>
      </fieldset>
      <button class="primary" type="submit">
        Save
      </button>
      ${msg &&
        html`
          <mark class="secondary">${msg}</mark>
        `}
    </form>
    <${WeeksList} bin=${bin} secret=${secret} />
  `;
}
function WeekTotal({ bin, secret }) {
  const [current, setCurrent] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [msg, setMsg] = useState(null);
  const [day, setDay] = useState("mon");
  const [dayAmount, setDayAmount] = useState(0);

  function weekAmount({ mon, tue, wed, thur, fri, sat, sun }) {
    return Math.round(mon + tue + wed + thur + fri + sat + sun);
  }

  async function getAllData() {
    const result = await getBin({ bin, secret });
    const week = result.currentWeek;
    setCurrent(result);
    setCurrentWeek(result.weeks.find(a => a.week === week));
  }

  useEffect(() => {
    if (bin && secret) {
      getAllData();
    }
  }, [bin, secret]);

  return html`
    <h1>Total: ${currentWeek ? weekAmount(currentWeek) : 0} km</h1>
    <h2>Goal: ${currentWeek ? currentWeek.goal : 0} km</h2>
    <ul>
      <li>
        Monday
        ${currentWeek &&
          currentWeek.mon === 0 &&
          html`
            <span class="icon-alert"></span>
          `}
      </li>
      <li>
        Tuesday
        ${currentWeek &&
          currentWeek.tue === 0 &&
          html`
            <span class="icon-alert"></span>
          `}
      </li>
      <li>
        Wednesday
        ${currentWeek &&
          currentWeek.wed === 0 &&
          html`
            <span class="icon-alert"></span>
          `}
      </li>
      <li>
        Thursday
        ${currentWeek &&
          currentWeek.thur === 0 &&
          html`
            <span class="icon-alert"></span>
          `}
      </li>
      <li>
        Friday
        ${currentWeek &&
          currentWeek.fri === 0 &&
          html`
            <span class="icon-alert"></span>
          `}
      </li>
      <li>
        Saturday
        ${currentWeek &&
          currentWeek.sat === 0 &&
          html`
            <span class="icon-alert"></span>
          `}
      </li>
      <li>
        Sunday
        ${currentWeek &&
          currentWeek.sun === 0 &&
          html`
            <span class="icon-alert"></span>
          `}
      </li>
    </ul>

    <form
      onsubmit=${async e => {
        setMsg(null);
        e.preventDefault();
        // junk validation soz
        if (day && dayAmount >= 0) {
          const newWeeks = current.weeks.map(a => {
            if (a.week === current.currentWeek) {
              a[day] = parseFloat(dayAmount);
              return {
                ...a
              };
            } else {
              return { ...a };
            }
          });
          const newResult = { ...current, weeks: newWeeks };
          setMsg("sending");
          await updateBin({ data: newResult, bin, secret });
          setMsg("done");
          getAllData();
        } else {
          setMsg("input error");
        }
      }}
    >
      <div class="row">
        <div class="col-sm-12 col-md-6">
          <label for="day">Day</label>
          <select id="day" value=${day} onchange=${e => setDay(e.target.value)}>
            <option default value="mon">Monday</option>
            <option value="tue">Tuesday</option>
            <option value="wed">Wednesday</option>
            <option value="thur">Thursday</option>
            <option value="fri">Friday</option>
            <option value="sat">Saturday</option>
            <option value="sun">Sunday</option>
          </select>
        </div>
        <div class="col-sm-12 col-md-6">
          <label for="dayAmount">Amount km</label>
          <input
            type="number"
            step="0.1"
            id="dayAmount"
            placeholder="km"
            value=${dayAmount}
            onchange=${e => setDayAmount(e.target.value)}
          />
        </div>
      </div>
      <button class="primary" type="submit">
        Save
      </button>
      ${msg &&
        html`
          <mark class="secondary">${msg}</mark>
        `}
    </form>
  `;
}

function Main() {
  const [showSettings, setShowSettings] = useState(false);
  // perhaps usereducer to keep together and look if context works with this?
  const [bin, setBin] = useState(null);
  const [secret, setSecret] = useState(null);

  useEffect(() => {
    setBin(localStorage.getItem("bin"));
    setSecret(localStorage.getItem("secret"));
  }, [showSettings]);

  return html`
    <header class="sticky">
      <button onclick=${() => setShowSettings(false)} class="logo">
        Run Track
      </button>
      <button onclick=${() => setShowSettings(true)}>Settings</button>
    </header>
    ${showSettings &&
      html`
        <${Settings} bin=${bin} secret=${secret} />
      `}
    ${!showSettings &&
      html`
        <${WeekTotal} bin=${bin} secret=${secret} />
      `}
  `;
}

render(
  html`
    <${Main} />
  `,
  document.getElementById("app")
);
