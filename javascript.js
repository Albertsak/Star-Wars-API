const buscador = document.getElementsByClassName("buscador-input")[0];
let controller;

async function buscar() {
  if (controller) {
    controller.abort(); 
  }
  controller = new AbortController(); 
}

buscador.addEventListener("input", () => {
  const texto = buscador.value.toLowerCase().trim();
  cargarPersonajes(texto);
});

const cargarPersonajes = async (texto = "") => {
  try {
    await buscar(); 

    let url = "";
    if (texto === "") {
      url = `https://swapi.py4e.com/api/people/?page=${pagina}`;
    } else {
      url = `https://swapi.py4e.com/api/people/?search=${texto}&page=${pagina}`;
    }

    const respuesta = await fetch(url, { signal: controller.signal });

    if (respuesta.ok) {
      const datos = await respuesta.json();
      const personajes = datos.results;

      let personajesHTML = "";

      for (const personaje of personajes) {
        if (personaje.name === "Wedge Antilles") {
          continue; // Excluye a Wedge Antilles
        }

        const homeworld = await fetch(personaje.homeworld);
        const homeworldData = await homeworld.json();
        const planetaNombre = homeworldData.name;

        const peliculas = await Promise.all(
          personaje.films.map(async (filmUrl) => {
            const filmResponse = await fetch(filmUrl);
            const filmData = await filmResponse.json();
            return filmData.title;
          })
        );

        const characterId = personaje.url.match(/\/(\d+)\/$/)[1];
        const imagen = `${baseImageUrl}${characterId}.jpg`;

        personajesHTML += `
          <div class="personaje">
            <div class="info">
              <h3>${personaje.name}</h3>
              <p><strong>Altura:</strong> ${personaje.height} cm</p>
              <p><strong>Peso:</strong> ${personaje.mass} kg</p>
              <p><strong>Género:</strong> ${personaje.gender}</p>
              <p><strong>Planeta:</strong> ${planetaNombre}</p>
              <p><strong>Películas:</strong> ${peliculas.join(" | ")}</p>
            </div>
            <img 
              src="${imagen}" 
              alt="${personaje.name}" 
              class="imagen-personaje" 
              onerror="this.src='${placeholderImagen}'"
            />
          </div>
        `;
      }

      document.getElementById("contenedor").innerHTML = personajesHTML;

    } else {
      console.error("Error al cargar los datos:", respuesta.status);
      document.getElementById("contenedor").innerHTML = "<p>Error al cargar los personajes.</p>";
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("La solicitud fue cancelada.");
    } else {
      console.error("Error al realizar la solicitud:", error);
      document.getElementById("contenedor").innerHTML = "<p>Error al cargar los personajes.</p>";
    }
  }
};

// Paginación
let pagina = 1;
const btnAnterior = document.getElementById("btnAnterior");
const btnSiguiente = document.getElementById("btnSiguiente");

btnSiguiente.addEventListener("click", () => {
  pagina += 1;
  cargarPersonajes();
});

btnAnterior.addEventListener("click", () => {
  if (pagina > 1) {
    pagina -= 1;
    cargarPersonajes();
  }
});

const baseImageUrl = "https://starwars-visualguide.com/assets/img/characters/";
const placeholderImagen = "https://via.placeholder.com/150";

// Carga inicial de los personajes
cargarPersonajes();
