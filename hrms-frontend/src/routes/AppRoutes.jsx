import {

Routes,

Route

}

from "react-router-dom"

import Login from "../auth/Login"

import Signup from "../auth/Signup"

import Dashboard from "../pages/dashboard/Dashboard"

function AppRoutes(){

return(

<Routes>

<Route

path="/sign-in/*"

element={<Login/>}

/>

<Route

path="/sign-up/*"

element={<Signup/>}

/>

<Route

path="/dashboard"

element={<Dashboard/>}

/>

</Routes>

)

}

export default AppRoutes