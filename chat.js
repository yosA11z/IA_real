let chats = JSON.parse(localStorage.getItem("chats") || "{}");
let chatActual = null;

function cargarChats() {
  const lista = document.getElementById("listaChats");
  lista.innerHTML = "";

  for (let nombre in chats) {
    const li = document.createElement("li");
    li.innerHTML = `
      <span onclick="abrirChat('${nombre}')">${nombre}</span>
      <div class="acciones">
        <button class="editar" onclick="editarChat(event, '${nombre}')">✎</button>
        <button onclick="eliminarChat(event, '${nombre}')">×</button>
      </div>
    `;
    lista.appendChild(li);
  }

  if (!chatActual || !(chatActual in chats)) {
    const nuevo = "Nuevo Chat";
    if (!chats[nuevo]) {
      chats[nuevo] = [];
      localStorage.setItem("chats", JSON.stringify(chats));
    }
    abrirChat(nuevo);
  }
}

function nuevoChat() {
  const nombre = prompt("Nombre para este chat:");
  if (!nombre || chats[nombre]) return;

  chats[nombre] = [];
  localStorage.setItem("chats", JSON.stringify(chats));
  cargarChats();
  abrirChat(nombre);
}

function editarChat(event, nombreViejo) {
  event.stopPropagation();
  const nuevoNombre = prompt("Nuevo nombre del chat:", nombreViejo);
  if (!nuevoNombre || chats[nuevoNombre]) return;

  chats[nuevoNombre] = chats[nombreViejo];
  delete chats[nombreViejo];
  localStorage.setItem("chats", JSON.stringify(chats));
  if (chatActual === nombreViejo) chatActual = nuevoNombre;
  cargarChats();
}

function abrirChat(nombre) {
  chatActual = nombre;
  const chatDiv = document.getElementById("chat");
  chatDiv.innerHTML = "";

  if (chats[nombre].length === 0) {
    agregarMensaje("Hola, soy YosIA. ¡Estoy lista para responder tus preguntas!", "ia");
  } else {
    for (const m of chats[nombre]) {
      agregarMensaje(m.texto, m.tipo, false);
    }
  }
}

function eliminarChat(event, nombre) {
  event.stopPropagation();
  if (confirm(`¿Eliminar el chat "${nombre}"?`)) {
    delete chats[nombre];
    localStorage.setItem("chats", JSON.stringify(chats));
    if (chatActual === nombre) chatActual = null;
    cargarChats();
  }
}

function agregarMensaje(texto, tipo, guardar = true) {
  const chatDiv = document.getElementById("chat");
  const div = document.createElement("div");
  div.className = `mensaje ${tipo}`;
  div.textContent = texto;
  chatDiv.appendChild(div);
  chatDiv.scrollTop = chatDiv.scrollHeight;

  if (guardar && chatActual) {
    chats[chatActual].push({ texto, tipo });
    localStorage.setItem("chats", JSON.stringify(chats));
  }
}

async function responder() {
  const input = document.getElementById("pregunta");
  const pregunta = input.value.trim();
  if (!pregunta) return;

  agregarMensaje(pregunta, "usuario");
  input.value = "";

  const respuesta = await obtenerRespuestaGemini(pregunta);
  agregarMensaje(respuesta, "ia");
}

async function obtenerRespuestaGemini(pregunta) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pregunta }),
    });

    const data = await response.json();
    console.log("Respuesta del backend:", data);

    if (data?.respuesta) {
      return data.respuesta;
    } else if (data?.error) {
      return `Error: ${data.error}`;
    } else {
      return "Lo siento, no pude generar una respuesta.";
    }
  } catch (error) {
    console.error("Error al conectarse al backend:", error);
    return "Error de conexión con el servidor backend.";
  }
}

window.onload = () => {
  cargarChats();

  const input = document.getElementById("pregunta");
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      responder();
    }
  });
};
