const SPREADSHEET_ID = "1fZTjIFdRsZQg_KjyE5lkzp4a4dp5s_LXl7TTC3jdTXM";

const SHEET_NAME = "Sheet1";

const OWNER_EMAIL = "luanlela303@gmail.com";

const CAR_PRICES = {
  "Passat CC": 3000,
  "Ford Fiesta": 2500,
  "Mercedes Benz C-Class": 3000,
  "Golf 6": 3000,
  "Golf 6 GTI": 4500
};

const DELIVERY_PRICES = {
  "Durrës": 0,
  "Tiranë": 2500,
  "Aeroporti i Tiranës (Rinas)": 2500,
  "Kavajë": 1500,
  "Shijak": 1000,
  "Krujë": 2500,
  "Lezhë": 3500,
  "Shkodër": 5000,
  "Elbasan": 3500,
  "Fier": 4500,
  "Lushnjë": 3500,
  "Berat": 5000,
  "Vlorë": 6500,
  "Korçë": 7500,
  "Pogradec": 6500,
  "Gjirokastër": 8500,
  "Sarandë": 10000,
  "Kukës": 7000
};

const HEADERS = [
  "ID",
  "Makina",
  "Emri",
  "Telefoni",
  "Marrja",
  "Kthimi",
  "Statusi",
  "Token",
  "Ora e marrjes",
  "Ora e kthimit",
  "Vendi i dorëzimit",
  "Ditët",
  "Qiraja ALL",
  "Transporti ALL",
  "Totali ALL",
  "Shënime"
];

function getBook() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheet() {
  const sheet = getBook().getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error("Fleta Sheet1 nuk u gjet.");
  }

  return sheet;
}

function getExtraSheet(name) {
  const book = getBook();
  let sheet = book.getSheetByName(name);

  if (!sheet) {
    sheet = book.insertSheet(name);
  }

  const headers = HEADERS.filter((_, index) => index !== 7);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  sheet.setFrozenRows(1);

  return sheet;
}

function setupSheets() {
  const sheet = getSheet();

  sheet.getRange(1, 1, 1, HEADERS.length)
    .setValues([HEADERS]);

  sheet.setFrozenRows(1);

  getExtraSheet("Rezervime_Konfirmuara");
  getExtraSheet("Rezervime_Anuluara");
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function formatDate(value) {
  if (value instanceof Date && !isNaN(value)) {
    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      "yyyy-MM-dd"
    );
  }

  return String(value || "");
}

function normalizePhone(value) {
  let phone = String(value || "").replace(/\D/g, "");

  if (phone.startsWith("00355")) {
    phone = phone.slice(5);
  } else if (phone.startsWith("355")) {
    phone = phone.slice(3);
  }

  if (phone.startsWith("0")) {
    phone = phone.slice(1);
  }

  return phone;
}

function parseDateTime(date, time) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  ) {
    throw new Error("Data ose ora nuk është e vlefshme.");
  }

  const result = new Date(`${date}T${time}:00`);

  if (
    isNaN(result.getTime()) ||
    result.getFullYear() !== Number(date.slice(0, 4)) ||
    result.getMonth() + 1 !== Number(date.slice(5, 7)) ||
    result.getDate() !== Number(date.slice(8, 10)) ||
    result.getHours() !== Number(time.slice(0, 2)) ||
    result.getMinutes() !== Number(time.slice(3, 5))
  ) {
    throw new Error("Data ose ora nuk është e vlefshme.");
  }

  return result;
}

function calculateReservation(data) {
  const carPrice = CAR_PRICES[data.car];

  if (carPrice === undefined) {
    throw new Error("Makina nuk është e vlefshme.");
  }

  const deliveryPrice = DELIVERY_PRICES[data.deliveryLocation];

  if (deliveryPrice === undefined) {
    throw new Error("Vendi i dorëzimit nuk është i vlefshëm.");
  }

  const start = parseDateTime(
    data.pickup,
    data.pickupTime
  );

  const finish = parseDateTime(
    data.returnDate,
    data.returnTime
  );

  if (finish <= start) {
    throw new Error(
      "Data dhe ora e kthimit duhet të jenë pas marrjes."
    );
  }

  if (start.getTime() < Date.now() - 60000) {
    throw new Error(
      "Data e marrjes nuk mund të jetë në të kaluarën."
    );
  }

  const days = Math.ceil(
    (finish.getTime() - start.getTime()) / 86400000
  );

  const rental = days * carPrice;
  const total = rental + deliveryPrice;

  return {
    days,
    rental,
    delivery: deliveryPrice,
    total
  };
}

function reservationFromRow(row) {
  return {
    id: String(row[0] || ""),
    car: String(row[1] || ""),
    pickup: formatDate(row[4]),
    returnDate: formatDate(row[5]),
    status: String(row[6] || "PENDING"),
    pickupTime: String(row[8] || ""),
    returnTime: String(row[9] || ""),
    deliveryLocation: String(row[10] || ""),
    total: Number(row[14]) || 0
  };
}

