import { Redirect, Route, Switch } from "wouter";

import { LoginScreen } from "@/screens/LoginScreen";
import { MainScreen } from "@/screens/MainScreen";
import { SignupScreen } from "@/screens/SignupScreen";
import { useToken } from "@/services/TokenContext";

import { MenuScreen } from "./screens/MenuScreen";
import { VerifyScreen } from "./screens/VerifyScreen";
import { ForgotPasswordScreen } from "./screens/ForgotPasswordScreen";
import { ResetPasswordScreen } from "./screens/ResetPasswordScreen";

export const Navigation = () => {
  const [tokenState] = useToken();

  switch (tokenState.state) {
    case "LOGGED_IN":
    case "REFRESHING":
      return (
        <Switch>
          <Route path="/menu">
            <MenuScreen />
          </Route>
          <Route path="/">
            <MainScreen />
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
      // Make the compiler check this is unreachable
      return tokenState satisfies never;
  }
};
