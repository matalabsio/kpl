/**
 * KPL Registration — Google Apps Script (premium sheet + webhook)
 *
 * HOW TO INSTALL (in your KPL Registrations spreadsheet):
 * 1. Open: https://docs.google.com/spreadsheets/d/1gOVbpA1RjZ-HeC6R-0Hh4irqlYM_ybXURxcPY1CccpI/edit
 * 2. Extensions → Apps Script
 * 3. Delete any default code, paste THIS entire file
 * 4. Save (Ctrl/Cmd+S) — name project "KPL Registration"
 * 5. Select formatAllSheets_ → Run (authorizes + styles existing data)
 * 6. Before launch: select clearAllRegistrationData_ → Run (wipes test rows)
 * 7. Deploy → New deployment (or Manage deployments → Edit → New version)
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 8. Copy the Web app URL → .env.local as GOOGLE_APPS_SCRIPT_URL
 * 9. Restart: npm run dev
 *
 * Brand (TDP flag): yellow #FFFF00 > red #DA3925 > green #2F5C2F · white · black #2B2626
 */

var BRAND = {
  yellow: "#FFFF00",
  red: "#DA3925",
  green: "#2F5C2F",
  black: "#2B2626",
  white: "#FFFFFF",
  cream: "#FFFDE6",
  rowAlt: "#FFF9CC",
  cricket: "#FFF9CC",
  volleyball: "#FCE8E6",
  dupe: "#FCE8E6",
  /* aliases used below */
  gold: "#FFFF00",
  navy: "#2B2626",
};

var TEAM_HEADERS = [
  "Registration ID",
  "Team ID",
  "Registration Date",
  "Sport",
  "Team Name",
  "Captain Name",
  "Captain Phone",
  "Captain WhatsApp",
  "Captain Aadhaar",
  "Email",
  "Village",
  "Mandal",
  "District",
  "Full Address",
  "Team Manager",
  "Manager Phone",
  "Jersey Colour",
  "Number of Players",
  "Team Logo",
  "Team Photo",
  "Instagram",
  "Facebook",
  "Status",
  "DuplicateFlags",
  "Team Location",
];

var PLAYER_HEADERS = [
  "Player ID",
  "Registration ID",
  "Team ID",
  "Team Name",
  "Sport",
  "Player Name",
  "Player Phone",
  "Player Aadhaar",
  "Registration Date",
];

function doGet() {
  return json_({
    ok: true,
    message: "KPL registration webhook is live. Use POST to submit.",
  });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body && body.action === "clearAll") {
      return json_(clearAllRegistrationData_());
    }
    if (body && body.action === "formatAll") {
      formatAllSheets_();
      return json_({ ok: true, action: "formatAll" });
    }
    var result = saveRegistration_(body);
    return json_(result);
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function saveRegistration_(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var teams = ensureSheet_(ss, "Teams", TEAM_HEADERS);
  var players = ensureSheet_(ss, "Players", PLAYER_HEADERS);
  ensureDashboard_(ss);

  var sport = data.sport || "Cricket";
  var prefix = sport === "Volleyball" ? "V" : "C";
  var registrationId = nextId_(teams, prefix);
  var teamId = registrationId;
  var date = new Date().toISOString();
  var flags = findDuplicates_(teams, players, data);
  var captain = data.captain || {};
  var team = data.team || {};
  var roster = data.players || [];

  teams.appendRow([
    registrationId,
    teamId,
    date,
    sport,
    team.teamName || "",
    captain.fullName || "",
    captain.phone || "",
    captain.whatsapp || "",
    captain.aadhaar || "",
    captain.email || "",
    team.village || captain.village || "",
    team.mandal || captain.mandal || "",
    team.district || captain.district || "",
    captain.address || "",
    team.managerName || "",
    team.managerPhone || "",
    team.jerseyColour || "",
    String(roster.length),
    team.teamLogo || "",
    team.teamPhoto || "",
    captain.instagram || "",
    captain.facebook || "",
    "Submitted",
    flags,
    team.teamLocation || "",
  ]);

  for (var i = 0; i < roster.length; i++) {
    var p = roster[i];
    players.appendRow([
      "P" + pad3_(i + 1),
      registrationId,
      teamId,
      team.teamName || "",
      sport,
      p.fullName || "",
      p.phone || "",
      p.aadhaar || "",
      date,
    ]);
  }

  formatDataSheet_(teams, TEAM_HEADERS.length, 4, 24);
  formatDataSheet_(players, PLAYER_HEADERS.length, 5, -1);
  refreshDashboard_(ss);

  return {
    ok: true,
    registrationId: registrationId,
    teamId: teamId,
    duplicateFlags: flags,
    mode: "appscript",
  };
}

function ensureSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    var first = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    if (!first[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }
  return sheet;
}

/** Run from editor after paste — styles all tabs + builds Dashboard. */
function formatAllSheets_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  hideDefaultSheet_(ss);
  var teams = ensureSheet_(ss, "Teams", TEAM_HEADERS);
  var players = ensureSheet_(ss, "Players", PLAYER_HEADERS);
  formatDataSheet_(teams, TEAM_HEADERS.length, 4, 24);
  formatDataSheet_(players, PLAYER_HEADERS.length, 5, -1);
  ensureDashboard_(ss);
  refreshDashboard_(ss);
}

/**
 * Run from editor before public launch — keeps headers, removes all data rows.
 * Also callable via POST { "action": "clearAll" } after redeploy.
 */
function clearAllRegistrationData_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var teams = ss.getSheetByName("Teams");
  var players = ss.getSheetByName("Players");
  if (teams && teams.getLastRow() > 1) {
    teams.deleteRows(2, teams.getLastRow() - 1);
  }
  if (players && players.getLastRow() > 1) {
    players.deleteRows(2, players.getLastRow() - 1);
  }
  ensureSheet_(ss, "Teams", TEAM_HEADERS);
  ensureSheet_(ss, "Players", PLAYER_HEADERS);
  formatDataSheet_(teams || ensureSheet_(ss, "Teams", TEAM_HEADERS), TEAM_HEADERS.length, 4, 24);
  formatDataSheet_(players || ensureSheet_(ss, "Players", PLAYER_HEADERS), PLAYER_HEADERS.length, 5, -1);
  refreshDashboard_(ss);
  return {
    ok: true,
    action: "clearAll",
    message: "All registration rows cleared. IDs will restart at 001.",
  };
}

function hideDefaultSheet_(ss) {
  var sheet1 = ss.getSheetByName("Sheet1");
  if (sheet1 && ss.getSheets().length > 1) {
    try {
      sheet1.hideSheet();
    } catch (e) {
      /* ignore */
    }
  }
}

function formatDataSheet_(sheet, headerCount, sportCol, dupeCol) {
  if (!sheet) return;
  var lastCol = Math.max(headerCount, sheet.getLastColumn() || headerCount);
  var lastRow = Math.max(sheet.getLastRow(), 1);

  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headerCount)
    .setBackground(BRAND.yellow)
    .setFontColor(BRAND.black)
    .setFontWeight("bold")
    .setFontFamily("Arial")
    .setFontSize(10);

  if (lastRow >= 2) {
    var dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
    dataRange.setFontFamily("Arial").setFontSize(10).setBackground(BRAND.white);
    for (var r = 2; r <= lastRow; r++) {
      if (r % 2 === 0) {
        sheet.getRange(r, 1, 1, lastCol).setBackground(BRAND.rowAlt);
      }
    }
  }

  sheet.clearConditionalFormatRules();
  var rules = [];
  var sportRange = sheet.getRange(2, sportCol, Math.max(lastRow - 1, 1), 1);
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Cricket")
      .setBackground(BRAND.cricket)
      .setRanges([sportRange])
      .build()
  );
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Volleyball")
      .setBackground(BRAND.volleyball)
      .setRanges([sportRange])
      .build()
  );
  if (dupeCol > 0) {
    var dupeRange = sheet.getRange(2, dupeCol, Math.max(lastRow - 1, 1), 1);
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenCellNotEmpty()
        .setBackground(BRAND.dupe)
        .setRanges([dupeRange])
        .build()
    );
  }
  sheet.setConditionalFormatRules(rules);

  try {
    sheet.getRange(1, 1, Math.max(lastRow, 1), headerCount).createFilter();
  } catch (e) {
    /* filter may already exist */
  }

  autoSizeColumns_(sheet, headerCount);
}

function autoSizeColumns_(sheet, count) {
  for (var c = 1; c <= count; c++) {
    sheet.autoResizeColumn(c);
    var w = sheet.getColumnWidth(c);
    if (w < 80) sheet.setColumnWidth(c, 80);
    if (w > 220) sheet.setColumnWidth(c, 220);
  }
}