function doGet(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};

    if (params.lookup !== "reservation") {
      return jsonResponse({
        success: false,
        message: "Kërkesë e pavlefshme."
      });
    }

    const id = String(params.id || "").trim();
    const phone = normalizePhone(params.phone);

    if (!id || !phone) {
      return jsonResponse({
        success: false,
        message: "Vendos ID-në dhe numrin e telefonit."
      });
    }

    const sheet = getSheet();
    const rows = sheet.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      if (
        String(row[0]).trim() === id &&
        normalizePhone(row[3]) === phone
      ) {
        return jsonResponse({
          success: true,
          reservation: reservationFromRow(row)
        });
      }
    }

    return jsonResponse({
      success: false,
      message: "Rezervimi nuk u gjet. Kontrollo të dhënat."
    });

  } catch (error) {
    return jsonResponse({
      success: false,
      message: "Gabim gjatë kontrollit të rezervimit."
    });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Nuk u dërguan të dhëna.");
    }

    const data = JSON.parse(e.postData.contents);

    const name = String(data.name || "").trim();
    const phone = String(data.phone || "").trim();
    const notes = String(data.notes || "").trim();

    if (!name || !phone || !normalizePhone(phone)) {
      throw new Error("Emri ose numri i telefonit mungon.");
    }

    if (name.length > 150 || notes.length > 2000) {
      throw new Error("Të dhënat janë shumë të gjata.");
    }

    const totals = calculateReservation(data);

    lock.waitLock(30000);

    const id = "LR-" + Date.now() + "-" +
      Utilities.getUuid().slice(0, 6).toUpperCase();

    const token = Utilities.getUuid();

    const row = [
      id,
      data.car,
      name,
      "'" + phone,
      "'" + data.pickup,
      "'" + data.returnDate,
      "PENDING",
      token,
      "'" + data.pickupTime,
      "'" + data.returnTime,
      data.deliveryLocation,
      totals.days,
      totals.rental,
      totals.delivery,
      totals.total,
      notes
    ];

    const sheet = getSheet();

    sheet.appendRow(row);
    SpreadsheetApp.flush();

    lock.releaseLock();

    try {
      sendReservationEmail({
        id,
        car: data.car,
        name,
        phone,
        pickup: data.pickup,
        returnDate: data.returnDate,
        pickupTime: data.pickupTime,
        returnTime: data.returnTime,
        deliveryLocation: data.deliveryLocation,
        notes,
        ...totals
      });
    } catch (emailError) {
      console.error("Emaili nuk u dërgua: " + emailError);
    }

    return jsonResponse({
      success: true,
      id,
      status: "PENDING",
      total: totals.total,
      message: "Rezervimi u regjistrua me sukses."
    });

  } catch (error) {
    return jsonResponse({
      success: false,
      message: error.message
    });

  } finally {
    if (lock.hasLock()) {
      lock.releaseLock();
    }
  }
}

function sendReservationEmail(data) {
  const subject = "Rezervim i ri - " + data.id;

  const body = [
    "REZERVIM I RI - LUANI CAR RENTAL",
    "",
    "ID: " + data.id,
    "Makina: " + data.car,
    "Emri: " + data.name,
    "Telefoni: " + data.phone,
    "",
    "Data e marrjes: " + data.pickup,
    "Ora e marrjes: " + data.pickupTime,
    "",
    "Data e kthimit: " + data.returnDate,
    "Ora e kthimit: " + data.returnTime,
    "",
    "Vendi i dorëzimit: " + data.deliveryLocation,
    "",
    "Ditët e qirasë: " + data.days,
    "Çmimi i qirasë: " + data.rental + " ALL",
    "Transporti: " + data.delivery + " ALL",
    "TOTALI: " + data.total + " ALL",
    "",
    "Shënime: " + (data.notes || "Nuk ka"),
    "",
    "Statusi: PENDING"
  ].join("\n");

  MailApp.sendEmail({
    to: OWNER_EMAIL,
    subject,
    body
  });
}

function syncStatusRow(row, status) {
  const confirmed = getExtraSheet("Rezervime_Konfirmuara");
  const cancelled = getExtraSheet("Rezervime_Anuluara");

  const target =
    status === "CONFIRMED" ? confirmed : cancelled;

  const values = row.filter((_, index) => index !== 7);

  [confirmed, cancelled].forEach(sheet => {
    const rows = sheet.getDataRange().getValues();

    for (let i = rows.length - 1; i >= 1; i--) {
      if (String(rows[i][0]) === String(row[0])) {
        sheet.deleteRow(i + 1);
      }
    }
  });

  target.appendRow(values);
}

function updateReservationStatus(id, newStatus) {
  const allowed = ["PENDING", "CONFIRMED", "CANCELLED"];

  if (!allowed.includes(newStatus)) {
    throw new Error("Status i pavlefshëm.");
  }

  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.getRange(i + 1, 7).setValue(newStatus);

      const updated = sheet.getRange(
        i + 1,
        1,
        1,
        HEADERS.length
      ).getValues()[0];

      if (
        newStatus === "CONFIRMED" ||
        newStatus === "CANCELLED"
      ) {
        syncStatusRow(updated, newStatus);
      } else {
        ["Rezervime_Konfirmuara", "Rezervime_Anuluara"]
          .forEach(name => {
            const extra = getExtraSheet(name);
            const values = extra.getDataRange().getValues();

            for (let j = values.length - 1; j >= 1; j--) {
              if (String(values[j][0]) === String(id)) {
                extra.deleteRow(j + 1);
              }
            }
          });
      }

      return "Statusi u përditësua: " + newStatus;
    }
  }

  throw new Error("Rezervimi nuk u gjet.");
}
