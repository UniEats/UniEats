import { Redirect, Route, Switch } from "wouter";

import { LoginScreen } from "@/screens/LoginScreen";
import { MainScreen } from "@/screens/MainScreen";
import { SignupScreen } from "@/screens/SignupScreen";
import { useToken, useUserRole } from "@/services/TokenContext";
import { CartView } from "@/components/Cart/CartView";
import { KitchenOrders } from "@/components/KitchenOrders/KitchenOrders";
import { CommonLayout } from "@/components/CommonLayout/CommonLayout";

import { MenuScreen } from "./screens/MenuScreen";
import { VerifyScreen } from "./screens/VerifyScreen";
import { ForgotPasswordScreen } from "./screens/ForgotPasswordScreen";
import { ResetPasswordScreen } from "./screens/ResetPasswordScreen";

export const Navigation = () => {
  const [tokenState] = useToken();
  const userRole = useUserRole();

  const KitchenRouteGuard = () => {
    if (tokenState.state === "LOGGED_OUT") {
      return <Redirect href="/login" />;
    }
    if (tokenState.state === "REFRESHING") {
      return <div />; 
    }
    if (userRole === "ROLE_STAFF") {
      return (
        <CommonLayout>
          <KitchenOrders />
        </CommonLayout>
      );
    }
    return <Redirect href="/" />;
  };

  switch (tokenState.state) {
    case "LOGGED_IN":
    case "REFRESHING":
      return (
        <Switch>
          <Route path="/menu">
            {userRole === "ROLE_STAFF" ? <Redirect href="/kitchen" /> : <MenuScreen />}
          </Route>
          <Route path="/cart">
            {userRole === "ROLE_STAFF" ? <Redirect href="/kitchen" /> : <CartView />}
          </Route>
          <Route path="/kitchen">
            <KitchenRouteGuard />
          </Route>
          <Route path="/">
            {userRole === "ROLE_STAFF" ? <Redirect href="/kitchen" /> : <MainScreen />}
          </Route>
          <Route>
            <Redirect href="/" />
          </Route>
        </Switch>
      );
    case "LOGGED_OUT":
      return (
        <Switch>
          <Route path="/login">
            <LoginScreen />
          </Route>
          <Route path="/signup">
            <SignupScreen />
          </Route>
          <Route path="/forgot-password">
            <ForgotPasswordScreen />
          </Route>
          <Route path="/reset-password">
            <ResetPasswordScreen />
          </Route>
          <Route path="/verify">
            <VerifyScreen />
          </Route>
          <Route>
            <Redirect href="/signup" />
          </Route>
        </Switch>
      );
    default:
      return tokenState satisfies never;
  }
};
