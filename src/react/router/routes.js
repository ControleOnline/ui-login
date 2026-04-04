import SignInPage from "@controleonline/ui-login/src/react/pages/sign-in";
import CreateAccount from "@controleonline/ui-login/src/react/pages/create-account";
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
  
];

export default loginRoutes;