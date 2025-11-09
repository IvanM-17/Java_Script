const selectProvincia = document.getElementById("selectProvincia"); 
const btnBuscar = document.getElementById("btnBuscar");
const resultado = document.getElementById("resultado");
const ctx = document.getElementById("graficoTemperatura");
const listaFavoritos = document.getElementById("listaFavoritos");
let grafico = null;

// Carga de datos 
let datosClima = [];

//Cargar favoritos (Local-Storage)
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

//Funcion para mostrar los favoritos
function mostrarFavoritos() {
  listaFavoritos.innerHTML = "";
  if (favoritos.length === 0) {
    listaFavoritos.innerHTML = "<p>No hay provincias favoritas.</p>";
    return;
  }

  favoritos.forEach((fav, index) => {
    const li = document.createElement("li");
    li.textContent = fav;
    li.classList.add("favorito-item");

    //Reenvio de datos
    li.addEventListener("click", () => {
      mostrarClima(fav);
    });

    //Boton eliminar favorito
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "❌";
    btnEliminar.classList.add("btnEliminar");
    btnEliminar.addEventListener("click", (e) => {
      e.stopPropagation(); 

      Swal.fire({
        title: "¿Eliminar de favoritos?",        
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0077ff",
        cancelButtonColor: "#aaa",
        confirmButtonText: "Si, eliminar",
        cancelButtonText: "Cancelar"
      }).then((result) => {
        if (result.isConfirmed) {
          favoritos.splice(index, 1);
          localStorage.setItem("favoritos", JSON.stringify(favoritos));
          mostrarFavoritos();

          Swal.fire({
            icon: "success",           
            text: `${fav} fue quitada de favoritos.`,
            timer: 1500,
            showConfirmButton: false
          });
        }
      });
    });

    li.appendChild(btnEliminar);
    listaFavoritos.appendChild(li);
  });
}

//Mostrar favoritos al cargar
mostrarFavoritos();

//Cargar datos del JSON
fetch("./json/dates.json")
  .then(res => res.json())
  .then(data => {
    datosClima = data;

    //Llenar select con provincias
    datosClima.forEach(prov => {
      const option = document.createElement("option");
      option.value = prov.ciudad;
      option.textContent = prov.ciudad;
      selectProvincia.appendChild(option);
    });
  })
.catch(error => console.error("Error cargando datos:", error));

// Evento botón Buscar
btnBuscar.addEventListener("click", () => {
  const ciudadSeleccionada = selectProvincia.value;
  if (!ciudadSeleccionada) {
    Swal.fire({
      icon: "info",
      title: "Seleccione una provincia",
      text: "Debe elegir una provincia antes de continuar."
    });
    if (grafico) grafico.destroy();
    return;
  }
  mostrarClima(ciudadSeleccionada);
});

//Funcion DATOS
function mostrarClima(ciudadSeleccionada) {
  const clima = datosClima.find(c => c.ciudad === ciudadSeleccionada);

  if (!clima) {
    Swal.fire({
      icon: "error",
      title: "Sin datos",
      text: `No hay informacion disponible para ${ciudadSeleccionada}.`
    });
    if (grafico) grafico.destroy();
    return;
  }

  resultado.innerHTML = `
    <h2>${clima.ciudad}</h2>
    <p>🌡️ Temperatura Actual: ${clima.temperatura[clima.temperatura.length - 1]}°C</p>
    <p>💧 Humedad: ${clima.humedad}%</p>
    <p>☁️ Estado: ${clima.descripcion}</p>
    <button id="btnFavorito">⭐ Agregar a Favoritos</button>
  `;

  // Evento agregar a favoritos
  const btnFavorito = document.getElementById("btnFavorito");
  btnFavorito.addEventListener("click", () => {
    if (!favoritos.includes(ciudadSeleccionada)) {
      favoritos.push(ciudadSeleccionada);
      localStorage.setItem("favoritos", JSON.stringify(favoritos));
      mostrarFavoritos();

      Swal.fire({
        icon: "success",
        title: "Agregado a favoritos",
        text: `${ciudadSeleccionada} se guardo correctamente.`,
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: "info",        
        text: `${ciudadSeleccionada} ya esta en tu lista de favoritos.`
      });
    }
  });

  // Chart.js
  if (grafico) grafico.destroy();
  grafico = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
      datasets: [{
        label: "Temperatura (°C)",
        data: clima.temperatura,
        borderColor: "#0077ff",
        borderWidth: 2,
        fill: false,
        tension: 0.2
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: false }
      }
    }
  });
}
