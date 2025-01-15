const buscador = document.getElementsByClassName("buscador-input")[0]; 
const boton = document.getElementsByClassName("boton-buscar")[0]; 
const reiniciar = document.getElementsByClassName("boton-reiniciar")[0];

// Página y navegación
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

const cargarPersonajes = async (searchTerm = "") => {
  try {
    let url = "";
    if (searchTerm === "") {
      url = `https://swapi.py4e.com/api/people/?page=${pagina}`;
    } else {
      url = `https://swapi.py4e.com/api/people/?search=${searchTerm}&page=${pagina}`;
    }

    let respuesta = await fetch(url);

    if (respuesta.ok) {
      const datos = await respuesta.json();
      const personajes = datos.results;

      let personajesHTML = "";

      for (const personaje of personajes) {
        if (personaje.name === "Wedge Antilles") {
          continue; // Elimina este personaje específico
        }

        // Obtener el nombre del planeta
        const homeworld = await fetch(personaje.homeworld);
        const homeworldData = await homeworld.json();
        const planetaNombre = homeworldData.name;

        // Obtener las películas
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
    console.error("Error al realizar la solicitud:", error);
    document.getElementById("contenedor").innerHTML = "<p>Error al cargar los personajes.</p>";
  }
};

// Iniciar la carga de personajes
cargarPersonajes();

// Función para buscar personajes
const buscarPersonajes = () => {
  const searchTerm = buscador.value; 
  pagina = 1;  // Al hacer una nueva búsqueda, siempre volvemos a la página 1
  cargarPersonajes(searchTerm); 
};

// Función para reiniciar la búsqueda
const reiniciarpagina = () => {
  const searchTerm = "";  // Resetear la búsqueda
  buscador.value = "";
  pagina = 1;  // Volver a la página 1 al reiniciar
  cargarPersonajes(searchTerm);
}

// Agregar el evento a los botones
boton.addEventListener("click", buscarPersonajes);
reiniciar.addEventListener("click", reiniciarpagina);
