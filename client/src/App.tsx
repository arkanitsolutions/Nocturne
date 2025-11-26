import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "sonner";
import NotFound from "@/pages/not-found";
import ShopPremium from "@/pages/shop-premium";
import ProductDetail from "@/pages/product-detail";
import Wishlist from "@/pages/wishlist";
import CartPremium from "@/pages/cart-premium";
import CheckoutPremium from "@/pages/checkout-premium";
import ProfilePremium from "@/pages/profile-premium";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ShopPremium} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/cart" component={CartPremium} />
      <Route path="/checkout" component={CheckoutPremium} />
      <Route path="/profile" component={ProfilePremium} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Sonner position="top-center" theme="dark" />
      <Router />
    </QueryClientProvider>
  );
}

export default App;