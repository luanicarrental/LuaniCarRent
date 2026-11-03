const cars = [
  {
    id: "car1",
    name: "Passat CC",
    price: 3000,
    images: [
      "images/passatcc1.jpeg",
      "images/passatcc2.jpeg",
      "images/passatcc3.jpeg",
      "images/passatcc4.jpeg",
      "images/passatcc5.jpeg",
      "images/passatcc6.jpeg",
      "images/passatcc.jpeg"
    ],
    details: "2.0 nafte / Kambio Automatike / Viti-2011"
  },
  {
    id: "car2",
    name: "Ford Fiesta",
    price: 2500,
    images: [
      "images/car1 (2).jpeg",
      "images/car1 (1).jpeg",
      "images/car1 (3).jpeg",
      "images/car1 (4).jpeg",
      "images/car1 (5).jpeg",
      "images/car1 (7).jpeg",
      "images/car1 (6).jpeg"
    ],
    details: "1.3 Benzin/Gaz / Kambio Manuale / Viti-2011"
  },
  {
    id: "car3",
    name: "Mercedes Benz C-Class",
    price: 3000,
    images: [
      "images/car2 (2).jpeg",
      "images/car2 (1).jpeg",
      "images/car2 (3).jpeg",
      "images/car2 (4).jpeg",
      "images/car2 (5).jpeg",
      "images/car2 (7).jpeg",
      "images/car2 (6).jpeg"
    ],
    details: "2.0 nafte / Kambio Automatike / Viti-2009"
  },
  {
    id: "car4",
    name: "Golf 6",
    price: 3000,
    images: [
      "images/car3 (2).jpeg",
      "images/car3 (1).jpeg",
      "images/car3 (3).jpeg",
      "images/car3 (4).jpeg",
      "images/car3 (5).jpeg",
      "images/car3 (7).jpeg",
      "images/car3 (6).jpeg"
       ],
    details: "2.0 benzine-gaz / Kambio Automatike / Viti-2013"
  },
  {
    id: "car5",
    name: "Golf 6 GTI",
    price: 4500,
    images: [
      "images/golf6gti (1).jpeg",
      "images/golf6gti (2).jpeg",
      "images/golf6gti (3).jpeg",
      "images/golf6gti (4).jpeg",
      "images/golf6gti (5).jpeg",
      "images/golf6gti (6).jpeg"
    ],
    details: "2.0 nafte / Kambio Automatike / Viti-2013"
  }
];

const API_URL =
  "https://script.google.com/macros/s/AKfycbwtKcXok0e2rK2Q4QAtY5h74cFQ0IjT4F3zQF-rLBykP5Nh2ispX3izQH8Lvv42Nv-Bug/exec";