function ensureDashboard_(ss) {
  var sheet = ss.getSheetByName("Dashboard");
  if (!sheet) {
    sheet = ss.insertSheet("Dashboard", 0);
  }
  return sheet;
}

function refreshDashboard_(ss) {
  // Recreate sheet so old merges / charts / spill errors cannot linger
  var existing = ss.getSheetByName("Dashboard");
  if (existing) {
    ss.deleteSheet(existing);
  }
  var sheet = ss.insertSheet("Dashboard", 0);
  sheet.setHiddenGridlines(true);
  sheet.setTabColor(BRAND.yellow);

  // Chart source on a dedicated hidden tab (avoids layout collisions + blank charts)
  var chartData = ensureChartData_(ss);

  // Fixed column widths — keeps blocks aligned
  var widths = [170, 130, 110, 170, 150, 90];
  for (var w = 0; w < widths.length; w++) {
    sheet.setColumnWidth(w + 1, widths[w]);
  }

  // —— Header ——
  sheet.getRange("A1:F1").merge();
  sheet
    .getRange("A1")
    .setValue("KURUPAM PREMIER LEAGUE · REGISTRATIONS")
    .setBackground(BRAND.black)
    .setFontColor(BRAND.yellow)
    .setFontWeight("bold")
    .setFontSize(18)
    .setFontFamily("Arial")
    .setVerticalAlignment("middle")
    .setHorizontalAlignment("left");
  sheet.setRowHeight(1, 48);

  sheet.getRange("A2:F2").merge();
  sheet
    .getRange("A2")
    .setFormula('="Last updated: "&TEXT(NOW(),"yyyy-mm-dd HH:mm")')
    .setBackground(BRAND.yellow)
    .setFontColor(BRAND.black)
    .setFontSize(10)
    .setVerticalAlignment("middle");
  sheet.setRowHeight(2, 28);

  // —— KPIs (A–B only) ——
  sheet.getRange("A4").setValue("KEY METRICS").setFontWeight("bold").setFontColor(BRAND.black).setFontSize(12);
  var kpis = [
    ["Total Teams", '=COUNTA(Teams!A2:A)'],
    ["Cricket Teams", '=COUNTIF(Teams!D:D,"Cricket")'],
    ["Volleyball Teams", '=COUNTIF(Teams!D:D,"Volleyball")'],
    ["Total Players", '=COUNTA(Players!A2:A)'],
    ["Today's Registrations", '=COUNTIF(Teams!C:C,TEXT(TODAY(),"yyyy-mm-dd")&"*")'],
    ["Flagged Duplicates", '=COUNTIFS(Teams!X2:X,"<>")'],
  ];
  sheet.getRange("A5:B10").setValues(kpis);
  sheet.getRange("A5:A10").setFontWeight("bold").setBackground(BRAND.cream);
  sheet.getRange("B5:B10").setFontSize(14).setFontWeight("bold").setFontColor(BRAND.black).setHorizontalAlignment("center");
  sheet.getRange("A5:B10").setBorder(true, true, true, true, true, true, BRAND.yellow, SpreadsheetApp.BorderStyle.SOLID);

  // —— Latest teams (A–F) — reserved spill area A14:F23 ——
  sheet.getRange("A12").setValue("LATEST TEAMS").setFontWeight("bold").setFontColor(BRAND.black).setFontSize(12);
  sheet.getRange("A13:F13").setValues([["Registration ID", "Date", "Sport", "Team Name", "Captain", "Players"]]);
  sheet.getRange("A13:F13").setBackground(BRAND.yellow).setFontColor(BRAND.black).setFontWeight("bold");
  sheet.getRange("A14").setFormula(
    '=IF(COUNTA(Teams!A2:A)=0,"No teams yet",IFERROR(QUERY(Teams!A2:R,"select A, C, D, E, F, R order by C desc limit 10",0),"No teams yet"))'
  );
  sheet.getRange("A14:F23").setBorder(true, true, true, true, false, false, BRAND.yellow, SpreadsheetApp.BorderStyle.SOLID);

  // —— Duplicates ——
  sheet.getRange("A25").setValue("DUPLICATES TO REVIEW").setFontWeight("bold").setFontColor(BRAND.black).setFontSize(12);
  sheet.getRange("A26:E26").setValues([["Registration ID", "Team Name", "Captain", "Phone", "Flags"]]);
  sheet.getRange("A26:E26").setBackground(BRAND.yellow).setFontColor(BRAND.black).setFontWeight("bold");
  sheet.getRange("A27").setFormula(
    '=IF(COUNTIFS(Teams!X2:X,"<>")=0,"None — all clear",IFERROR(QUERY(Teams!A2:X,"select A, E, F, G, X where X is not null and X <> \'\' order by C desc",0),"None — all clear"))'
  );
  sheet.getRange("A27:E36").setBorder(true, true, true, true, false, false, BRAND.yellow, SpreadsheetApp.BorderStyle.SOLID);

  // —— Roster lookup ——
  sheet.getRange("A38").setValue("TEAM ROSTER LOOKUP").setFontWeight("bold").setFontColor(BRAND.black).setFontSize(12);
  sheet.getRange("A39").setValue("Select Registration ID →").setFontWeight("bold");
  sheet.getRange("B39").setBackground(BRAND.yellow).setFontWeight("bold").setFontColor(BRAND.black).setBorder(true, true, true, true, true, true, BRAND.black, SpreadsheetApp.BorderStyle.SOLID);

  var teamsSheet = ss.getSheetByName("Teams");
  if (teamsSheet) {
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(teamsSheet.getRange("A2:A"), true)
      .setAllowInvalid(true)
      .setHelpText("Pick a Registration ID to see the full roster")
      .build();
    sheet.getRange("B39").setDataValidation(rule);
  }

  sheet.getRange("A40:D40").setValues([["Player ID", "Player Name", "Phone", "Aadhaar"]]);
  sheet.getRange("A40:D40").setBackground(BRAND.yellow).setFontColor(BRAND.black).setFontWeight("bold");
  sheet.getRange("A41").setFormula(
    '=IF(B39="","Pick an ID above",IFERROR(FILTER(Players!A2:A,Players!B2:B=B39),"No players"))'
  );
  sheet.getRange("B41").setFormula(
    '=IF(B39="","",IFERROR(FILTER(Players!F2:F,Players!B2:B=B39),""))'
  );
  sheet.getRange("C41").setFormula(
    '=IF(B39="","",IFERROR(FILTER(Players!G2:G,Players!B2:B=B39),""))'
  );
  sheet.getRange("D41").setFormula(
    '=IF(B39="","",IFERROR(FILTER(Players!H2:H,Players!B2:B=B39),""))'
  );
  sheet.getRange("A41:D55").setBorder(true, true, true, true, false, false, BRAND.yellow, SpreadsheetApp.BorderStyle.SOLID);

  upsertCharts_(sheet, chartData);
}

