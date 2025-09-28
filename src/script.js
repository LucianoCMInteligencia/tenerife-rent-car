document.addEventListener("DOMContentLoaded", () => {
  // 🚗 Datos de los coches
  const carsData = {
    "Toyota Corolla": { img: "./img/corolla.jpg", precio: 45 },
    "Volkswagen Golf": { img: "./img/golf.jpg", precio: 50 },
    "Ford Fiesta": { img: "./img/fiesta.jpg", precio: 40 },
    "Seat Ibiza": { img: "./img/ibiza.jpg", precio: 42 },
    "Renault Clio": { img: "./img/clio.jpg", precio: 43 },
    "Opel Astra": { img: "./img/astra.jpg", precio: 47 },
    "Hyundai Tucson": { img: "./img/tucson.jpg", precio: 60 },
    "Kia Sportage": { img: "./img/sportage.jpg", precio: 58 },
    "Peugeot 3008": { img: "./img/3008.jpg", precio: 62 },
    "BMW Serie 1": { img: "./img/bmw1.jpg", precio: 75 }
  };

  // 🧠 Registro de actividad
  function logActivity(action, user) {
    const logs = JSON.parse(localStorage.getItem("logs")) || [];
    logs.push({ action, user, timestamp: new Date().toISOString() });
    localStorage.setItem("logs", JSON.stringify(logs));
  }

  // 🟦 INDEX.HTML – Selección de coche
  const form = document.getElementById("car-selection-form");
  if (form) {
    const carList = form.querySelector(".car-list");
    Object.keys(carsData).forEach(car => {
      const label = document.createElement("label");
      label.innerHTML = `<input type="checkbox" name="car" value="${car}"> ${car}`;
      carList.appendChild(label);
    });

    form.addEventListener("change", (event) => {
      if (event.target.type === "checkbox") {
        form.querySelectorAll("input[type=checkbox]").forEach(cb => {
          if (cb !== event.target) cb.checked = false;
        });

        const carName = event.target.value;
        if (event.target.checked) {
          window.location.href = `detalles.html?car=${encodeURIComponent(carName)}`;
        }
      }
    });
  }

  // 🟨 DETALLES.HTML – Formulario de reserva
  const detailsContainer = document.getElementById("car-details");
  const reservationContainer = document.getElementById("reservation-form");

  if (detailsContainer && reservationContainer) {
    const params = new URLSearchParams(window.location.search);
    const car = params.get("car");
    const carInfo = carsData[car];

    if (carInfo) {
      const { img, precio } = carInfo;

      detailsContainer.innerHTML = `
        <h2>${car}</h2>
        <img src="${img}" alt="${car}" loading="lazy">
        <p><strong>Precio base:</strong> ${precio} €/día</p>
        <div class="options">
          <label><input type="checkbox" class="extra" value="5"> Caja Automática (+5€/día)</label>
          <label><input type="checkbox" class="extra" value="3"> GPS Incluido (+3€/día)</label>
          <label><input type="checkbox" class="extra" value="4"> Silla Infantil (+4€/día)</label>
        </div>
      `;

      reservationContainer.innerHTML = `
        <h3>Reserva tu ${car}</h3>
        <label>Días de alquiler:<input type="number" id="dias" min="1" value="1"></label>
        <label>Nombre completo:<input type="text" id="nombre" placeholder="Tu nombre"></label>
        <label>Email:<input type="email" id="email" placeholder="tu@email"></label>
        <label>Teléfono:<input type="tel" id="telefono" placeholder="Tu teléfono"></label>
        <button id="btn-calcular">Calcular precio</button>
        <button id="btn-reservar">Confirmar reserva</button>
        <div id="resultado" class="result"></div>
        <div id="confirmacion" class="confirmation"></div>
      `;

      document.getElementById("btn-calcular").addEventListener("click", () => {
        const dias = parseInt(document.getElementById("dias").value) || 1;
        const nombre = document.getElementById("nombre").value.trim();
        let precioTotal = precio * dias;

        document.querySelectorAll(".extra:checked").forEach(extra => {
          precioTotal += parseInt(extra.value) * dias;
        });

        const resultado = document.getElementById("resultado");
        resultado.innerHTML = nombre
          ? `✅ Hola <strong>${nombre}</strong>, el precio total es <strong>${precioTotal} €</strong> por ${dias} día(s).`
          : `ℹ️ El precio total es <strong>${precioTotal} €</strong> por ${dias} día(s).`;
      });

      document.getElementById("btn-reservar").addEventListener("click", () => {
        const dias = parseInt(document.getElementById("dias").value) || 1;
        const nombre = document.getElementById("nombre").value.trim();
        const email = document.getElementById("email").value.trim();
        const telefono = document.getElementById("telefono").value.trim();

        if (!nombre || !email || !telefono) {
          alert("Por favor completa todos los campos.");
          return;
        }

        // 🔄 Recalcular precio total
        let precioTotal = precio * dias;
        document.querySelectorAll(".extra:checked").forEach(extra => {
          precioTotal += parseInt(extra.value) * dias;
        });

        const reserva = { coche: car, dias, nombre, email, telefono, precioTotal };
        const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
        reservas.push(reserva);
        localStorage.setItem("reservas", JSON.stringify(reservas));
        logActivity("reserva", nombre);

        document.getElementById("confirmacion").innerHTML = `
          🎉 Gracias <strong>${nombre}</strong>, tu reserva del <strong>${car}</strong> ha sido confirmada.<br>
          Precio total: <strong>${precioTotal} €</strong>.<br>
          Te hemos registrado con email: <strong>${email}</strong> y teléfono: <strong>${telefono}</strong>.
        `;

        setTimeout(() => {
          window.location.href = "admin.html";
        }, 3000);
      });
    } else {
      detailsContainer.innerHTML = `<p>No se encontró el vehículo seleccionado.</p>`;
    }
  }

  // 🟥 ADMIN.HTML – Panel de administración
  const loginPanel = document.getElementById("login-panel");
  const adminPanel = document.getElementById("admin-panel");
  const btnLogin = document.getElementById("btn-login");
  const btnLogout = document.getElementById("btn-logout");
  const loginError = document.getElementById("login-error");
  const reservasContainer = document.getElementById("reservas-lista");
  const btnExportar = document.getElementById("btn-exportar");

  function mostrarReservas() {
    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    reservasContainer.innerHTML = "";

    if (reservas.length === 0) {
      reservasContainer.innerHTML = "<p>❌ No hay reservas registradas.</p>";
      return;
    }

    reservas.forEach((reserva, index) => {
      const card = document.createElement("div");
      card.classList.add("reserva-card");
      card.innerHTML = `
        <p><strong>Vehículo:</strong> ${reserva.coche}</p>
        <p><strong>Días:</strong> ${reserva.dias}</p>
        <p><strong>Cliente:</strong> ${reserva.nombre}</p>
        <p><strong>Email:</strong> ${reserva.email}</p>
        <p><strong>Teléfono:</strong> ${reserva.telefono}</p>
        <p><strong>Precio Total:</strong> ${reserva.precioTotal} €</p>
        <button class="btn-eliminar" data-index="${index}">🗑 Eliminar</button>
      `;
      reservasContainer.appendChild(card);
    });

    activarBotonesEliminar();
  }

  function activarBotonesEliminar() {
    const botones = document.querySelectorAll(".btn-eliminar");
    botones.forEach(btn => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.getAttribute("data-index"));
        const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
        reservas.splice(index, 1);
        localStorage.setItem("reservas", JSON.stringify(reservas));
        logActivity("eliminación", "admin");
        mostrarReservas();
      });
    });
  }

  // 🔐 Login admin
  if (btnLogin) {
    btnLogin.addEventListener("click", () => {
      const user = document.getElementById("usuario").value.trim();
      const pass = document.getElementById("password").value.trim();

      if (user === "admin" && pass === "1234") {
        localStorage.setItem("adminLogged", "true");
        loginPanel.style.display = "none";
        adminPanel.style.display = "block";
        mostrarReservas();
      } else {
        loginError.textContent = "❌ Usuario o contraseña incorrectos.";
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("adminLogged");
      loginPanel.style.display = "block";
      adminPanel.style.display = "none";
    });
  }

  // Mantener sesión si ya está logueado
  if (loginPanel && adminPanel) {
    if (localStorage.getItem("adminLogged") === "true") {
      loginPanel.style.display = "none";
      adminPanel.style.display = "block";
      mostrarReservas();
    } else {
      loginPanel.style.display = "block";
      adminPanel.style.display = "none";
    }
  }
});
const btnVolverInicio = document.getElementById("btn-volver-inicio");