const deliveryPrices = {
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

const carGrid = document.getElementById("carGrid");
const selectedCar = document.getElementById("selectedCar");
const bookingForm = document.getElementById("bookingForm");
const message = document.getElementById("formMessage");

const pickupDate = document.getElementById("pickupDate");
const returnDate = document.getElementById("returnDate");
const pickupTime = document.getElementById("pickupTime");
const returnTime = document.getElementById("returnTime");
const deliveryLocation = document.getElementById("deliveryLocation");

const money = amount =>
  `${Number(amount).toLocaleString("sq-AL")} ALL`;

cars.forEach(car => {
  const card = document.createElement("article");
  card.className = "car-card";

  const gallery = document.createElement("div");
  gallery.className = "car-gallery";

  let currentImageIndex = 0;

  const image = document.createElement("img");
  image.src = car.images[0];
  image.alt = car.name;
  image.loading = "lazy";

  const previousButton = document.createElement("button");
  previousButton.type = "button";
  previousButton.className = "gallery-prev";
  previousButton.textContent = "❮";
  previousButton.setAttribute("aria-label", "Fotoja e mëparshme");

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "gallery-next";
  nextButton.textContent = "❯";
  nextButton.setAttribute("aria-label", "Fotoja tjetër");

  const imageCounter = document.createElement("span");
  imageCounter.className = "gallery-counter";

  function updateImage() {
    image.src = car.images[currentImageIndex];
    imageCounter.textContent =
      `${currentImageIndex + 1} / ${car.images.length}`;
  }

  previousButton.addEventListener("click", () => {
    currentImageIndex =
      (currentImageIndex - 1 + car.images.length) % car.images.length;
    updateImage();
  });

  nextButton.addEventListener("click", () => {
    currentImageIndex =
      (currentImageIndex + 1) % car.images.length;
    updateImage();
  });

  updateImage();

  gallery.append(
    image,
    previousButton,
    nextButton,
    imageCounter
  );

  const info = document.createElement("div");
  info.className = "car-info";

  const title = document.createElement("h3");
  title.textContent = car.name;

  const details = document.createElement("p");
  details.textContent = car.details;

  const price = document.createElement("p");
  price.className = "car-price";
  price.textContent = `${money(car.price)} / ditë`;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn";
  button.textContent = "ZGJIDH KËTË MAKINË";

  button.addEventListener("click", () => {
    selectedCar.value = car.id;
    selectedCar.dispatchEvent(new Event("change"));

    document.getElementById("booking").scrollIntoView({
      behavior: "smooth"
    });
  });

  info.append(title, details, price, button);
  card.append(gallery, info);
  carGrid.appendChild(card);

  const option = document.createElement("option");
  option.value = car.id;
  option.textContent = car.name;
  selectedCar.appendChild(option);
});

Object.entries(deliveryPrices).forEach(([place, price]) => {
  const option = document.createElement("option");
  option.value = place;
  option.textContent = `${place} — ${money(price)}`;
  deliveryLocation.appendChild(option);
});

const now = new Date();

const localToday = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0")
].join("-");

pickupDate.min = localToday;
returnDate.min = localToday;

pickupDate.addEventListener("change", () => {
  returnDate.min = pickupDate.value || localToday;

  if (returnDate.value && returnDate.value < pickupDate.value) {
    returnDate.value = "";
  }
});

function summary() {
  const car = cars.find(c => c.id === selectedCar.value);

  const start =
    pickupDate.value && pickupTime.value
      ? new Date(`${pickupDate.value}T${pickupTime.value}`)
      : null;

  const finish =
    returnDate.value && returnTime.value
      ? new Date(`${returnDate.value}T${returnTime.value}`)
      : null;

  const days =
    start && finish && finish > start
      ? Math.ceil((finish - start) / 86400000)
      : 0;

  const rent = days * (car?.price || 0);

  const delivery = deliveryLocation.value
    ? deliveryPrices[deliveryLocation.value]
    : 0;

  document.getElementById("summaryCar").textContent =
    car?.name || "-";

  document.getElementById("summaryDays").textContent = days;

  document.getElementById("summaryRental").textContent =
    money(rent);

  document.getElementById("summaryDelivery").textContent =
    money(delivery);

  document.getElementById("summaryTotal").textContent =
    money(rent + delivery);

  document.getElementById("deliveryPrice").textContent =
    deliveryLocation.value
      ? `Transporti: ${money(delivery)}`
      : "Zgjidh vendin për të parë çmimin.";

  return {
    days,
    rent,
    delivery,
    total: rent + delivery
  };
}

[
  selectedCar,
  pickupDate,
  returnDate,
  pickupTime,
  returnTime,
  deliveryLocation
].forEach(element => {
  element.addEventListener("change", summary);
  element.addEventListener("input", summary);
});