function ensureChartData_(ss) {
  var sheet = ss.getSheetByName("_ChartData");
  if (!sheet) {
    sheet = ss.insertSheet("_ChartData");
  }
  sheet.clear();
  sheet.getRange("A1:B1").setValues([["Sport", "Count"]]);
  sheet.getRange("A2").setValue("Cricket");
  sheet.getRange("B2").setFormula('=COUNTIF(Teams!D:D,"Cricket")');
  sheet.getRange("A3").setValue("Volleyball");
  sheet.getRange("B3").setFormula('=COUNTIF(Teams!D:D,"Volleyball")');
  sheet.getRange("A5:B5").setValues([["Day", "Teams"]]);
  for (var d = 0; d < 14; d++) {
    var row = 6 + d;
    sheet.getRange(row, 1).setFormula("=TEXT(TODAY()-" + (13 - d) + ',"yyyy-mm-dd")');
    sheet.getRange(row, 2).setFormula('=COUNTIF(Teams!C:C,A' + row + '&"*")');
  }
  try {
    sheet.hideSheet();
  } catch (e) {
    /* ignore */
  }
  return sheet;
}

function upsertCharts_(sheet, chartData) {
  var charts = sheet.getCharts();
  for (var i = 0; i < charts.length; i++) {
    sheet.removeChart(charts[i]);
  }

  var pie = sheet
    .newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(chartData.getRange("A1:B3"))
    .setOption("title", "Cricket vs Volleyball")
    .setOption("colors", [BRAND.yellow, BRAND.red])
    .setOption("legend", { position: "bottom" })
    .setOption("width", 380)
    .setOption("height", 230)
    .setPosition(4, 4, 0, 0)
    .build();
  sheet.insertChart(pie);

  var bar = sheet
    .newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(chartData.getRange("A5:B19"))
    .setOption("title", "Registrations — last 14 days")
    .setOption("colors", [BRAND.green])
    .setOption("legend", { position: "none" })
    .setOption("hAxis", { slantedText: true, slantedTextAngle: 45 })
    .setOption("width", 420)
    .setOption("height", 230)
    .setPosition(4, 6, 20, 0)
    .build();
  sheet.insertChart(bar);
}

