import { createBrowserRouter } from "react-router-dom";
import About from "./components/About";
import Break from "./components/Break";
import Duck from "./components/Duck";
import Navbar from "./components/Navbar";

const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Navbar />
        <About />
      </>
    ),
  },
  {
    path: "/about",
    element: (
      <>
        <Navbar />
        <About />
      </>
    ),
  },
  {
    path: "/break",
    element: (
      <>
        <Navbar />
        <Break />
      </>
    ),
  },
  {
    path: "/duck",
    element: (
      <>
        <Navbar />
        <Duck />
      </>
    ),
  },
]);

export default AppRouter;
