import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Outlet } from 'react-router-dom'
import { Toaster } from 'sonner';

import BooksPage from './pages/BooksPage'
import { CreateBookPage } from './pages/CreateBookPage'
        import { BookPage } from './pages/BookPage'

function Layout() {
  return (
    <>
      <Toaster position='top-right' richColors />
      <Outlet />
    </>
  )
}

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<Layout />}>
        <Route index element={<BooksPage />} />
        <Route path='create-book' element={<CreateBookPage />} />
        <Route path='book/:id' element={<BookPage/>} /> 
      </Route>
    )
  )

  return <RouterProvider router={router} />;
}

export default App