import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import  BooksPage  from './pages/BooksPage'

function App() {
  
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route index element={<BooksPage/>}></Route>
    )
  )

  return <RouterProvider router={router}/>
}

export default App
