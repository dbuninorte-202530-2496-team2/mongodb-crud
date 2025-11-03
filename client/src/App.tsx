import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import  BooksPage  from './pages/BooksPage'
import { BookPage } from './pages/BookPage'

function App() {
  
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/'>
        <Route index element={<BooksPage/>}></Route>
        <Route path='book/:id' element={<BookPage/>}> </Route>
      </Route>
    )
  )

  return <RouterProvider router={router}/>
}

export default App
