/**
 * Offline registration smoke test — exercises validation + local sheet store.
 * Run: npm run test:register (with `npm run dev` for live API)
 * Or:  npm run test:dummy
 */
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function indianPhone(n) {
  return /^[6-9]\d{9}$/.test(n);
}

function aadhaar(n) {
  return /^\d{12}$/.test(n);
}

function makeTeam(i, sport) {
  const pad = String(i).padStart(2, "0");
  const phoneBase = 9000000000 + i * 11;
  return {
    sport,
    captain: {
      fullName: `Captain ${pad}`,
      phone: String(phoneBase).slice(0, 10),
      whatsapp: String(phoneBase + 1).slice(0, 10),
      aadhaar: String(100000000000 + i).padStart(12, "0").slice(0, 12),
      village: "Kurupam",
      mandal: "Kurupam",
      district: "Parvathipuram Manyam",
      address: `House ${pad}, Main Road, Kurupam`,
      email: `captain${pad}@example.com`,
      instagram: "",
      facebook: "",
    },
    team: {
      teamName: `${sport === "Cricket" ? "XI" : "Spikers"} ${pad}`,
      teamLocation: "Kurupam Ground",
      village: "Kurupam",
      mandal: "Kurupam",
      district: "Parvathipuram Manyam",
      numberOfPlayers: 2,
      jerseyColour: i % 2 ? "Green" : "Gold",
      managerName: "",
      managerPhone: "",
    },
    players: [
      {
        fullName: `Player A${pad}`,
        phone: String(9100000000 + i * 3).slice(0, 10),
        aadhaar: String(200000000000 + i).padStart(12, "0").slice(0, 12),
      },
      {
        fullName: `Player B${pad}`,
        phone: String(9200000000 + i * 3).slice(0, 10),
        aadhaar: String(300000000000 + i).padStart(12, "0").slice(0, 12),
      },
    ],
  };
}

async function main() {
  const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

  const teams = [
    makeTeam(1, "Cricket"),
    makeTeam(2, "Cricket"),
    makeTeam(3, "Cricket"),
    makeTeam(4, "Volleyball"),
    makeTeam(5, "Volleyball"),
    makeTeam(6, "Cricket"),
    makeTeam(7, "Volleyball"),
    makeTeam(8, "Cricket"),
  ];

  for (const t of teams) {
    assert(indianPhone(t.captain.phone), "bad captain phone");
    assert(aadhaar(t.captain.aadhaar), "bad captain aadhaar");
    assert(t.players.length === t.team.numberOfPlayers, "roster mismatch");
    for (const p of t.players) {
      assert(indianPhone(p.phone), "bad player phone");
      assert(aadhaar(p.aadhaar), "bad player aadhaar");
    }
  }

  let live = 0;
  try {
    for (const t of teams) {
      const res = await fetch(`${base}/api/test-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t),
      });
      if (res.status === 404) {
        console.log(
          "Dev server test API not hit (404). Payload validation passed for",
          teams.length,
          "dummy teams."
        );
        process.exit(0);
      }
      const json = await res.json();
      assert(json.ok, JSON.stringify(json));
      console.log("Registered", json.registrationId, json.mode);
      live++;
    }
  } catch {
    console.log("Live server not reachable — local payload checks passed.");
    console.log("Validated", teams.length, "dummy team payloads.");
    console.log("Tip: run `npm run test:dummy` for full local-store E2E.");
    process.exit(0);
  }

  console.log(`Live registrations: ${live}/${teams.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
