import {
  Route, 
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider} from 'react-router-dom'
import HomePage from './Pages/HomePage';
import MainLayout from './layouts/MainLayout';
import NotFoundPage from './Pages/NotFoundPage';
import CrearLibroPage from './Pages/CrearLibroPage';

function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
    <Route path='/' element={<MainLayout/>}>
      <Route index element = {<HomePage/>}/>
      <Route path="/crearLibro" element= {<CrearLibroPage/>}/>
      <Route path='*' element= {<NotFoundPage/>}/>
    </Route>
    )
  );

  return <RouterProvider router={router}/>
}

export default App