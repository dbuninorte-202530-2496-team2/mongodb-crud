const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors())
app.use(express.json());

let autores = [];

let libros = [];

// -------------- Autor Routes --------------

app.get('/api/autores', (req,res) => {
    res.send(autores)
})

//  Buscar autor por id
app.get('/api/autores/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const autor = autores.find(a => a.id === id);

  if (!autor) return res.status(404).json({ error: 'Autor no encontrado' });
  res.json(autor);
});

// POST new Autores
app.post('/api/autores', (req, res) => {
  const newAutor = { id: autores.length + 1, ...req.body };
  autores.push(newAutor);
  console.log(autores)
  res.status(201).json(newAutor);
});

// PUT update Autores
app.put('/api/autores/:id', (req, res) => {
  const id = parseInt(req.params.id);

  let autorEncontrado = false;
  autores = autores.map(a => {
    if (a.id === id) {
      autorEncontrado = true;
      return { ...a, ...req.body };
    }
    return a;
  });

  if (!autorEncontrado) {
    console.log("Autor no encontrado:", req.params.name);
    return res.status(404).json({ message: 'Autor no encontrado' });
  }

  console.log("Autores actualizados:", autores);
  res.json({ message: 'Autor actualizado correctamente', autores });

});

// DELETE Autores
app.delete('/api/autores/:id', (req, res) => {
  const id = req.params.id
  autores = autores.filter(a => a.id !== id);
  res.json({ message: 'Autor deleted' });
});

// -------------- Libros Routes --------------

// POST — Crear un nuevo libro
app.post('/api/libros', (req, res) => {
  const { titulo, autoresSeleccionados } = req.body;

  if (!titulo) {
    return res.status(400).json({ error: 'El título del libro es obligatorio' });
  }

  // Valida que los autores existan
  const autoresValidos = autores.filter(a =>
    autoresSeleccionados.includes(a.id)
  );

  const nuevoLibro = {
    id: libros.length + 1,
    titulo,
    autores: autoresValidos,
  };

  libros.push(nuevoLibro);
  console.log("Libro agregado:", nuevoLibro);

  res.status(201).json(nuevoLibro);
});

// ✅ GET — Obtener todos los libros
app.get('/api/libros', (req, res) => {
  res.json(libros);
});

// Default route
app.get('/', (req, res) => {
  res.send('Hello from our server!');
});

app.listen(8080, () => {
    console.log('Server listening on port 8080')
})