if (btnVolverInicio) {
  btnVolverInicio.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}
// 🔄 Recargar lista manualmente
const btnRecargar = document.getElementById("btn-recargar");
if (btnRecargar) {
  btnRecargar.addEventListener("click", () => {
    mostrarReservas();
  });
}

// 📥 Exportar reservas a CSV
const btnExportar = document.getElementById("btn-exportar");
if (btnExportar) {
  btnExportar.addEventListener("click", () => {
    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    if (reservas.length === 0) {
      alert("No hay reservas para exportar.");
      return;
    }

    const headers = ["Vehículo", "Días", "Cliente", "Email", "Teléfono", "Precio Total"];
    const rows = reservas.map(r => [r.coche, r.dias, r.nombre, r.email, r.telefono, r.precioTotal]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reservas.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

// 🗑 Eliminar todas las reservas
const btnEliminarTodo = document.getElementById("btn-eliminar-todo");
if (btnEliminarTodo) {
  btnEliminarTodo.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que quieres eliminar todas las reservas?")) {
      localStorage.removeItem("reservas");
      logActivity("eliminación total", "admin");
      mostrarReservas();
    }
  });
}

// 📄 Ver actividad (logs)
const btnVerLogs = document.getElementById("btn-ver-logs");
const logsPanel = document.getElementById("logs-panel");
const logsLista = document.getElementById("logs-lista");

if (btnVerLogs && logsPanel && logsLista) {
  btnVerLogs.addEventListener("click", () => {
    const logs = JSON.parse(localStorage.getItem("logs")) || [];
    logsLista.innerHTML = "";

    if (logs.length === 0) {
      logsLista.innerHTML = "<li>No hay actividad registrada.</li>";
    } else {
      logs.forEach(log => {
        const item = document.createElement("li");
        item.textContent = `${log.timestamp} — ${log.user} hizo: ${log.action}`;
        logsLista.appendChild(item);
      });
    }

    logsPanel.style.display = "block";
  });
}
// 🔙 Botón "Volver al inicio" en admin.html
const btnVolver = document.getElementById("btn-volver");
if (btnVolver) {
  btnVolver.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}
