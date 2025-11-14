import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import Home from "../pages/Home";
import AssetDetail from "../pages/AssetDetail";
import AddAsset from "../pages/AddAsset";
import EditAsset from "../pages/EditAsset";
import { rootPath } from "../../config";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: "add-asset",
          element: <AddAsset />,
        },
        {
          path: "assets/:id",
          element: <AssetDetail />,
        },
        {
          path: "edit-asset/:id",
          element: <EditAsset />,
        },
      ],
    },
  ],
  {
    basename: `/${rootPath}`,
  }
);