import React, { useState, useEffect } from "react";
import { CssBaseline } from "@material-ui/core";
import { commerce } from "../lib/commerce";
import Products from "./Products/Products";
import ProductView from "./ProductView/ProductView";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
const Dashboard = () => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    const { data } = await commerce.products.list();

    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <Router>
        <div style={{ display: "flex" }}>
          <CssBaseline />
          <Switch>
            <Route exact path="/">
              <Products products={products} />
            </Route>
            <Route path="/product-view/:id" exact>
              <ProductView />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
};

export default Dashboard;
