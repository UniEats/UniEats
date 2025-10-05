import { Redirect, Route, Switch } from "wouter";

import { LoginScreen } from "@/screens/LoginScreen";
import { MainScreen } from "@/screens/MainScreen";
import { SignupScreen } from "@/screens/SignupScreen";
import { useToken, 
  //useUserRole 
} from "@/services/TokenContext";

import { MenuScreen } from "./screens/MenuScreen";

export const Navigation = () => {
  const [tokenState] = useToken();
  //const userRole = useUserRole();

  switch (tokenState.state) {
    case "LOGGED_IN":
    case "REFRESHING":
      return (
        // TO restringe access to certain routes based on user role
            // {userRole === "ROLE_ADMIN" && (
            // <></> )}
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
