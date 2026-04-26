import SignInPage from "@controleonline/ui-login/src/react/pages/sign-in";
import CreateAccount from "@controleonline/ui-login/src/react/pages/create-account";
import ResetPasswordPage from "@controleonline/ui-login/src/react/pages/reset-password";
const loginRoutes = [
  {
    name: "SignInPage",
    component: SignInPage,
    options: { headerShown: false },
  },

  {
    name: "CreateAccount",
    component: CreateAccount,
    options: { headerShown: false },
  },
  {
    name: "ResetPasswordPage",
    path: "reset-password",
    component: ResetPasswordPage,
    options: { headerShown: false },
  },
  
];

export default loginRoutes;