bookingForm.addEventListener("submit", async event => {
  event.preventDefault();

  const totals = summary();

  if (
    !totals.days ||
    !selectedCar.value ||
    !deliveryLocation.value
  ) {
    message.textContent =
      "Kontrollo makinën, vendin, datat dhe orët.";
    return;
  }

  const car = cars.find(c => c.id === selectedCar.value);

  const reservation = {
    car: car.name,
    name: document.getElementById("customerName").value.trim(),
    phone: document.getElementById("customerPhone").value.trim(),
    pickup: pickupDate.value,
    returnDate: returnDate.value,
    pickupTime: pickupTime.value,
    returnTime: returnTime.value,
    deliveryLocation: deliveryLocation.value,
    notes: document.getElementById("notes").value.trim()
  };

  const button = bookingForm.querySelector(
    'button[type="submit"]'
  );

  button.disabled = true;
  message.textContent = "Duke dërguar rezervimin...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(reservation)
    });

    if (!response.ok) {
      throw new Error("Gabim gjatë komunikimit me serverin.");
    }

    const data = await response.json();

    if (data.success) {
      message.textContent =
        `Rezervimi u regjistrua! ID: ${data.id}. ` +
        `Totali: ${money(data.total)}. Ruaje ID-në.`;

      bookingForm.reset();
      returnDate.min = localToday;
      summary();
    } else {
      message.textContent =
        data.message || "Rezervimi nuk u krye.";
    }
  } catch (error) {
    message.textContent =
      "Gabim gjatë dërgimit. Kontrollo rezervimin para se ta provosh përsëri.";
  } finally {
    button.disabled = false;
  }
});

const checkBookingForm =
  document.getElementById("checkBookingForm");

const bookingResult =
  document.getElementById("bookingResult");

checkBookingForm.addEventListener("submit", async event => {
  event.preventDefault();

  const id = document.getElementById("bookingId").value.trim();
  const phone = document.getElementById("bookingPhone").value.trim();

  bookingResult.textContent = "Duke kontrolluar...";

  try {
    const url =
      API_URL +
      "?lookup=reservation" +
      "&id=" + encodeURIComponent(id) +
      "&phone=" + encodeURIComponent(phone);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Gabim gjatë komunikimit.");
    }

    const data = await response.json();

    if (!data.success) {
      const errorBox = document.createElement("div");
      errorBox.className = "booking-error";
      errorBox.textContent =
        data.message || "Rezervimi nuk u gjet.";

      bookingResult.replaceChildren(errorBox);
      return;
    }

    const reservation = data.reservation;

    const statusNames = {
      PENDING: "🟡 Në pritje",
      CONFIRMED: "✅ Konfirmuar",
      CANCELLED: "❌ Anuluar"
    };

    const card = document.createElement("div");
    card.className = "reservation-card";

    const heading = document.createElement("h3");
    heading.textContent = "Rezervimi juaj";
    card.appendChild(heading);

    const fields = [
      ["ID", reservation.id],
      ["Makina", reservation.car],
      ["Data e marrjes", reservation.pickup],
      ["Ora e marrjes", reservation.pickupTime],
      ["Data e kthimit", reservation.returnDate],
      ["Ora e kthimit", reservation.returnTime],
      ["Vendi", reservation.deliveryLocation],
      [
        "Totali",
        reservation.total != null
          ? money(reservation.total)
          : "-"
      ],
      [
        "Statusi",
        statusNames[reservation.status] ||
        reservation.status ||
        "-"
      ]
    ];

    fields.forEach(([label, value]) => {
      const p = document.createElement("p");
      const strong = document.createElement("strong");

      strong.textContent = `${label}: `;

      p.append(
        strong,
        document.createTextNode(String(value ?? "-"))
      );

      card.appendChild(p);
    });

    bookingResult.replaceChildren(card);

  } catch (error) {
    const errorBox = document.createElement("div");
    errorBox.className = "booking-error";
    errorBox.textContent =
      "Ndodhi një gabim gjatë kontrollit të rezervimit.";

    bookingResult.replaceChildren(errorBox);
  }
});

document.getElementById("year").textContent =
  new Date().getFullYear();