function nextId_(teamsSheet, prefix) {
  var pattern = "KPL-" + prefix + "-";
  var values = teamsSheet.getRange("A2:A").getValues();
  var max = 0;
  for (var i = 0; i < values.length; i++) {
    var id = String(values[i][0] || "");
    if (id.indexOf(pattern) === 0) {
      var n = parseInt(id.slice(pattern.length), 10);
      if (!isNaN(n) && n > max) max = n;
    }
  }
  return pattern + pad3_(max + 1);
}

function findDuplicates_(teamsSheet, playersSheet, data) {
  var parts = [];
  var captain = data.captain || {};
  var team = data.team || {};
  var roster = data.players || [];

  var teamRows = teamsSheet.getDataRange().getValues();
  var playerRows = playersSheet.getDataRange().getValues();

  for (var i = 1; i < teamRows.length; i++) {
    if (String(teamRows[i][6]) === String(captain.phone)) {
      parts.push("duplicate_captain_phone");
      break;
    }
  }
  var teamName = String(team.teamName || "")
    .trim()
    .toLowerCase();
  for (var j = 1; j < teamRows.length; j++) {
    if (String(teamRows[j][4] || "").trim().toLowerCase() === teamName && teamName) {
      parts.push("duplicate_team_name");
      break;
    }
  }

  var phoneDupes = [];
  var aadhaarDupes = [];
  for (var p = 0; p < roster.length; p++) {
    var phone = String(roster[p].phone || "");
    var aadhaar = String(roster[p].aadhaar || "");
    for (var r = 1; r < playerRows.length; r++) {
      if (phone && String(playerRows[r][6]) === phone) phoneDupes.push(phone);
      if (aadhaar && String(playerRows[r][7]) === aadhaar) aadhaarDupes.push(aadhaar);
    }
    for (var t = 1; t < teamRows.length; t++) {
      if (aadhaar && String(teamRows[t][8]) === aadhaar) aadhaarDupes.push(aadhaar);
    }
  }
  if (captain.aadhaar) {
    for (var t2 = 1; t2 < teamRows.length; t2++) {
      if (String(teamRows[t2][8]) === String(captain.aadhaar)) {
        aadhaarDupes.push(String(captain.aadhaar));
      }
    }
  }

  phoneDupes = unique_(phoneDupes);
  aadhaarDupes = unique_(aadhaarDupes);
  if (phoneDupes.length) parts.push("duplicate_player_phone:" + phoneDupes.join("|"));
  if (aadhaarDupes.length) parts.push("duplicate_aadhaar:" + aadhaarDupes.join("|"));

  return parts.join("; ");
}

function unique_(arr) {
  var out = [];
  var seen = {};
  for (var i = 0; i < arr.length; i++) {
    if (!seen[arr[i]]) {
      seen[arr[i]] = true;
      out.push(arr[i]);
    }
  }
  return out;
}

function pad3_(n) {
  var s = String(n);
  while (s.length < 3) s = "0" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/** Manual test from the Apps Script editor: select runTest_ → Run */
function runTest_() {
  var result = saveRegistration_({
    sport: "Cricket",
    captain: {
      fullName: "Test Captain",
      phone: "9876543210",
      whatsapp: "9876543210",
      aadhaar: "123456789012",
      village: "Kurupam",
      mandal: "Kurupam",
      district: "Parvathipuram Manyam",
      address: "Test address, Kurupam",
      email: "test@example.com",
      instagram: "",
      facebook: "",
    },
    team: {
      teamName: "KPL Test XI",
      teamLocation: "Kurupam Ground",
      village: "Kurupam",
      mandal: "Kurupam",
      district: "Parvathipuram Manyam",
      jerseyColour: "Green",
      managerName: "",
      managerPhone: "",
      teamLogo: "",
      teamPhoto: "",
    },
    players: [
      {
        fullName: "Test Player One",
        phone: "9123456780",
        aadhaar: "234567890123",
      },
      {
        fullName: "Test Player Two",
        phone: "9123456781",
        aadhaar: "345678901234",
      },
    ],
  });
  Logger.log(JSON.stringify(result));
}
